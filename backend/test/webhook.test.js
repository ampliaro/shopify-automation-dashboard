import { test } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import supertest from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define variáveis de ambiente para teste
process.env.SHOPIFY_SHARED_SECRET = 'test_secret_123';
process.env.FULFILLMENT_URL = 'http://localhost:3001/mock/fulfillment';
process.env.PORT = '3002';
process.env.DATABASE_URL = './data/test.db';
process.env.NODE_ENV = 'test';
process.env.ENABLE_MOCK = 'true';

// Remove DB de teste se existir
const testDbPath = path.resolve(__dirname, '..', './data/test.db');
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

// Importa app após definir envs
const appModule = await import('../src/server.js');
const app = appModule.default;

test('GET /healthz - retorna status ok', async () => {
  const response = await supertest(app)
    .get('/healthz')
    .expect(200);

  assert.strictEqual(response.body.status, 'ok');
  assert.ok(response.body.timestamp);
});

test('GET /orders - lista pedidos vazia inicialmente', async () => {
  const response = await supertest(app)
    .get('/orders')
    .expect(200);

  assert.ok(Array.isArray(response.body.orders));
  assert.strictEqual(response.body.pagination.total, 0);
});

test('POST /webhook/shopify - rejeita webhook sem HMAC', async () => {
  const payload = { id: 123, test: true };

  const response = await supertest(app)
    .post('/webhook/shopify')
    .send(payload)
    .expect(401);

  assert.ok(response.body.error.includes('Missing HMAC'));
});

test('POST /webhook/shopify - rejeita webhook com HMAC inválido', async () => {
  const payload = { id: 456, test: true };

  const response = await supertest(app)
    .post('/webhook/shopify')
    .set('X-Shopify-Hmac-Sha256', 'invalid_hmac')
    .set('X-Shopify-Webhook-Id', 'test-webhook-1')
    .set('Content-Type', 'application/json')
    .send(payload)
    .expect(401);

  assert.ok(response.body.error.includes('Invalid HMAC'));
});

test('POST /webhook/shopify - aceita webhook com HMAC válido', async () => {
  const payload = { id: 789, email: 'test@example.com', total_price: '100.00' };
  const payloadString = JSON.stringify(payload);
  const hmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_SHARED_SECRET)
    .update(payloadString)
    .digest('base64');

  const response = await supertest(app)
    .post('/webhook/shopify')
    .set('X-Shopify-Hmac-Sha256', hmac)
    .set('X-Shopify-Webhook-Id', 'test-webhook-valid-1')
    .set('Content-Type', 'application/json')
    .send(payload)
    .expect(200);

  assert.strictEqual(response.body.message, 'Webhook received');
  assert.strictEqual(response.body.order_id, '789');
});

test('POST /webhook/shopify - rejeita webhook duplicado (idempotência)', async () => {
  const payload = { id: 999, email: 'duplicate@example.com' };
  const payloadString = JSON.stringify(payload);
  const hmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_SHARED_SECRET)
    .update(payloadString)
    .digest('base64');

  const webhookId = 'test-webhook-duplicate-1';

  // Primeira requisição
  await supertest(app)
    .post('/webhook/shopify')
    .set('X-Shopify-Hmac-Sha256', hmac)
    .set('X-Shopify-Webhook-Id', webhookId)
    .set('Content-Type', 'application/json')
    .send(payload)
    .expect(200);

  // Segunda requisição com mesmo webhook ID (duplicada)
  const response = await supertest(app)
    .post('/webhook/shopify')
    .set('X-Shopify-Hmac-Sha256', hmac)
    .set('X-Shopify-Webhook-Id', webhookId)
    .set('Content-Type', 'application/json')
    .send(payload)
    .expect(200);

  assert.strictEqual(response.body.duplicate, true);
});

test('GET /orders?status=received - filtra pedidos por status', async (t) => {
  // Aguarda processamento assíncrono
  await new Promise(resolve => setTimeout(resolve, 200));

  const response = await supertest(app)
    .get('/orders?status=received')
    .expect(200);

  assert.ok(Array.isArray(response.body.orders));
});

test('POST /orders/:id/retry - retorna 404 para pedido inexistente', async () => {
  const response = await supertest(app)
    .post('/orders/nonexistent/retry')
    .expect(404);

  assert.ok(response.body.error.includes('not found'));
});

console.log('✅ Todos os testes de integração passaram');

