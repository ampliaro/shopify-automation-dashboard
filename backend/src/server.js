import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, getDb, getOrders, countOrders } from './db.js';
import { captureRawBody, validateHmac, checkIdempotency } from './hmac.js';
import { processOrder, retryOrder } from './orders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validação de variáveis de ambiente com Zod
const envSchema = z.object({
  SHOPIFY_SHARED_SECRET: z.string().min(1, 'SHOPIFY_SHARED_SECRET is required'),
  FULFILLMENT_URL: z.string().url('FULFILLMENT_URL must be a valid URL'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().default('./data/app.db'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENABLE_MOCK: z.enum(['true', 'false']).default('true'),
});

// Carrega e valida env
let env;
try {
  env = envSchema.parse(process.env);
  console.log('[CONFIG] Environment variables validated successfully');
} catch (error) {
  console.error('[CONFIG] Environment validation failed:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

const app = express();
const PORT = parseInt(env.PORT, 10);

// Inicializa banco de dados (assíncrono com sql.js)
const dbPath = path.resolve(__dirname, '..', env.DATABASE_URL);
await initDb(dbPath);

// CORS restrito ao frontend local
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
}));

// Logger simples de requisições
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// JSON parser para rotas normais
app.use(express.json());

// ============================================================================
// ROTAS
// ============================================================================

/**
 * GET /healthz - Health check
 */
app.get('/healthz', (req, res) => {
  try {
    const db = getDb();
    // Testa conexão com DB
    const stmt = db.prepare('SELECT 1');
    stmt.step();
    stmt.free();
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});

/**
 * POST /webhook/shopify - Recebe webhook do Shopify
 * Usa raw body capture, validação HMAC e idempotência
 */
app.post('/webhook/shopify', captureRawBody, validateHmac(env.SHOPIFY_SHARED_SECRET), checkIdempotency, async (req, res) => {
  try {
    const orderData = req.body;
    const orderId = orderData.id?.toString() || orderData.order_id?.toString();

    if (!orderId) {
      return res.status(400).json({ error: 'Missing order ID in payload' });
    }

    console.log(`[WEBHOOK] Received order ${orderId}`);

    // Processa pedido de forma assíncrona
    processOrder(orderId, orderData, env.FULFILLMENT_URL)
      .catch(error => console.error(`[WEBHOOK] Async processing error:`, error));

    // Retorna 200 imediatamente (Shopify espera resposta rápida)
    res.status(200).json({ 
      message: 'Webhook received', 
      order_id: orderId,
      webhook_id: req.webhookId 
    });
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /orders - Lista pedidos com filtros e paginação
 * Query params: status, limit, offset
 */
app.get('/orders', (req, res) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;

    const filters = {
      status: status || undefined,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    };

    const orders = getOrders(filters);
    const total = countOrders({ status: filters.status });

    res.json({
      orders,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + filters.limit < total,
      }
    });
  } catch (error) {
    console.error('[ORDERS] Error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * POST /orders/:id/retry - Retenta envio de pedido falhado
 */
app.post('/orders/:id/retry', async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log(`[RETRY] Retrying order ${orderId}`);

    const result = await retryOrder(orderId, env.FULFILLMENT_URL);

    if (result.success) {
      res.json({ 
        message: 'Order retry successful', 
        order_id: orderId,
        status: result.status 
      });
    } else {
      res.status(500).json({ 
        error: 'Order retry failed', 
        order_id: orderId,
        details: result.error 
      });
    }
  } catch (error) {
    console.error('[RETRY] Error:', error);
    
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (error.message === 'Only failed orders can be retried') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to retry order' });
  }
});

/**
 * POST /mock/fulfillment - Mock interno de API de fulfillment
 * Responde com sucesso/erro aleatório para simular comportamento real
 */
if (env.ENABLE_MOCK === 'true') {
  app.post('/mock/fulfillment', (req, res) => {
    const { order_id } = req.body;

    // Simula delay de API externa
    setTimeout(() => {
      // 80% de sucesso, 20% de falha
      const success = Math.random() > 0.2;

      if (success) {
        console.log(`[MOCK] Fulfillment successful for order ${order_id}`);
        res.json({
          success: true,
          fulfillment_id: `FFL-${Date.now()}`,
          order_id,
          message: 'Order processed successfully'
        });
      } else {
        console.log(`[MOCK] Fulfillment failed for order ${order_id}`);
        res.status(500).json({
          success: false,
          error: 'Fulfillment service temporarily unavailable',
          order_id
        });
      }
    }, 100 + Math.random() * 400); // 100-500ms delay
  });

  console.log('[MOCK] Mock fulfillment endpoint enabled at POST /mock/fulfillment');
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

// Handler de erros central
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================================================
// SERVER START
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
  console.log(`[SERVER] Environment: ${env.NODE_ENV}`);
  console.log(`[SERVER] Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, closing server...');
  server.close(() => {
    console.log('[SERVER] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received, closing server...');
  server.close(() => {
    console.log('[SERVER] Server closed');
    process.exit(0);
  });
});

export default app;

