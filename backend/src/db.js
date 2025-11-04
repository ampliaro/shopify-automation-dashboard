import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Inicializa o banco de dados SQLite
 */
export function initDb(dbPath) {
  // Garante que o diretório existe
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging para melhor performance

  runMigrations();
  
  console.log(`[DB] Database initialized at ${dbPath}`);
  return db;
}

/**
 * Retorna a instância do banco de dados
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

/**
 * Executa migrações do banco de dados
 */
function runMigrations() {
  // Tabela de pedidos
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT (datetime('now')),
      status TEXT CHECK(status IN ('received', 'sent', 'failed')) NOT NULL,
      payload TEXT NOT NULL,
      last_error TEXT,
      attempts INTEGER DEFAULT 0
    )
  `);

  // Tabela de webhook IDs para idempotência
  db.exec(`
    CREATE TABLE IF NOT EXISTS webhook_ids (
      webhook_id TEXT PRIMARY KEY,
      received_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  // Índices para performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)
  `);

  console.log('[DB] Migrations completed');
}

/**
 * Cria um novo pedido
 */
export function createOrder(id, payload, status = 'received') {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO orders (id, payload, status)
    VALUES (?, ?, ?)
  `);
  
  return stmt.run(id, JSON.stringify(payload), status);
}

/**
 * Atualiza o status de um pedido
 */
export function updateOrderStatus(id, status, lastError = null, incrementAttempts = false) {
  const db = getDb();
  
  let query = `
    UPDATE orders 
    SET status = ?, last_error = ?
  `;
  
  const params = [status, lastError];
  
  if (incrementAttempts) {
    query += `, attempts = attempts + 1`;
  }
  
  query += ` WHERE id = ?`;
  params.push(id);
  
  const stmt = db.prepare(query);
  return stmt.run(...params);
}

/**
 * Busca pedidos com filtros opcionais
 */
export function getOrders(filters = {}) {
  const db = getDb();
  
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  // Ordenação por data de criação (mais recentes primeiro)
  query += ' ORDER BY created_at DESC';

  // Paginação
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(parseInt(filters.limit, 10));
  }

  if (filters.offset) {
    query += ' OFFSET ?';
    params.push(parseInt(filters.offset, 10));
  }

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  // Parse do payload JSON
  return rows.map(row => ({
    ...row,
    payload: JSON.parse(row.payload)
  }));
}

/**
 * Busca um pedido por ID
 */
export function getOrderById(id) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  const row = stmt.get(id);
  
  if (!row) {
    return null;
  }

  return {
    ...row,
    payload: JSON.parse(row.payload)
  };
}

/**
 * Conta total de pedidos (útil para paginação)
 */
export function countOrders(filters = {}) {
  const db = getDb();
  
  let query = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
  const params = [];

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  const stmt = db.prepare(query);
  const result = stmt.get(...params);
  
  return result.total;
}

/**
 * Fecha a conexão com o banco de dados
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
    console.log('[DB] Database connection closed');
  }
}

