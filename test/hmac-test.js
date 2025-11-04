#!/usr/bin/env node

/**
 * Script para gerar HMAC de um webhook Shopify
 * Útil para testes manuais com cURL
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração
const SECRET = process.env.SHOPIFY_SHARED_SECRET || 'your_secret_here';
const SAMPLE_FILE = process.argv[2] || path.join(__dirname, 'sample-order.json');

// Lê o arquivo de exemplo
if (!fs.existsSync(SAMPLE_FILE)) {
  console.error(`Erro: Arquivo não encontrado: ${SAMPLE_FILE}`);
  process.exit(1);
}

const payload = fs.readFileSync(SAMPLE_FILE, 'utf-8');

// Calcula HMAC
const hmac = crypto
  .createHmac('sha256', SECRET)
  .update(payload)
  .digest('base64');

console.log('========================================');
console.log('Gerador de HMAC para Webhook Shopify');
console.log('========================================');
console.log(`\nSecret: ${SECRET}`);
console.log(`Arquivo: ${path.basename(SAMPLE_FILE)}`);
console.log(`\nHMAC-SHA256 (base64):\n${hmac}`);
console.log('\n========================================');
console.log('Comando cURL de exemplo:\n');
console.log(`curl -X POST http://localhost:3001/webhook/shopify \\
  -H "Content-Type: application/json" \\
  -H "X-Shopify-Hmac-Sha256: ${hmac}" \\
  -H "X-Shopify-Webhook-Id: test-webhook-${Date.now()}" \\
  -d @${SAMPLE_FILE}`);
console.log('\n========================================\n');

