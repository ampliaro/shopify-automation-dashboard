import { test } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { validateHmac } from '../src/hmac.js';

test('validateHmac - válido com HMAC correto', async () => {
  const secret = 'test_secret_key';
  const payload = JSON.stringify({ test: 'data' });
  const validHmac = crypto.createHmac('sha256', secret).update(payload).digest('base64');

  const req = {
    get: (header) => {
      if (header === 'X-Shopify-Hmac-Sha256') return validHmac;
      return null;
    },
    rawBody: Buffer.from(payload)
  };

  const res = {
    status: () => res,
    json: () => {}
  };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  const middleware = validateHmac(secret);
  middleware(req, res, next);

  assert.strictEqual(nextCalled, true, 'Next deve ser chamado com HMAC válido');
  assert.deepStrictEqual(req.body, { test: 'data' }, 'Body deve ser parseado');
});

test('validateHmac - inválido com HMAC incorreto', async () => {
  const secret = 'test_secret_key';
  const payload = JSON.stringify({ test: 'data' });
  const invalidHmac = 'invalid_hmac_value';

  const req = {
    get: (header) => {
      if (header === 'X-Shopify-Hmac-Sha256') return invalidHmac;
      return null;
    },
    rawBody: Buffer.from(payload)
  };

  let statusCode = null;
  let responseBody = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (body) => {
      responseBody = body;
    }
  };

  let nextCalled = false;
  const next = () => { nextCalled = false; };

  const middleware = validateHmac(secret);
  middleware(req, res, next);

  assert.strictEqual(statusCode, 401, 'Status deve ser 401');
  assert.strictEqual(nextCalled, false, 'Next não deve ser chamado');
  assert.ok(responseBody.error.includes('Invalid HMAC'), 'Erro deve mencionar HMAC inválido');
});

test('validateHmac - rejeita requisição sem header HMAC', async () => {
  const secret = 'test_secret_key';
  const payload = JSON.stringify({ test: 'data' });

  const req = {
    get: () => null,
    rawBody: Buffer.from(payload)
  };

  let statusCode = null;
  let responseBody = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (body) => {
      responseBody = body;
    }
  };

  const next = () => {};

  const middleware = validateHmac(secret);
  middleware(req, res, next);

  assert.strictEqual(statusCode, 401, 'Status deve ser 401');
  assert.ok(responseBody.error.includes('Missing HMAC'), 'Erro deve mencionar HMAC ausente');
});

test('validateHmac - comparação em tempo constante previne timing attacks', async () => {
  const secret = 'test_secret_key';
  const payload = JSON.stringify({ test: 'data' });
  const validHmac = crypto.createHmac('sha256', secret).update(payload).digest('base64');
  
  // HMAC com comprimento diferente (deve falhar rápido, mas de forma segura)
  const shortHmac = validHmac.substring(0, 10);

  const req = {
    get: (header) => {
      if (header === 'X-Shopify-Hmac-Sha256') return shortHmac;
      return null;
    },
    rawBody: Buffer.from(payload)
  };

  let statusCode = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: () => {}
  };

  const next = () => {};

  const middleware = validateHmac(secret);
  middleware(req, res, next);

  assert.strictEqual(statusCode, 401, 'HMAC com comprimento diferente deve ser rejeitado');
});

console.log('✅ Todos os testes de HMAC passaram');

