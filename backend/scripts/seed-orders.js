import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, createOrder, updateOrderStatus } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pedidos de teste
const testOrders = [
  {
    id: '1001',
    status: 'sent',
    payload: {
      id: 1001,
      email: 'joao.silva@example.com',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
      total_price: '299.90',
      currency: 'BRL',
      financial_status: 'paid',
      customer: {
        first_name: 'João',
        last_name: 'Silva',
        email: 'joao.silva@example.com'
      },
      shipping_address: {
        address1: 'Rua das Flores, 123',
        city: 'São Paulo',
        province: 'SP',
        zip: '01234-567',
        country: 'Brazil'
      },
      line_items: [
        {
          title: 'Camiseta Premium',
          quantity: 2,
          price: '149.95',
          sku: 'CAM-001'
        }
      ]
    },
    last_error: null,
    attempts: 1
  },
  {
    id: '1002',
    status: 'failed',
    payload: {
      id: 1002,
      email: 'maria.santos@example.com',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h atrás
      total_price: '549.00',
      currency: 'BRL',
      financial_status: 'paid',
      customer: {
        first_name: 'Maria',
        last_name: 'Santos',
        email: 'maria.santos@example.com'
      },
      shipping_address: {
        address1: 'Av. Paulista, 1000',
        city: 'São Paulo',
        province: 'SP',
        zip: '01310-100',
        country: 'Brazil'
      },
      line_items: [
        {
          title: 'Tênis Esportivo',
          quantity: 1,
          price: '549.00',
          sku: 'TEN-005'
        }
      ]
    },
    last_error: 'Fulfillment service temporarily unavailable',
    attempts: 3
  },
  {
    id: '1003',
    status: 'received',
    payload: {
      id: 1003,
      email: 'pedro.costa@example.com',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15min atrás
      total_price: '89.90',
      currency: 'BRL',
      financial_status: 'paid',
      customer: {
        first_name: 'Pedro',
        last_name: 'Costa',
        email: 'pedro.costa@example.com'
      },
      shipping_address: {
        address1: 'Rua dos Bobos, 0',
        city: 'Rio de Janeiro',
        province: 'RJ',
        zip: '20000-000',
        country: 'Brazil'
      },
      line_items: [
        {
          title: 'Boné Snapback',
          quantity: 1,
          price: '89.90',
          sku: 'BON-003'
        }
      ]
    },
    last_error: null,
    attempts: 0
  }
];

async function seedOrders() {
  try {
    console.log('[SEED] Iniciando seed de pedidos de teste...');
    
    // Inicializa banco
    const dbPath = path.resolve(__dirname, '..', process.env.DATABASE_URL || './data/app.db');
    await initDb(dbPath);
    
    console.log('[SEED] Banco de dados conectado');
    
    // Insere pedidos
    for (const order of testOrders) {
      console.log(`[SEED] Inserindo pedido ${order.id} (status: ${order.status})...`);
      
      // Cria pedido
      createOrder(order.id, order.payload, order.status);
      
      // Se tiver erro ou tentativas, atualiza
      if (order.last_error || order.attempts > 0) {
        updateOrderStatus(order.id, order.status, order.last_error, false);
        
        // Atualiza attempts manualmente se necessário
        if (order.attempts > 1) {
          const db = (await import('../src/db.js')).getDb();
          db.run(`UPDATE orders SET attempts = ? WHERE id = ?`, [order.attempts, order.id]);
          
          // Salva no disco
          const fs = await import('fs');
          const data = db.export();
          const buffer = Buffer.from(data);
          fs.writeFileSync(dbPath, buffer);
        }
      }
      
      console.log(`[SEED] ✓ Pedido ${order.id} inserido com sucesso`);
    }
    
    console.log('\n[SEED] ✓ Seed concluído com sucesso!');
    console.log(`[SEED] ${testOrders.length} pedidos inseridos:`);
    testOrders.forEach(order => {
      console.log(`  - Pedido ${order.id}: ${order.status} (${order.attempts} tentativas)`);
    });
    console.log('\n[SEED] Acesse http://localhost:5173 para ver os pedidos no painel admin\n');
    
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Erro ao inserir pedidos:', error);
    process.exit(1);
  }
}

seedOrders();

