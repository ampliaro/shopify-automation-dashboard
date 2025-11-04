import crypto from 'crypto';
import { getDb } from './db.js';

/**
 * Middleware para capturar raw body necessário para validação HMAC
 */
export function captureRawBody(req, res, next) {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks);
    next();
  });
}

/**
 * Valida HMAC do webhook Shopify
 * Compara usando crypto.timingSafeEqual para evitar timing attacks
 */
export function validateHmac(secret) {
  return (req, res, next) => {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    
    if (!hmacHeader) {
      return res.status(401).json({ error: 'Missing HMAC header' });
    }

    if (!req.rawBody) {
      return res.status(400).json({ error: 'Missing request body' });
    }

    // Calcula HMAC do body recebido
    const calculatedHmac = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('base64');

    // Converte ambos para Buffer para comparação em tempo constante
    const headerHmacBuffer = Buffer.from(hmacHeader, 'base64');
    const calculatedHmacBuffer = Buffer.from(calculatedHmac, 'base64');

    // Validação em tempo constante
    if (headerHmacBuffer.length !== calculatedHmacBuffer.length) {
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    const isValid = crypto.timingSafeEqual(headerHmacBuffer, calculatedHmacBuffer);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    // Parse do body após validação
    try {
      req.body = JSON.parse(req.rawBody.toString('utf-8'));
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    next();
  };
}

/**
 * Middleware de idempotência
 * Rejeita webhooks duplicados baseado no X-Shopify-Webhook-Id
 */
export function checkIdempotency(req, res, next) {
  const webhookId = req.get('X-Shopify-Webhook-Id');

  if (!webhookId) {
    return res.status(400).json({ error: 'Missing Webhook ID header' });
  }

  const db = getDb();

  try {
    // Verifica se já recebemos este webhook
    const existing = db.prepare('SELECT webhook_id FROM webhook_ids WHERE webhook_id = ?').get(webhookId);

    if (existing) {
      console.log(`[IDEMPOTENCY] Rejected duplicate webhook: ${webhookId}`);
      return res.status(200).json({ message: 'Webhook already processed', duplicate: true });
    }

    // Registra o webhook ID
    db.prepare('INSERT INTO webhook_ids (webhook_id, received_at) VALUES (?, datetime("now"))').run(webhookId);

    // Anexa o webhook ID ao request para uso posterior
    req.webhookId = webhookId;

    next();
  } catch (error) {
    console.error('[IDEMPOTENCY] Error:', error.message);
    return res.status(500).json({ error: 'Idempotency check failed' });
  }
}

