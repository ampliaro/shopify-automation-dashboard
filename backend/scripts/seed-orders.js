import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, createOrder, updateOrderStatus, createOrderLog, updateOrderNote } from '../src/db.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dados para gerar pedidos realistas
const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda', 'Rafael', 'Patricia', 
  'Marcos', 'Carla', 'Ricardo', 'Beatriz', 'Felipe', 'Camila', 'Rodrigo', 'Amanda', 'Bruno', 'Larissa'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Costa', 'Souza', 'Pereira', 'Ferreira', 'Alves', 'Lima', 'Rocha',
  'Carvalho', 'Martins', 'Gomes', 'Ribeiro', 'Araújo', 'Cardoso', 'Mendes', 'Barbosa', 'Dias', 'Correia'];

const products = [
  { title: 'Camiseta Premium', sku: 'CAM-001', priceRange: [79.90, 149.90] },
  { title: 'Tênis Esportivo', sku: 'TEN-001', priceRange: [299.00, 599.00] },
  { title: 'Jaqueta de Couro', sku: 'JAQ-001', priceRange: [399.00, 899.00] },
  { title: 'Calça Jeans', sku: 'CAL-001', priceRange: [129.00, 249.00] },
  { title: 'Boné Snapback', sku: 'BON-001', priceRange: [59.90, 119.90] },
  { title: 'Relógio Digital', sku: 'REL-001', priceRange: [199.00, 499.00] },
  { title: 'Mochila Executiva', sku: 'MOC-001', priceRange: [149.00, 349.00] },
  { title: 'Óculos de Sol', sku: 'OCU-001', priceRange: [89.00, 299.00] },
  { title: 'Carteira de Couro', sku: 'CAR-001', priceRange: [79.00, 189.00] },
  { title: 'Cinto Premium', sku: 'CIN-001', priceRange: [69.00, 159.00] }
];

const cities = [
  { city: 'São Paulo', state: 'SP', zipPrefix: '01' },
  { city: 'Rio de Janeiro', state: 'RJ', zipPrefix: '20' },
  { city: 'Belo Horizonte', state: 'MG', zipPrefix: '30' },
  { city: 'Curitiba', state: 'PR', zipPrefix: '80' },
  { city: 'Porto Alegre', state: 'RS', zipPrefix: '90' },
  { city: 'Brasília', state: 'DF', zipPrefix: '70' },
  { city: 'Salvador', state: 'BA', zipPrefix: '40' },
  { city: 'Fortaleza', state: 'CE', zipPrefix: '60' },
  { city: 'Recife', state: 'PE', zipPrefix: '50' },
  { city: 'Campinas', state: 'SP', zipPrefix: '13' }
];

const errors = [
  'Fulfillment service temporarily unavailable',
  'Connection timeout to fulfillment API',
  'Invalid product SKU in fulfillment system',
  'Payment validation pending',
  'Address validation failed'
];

const notes = [
  'Cliente solicitou entrega expressa',
  'Embalagem para presente',
  'Verificar estoque antes de processar',
  'Cliente VIP - prioridade alta',
  null, null, null // Maioria sem nota
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com', 'example.com'];
  const normalized = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${normalized}.${lastName.toLowerCase()}@${randomChoice(domains)}`;
}

function generateZipCode(prefix) {
  return `${prefix}${randomInt(100, 999)}-${randomInt(100, 999)}`;
}

function generateAddress() {
  const streets = ['Rua das Flores', 'Av. Paulista', 'Rua dos Bobos', 'Av. Brasil', 'Rua Principal'];
  return `${randomChoice(streets)}, ${randomInt(1, 9999)}`;
}

// Gera data dentro dos últimos 30 dias com distribuição realista (mais recente = mais pedidos)
function generateRecentDate() {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  // Peso exponencial para datas mais recentes
  const randomWeight = Math.pow(Math.random(), 0.5); // Favorece valores próximos de 1
  const timestamp = thirtyDaysAgo + (randomWeight * (now - thirtyDaysAgo));
  
  return new Date(timestamp);
}

function generateOrder(orderId) {
  const firstName = randomChoice(firstNames);
  const lastName = randomChoice(lastNames);
  const email = generateEmail(firstName, lastName);
  const location = randomChoice(cities);
  
  // Gera 1-3 items
  const numItems = randomInt(1, 3);
  const lineItems = [];
  let totalPrice = 0;
  
  for (let i = 0; i < numItems; i++) {
    const product = randomChoice(products);
    const quantity = randomInt(1, 2);
    const price = randomPrice(product.priceRange[0], product.priceRange[1]);
    
    lineItems.push({
      title: product.title,
      quantity,
      price,
      sku: product.sku
    });
    
    totalPrice += parseFloat(price) * quantity;
  }
  
  const createdAt = generateRecentDate();
  
  return {
    id: String(orderId),
    createdAt,
    payload: {
      id: orderId,
      email,
      created_at: createdAt.toISOString(),
      total_price: totalPrice.toFixed(2),
      currency: 'BRL',
      financial_status: 'paid',
      customer: {
        first_name: firstName,
        last_name: lastName,
        email
      },
      shipping_address: {
        address1: generateAddress(),
        city: location.city,
        province: location.state,
        zip: generateZipCode(location.zipPrefix),
        country: 'Brazil'
      },
      line_items: lineItems
    }
  };
}

async function seedOrders() {
  try {
    console.log('[SEED] 🌱 Iniciando seed de pedidos realistas...\n');
    
    // Inicializa banco
    const dbPath = path.resolve(__dirname, '..', process.env.DATABASE_URL || './data/app.db');
    await initDb(dbPath);
    
    console.log('[SEED] ✓ Banco de dados conectado');
    
    // Gera entre 60-120 pedidos
    const numOrders = randomInt(60, 120);
    console.log(`[SEED] 📦 Gerando ${numOrders} pedidos...\n`);
    
    const orders = [];
    
    for (let i = 1; i <= numOrders; i++) {
      const order = generateOrder(5000 + i);
      
      // Determina status: ~75% sent, ~15% failed, ~10% received
      let status;
      let sentAt = null;
      let lastError = null;
      let attempts = 1;
      
      const statusRoll = Math.random();
      
      if (statusRoll < 0.75) {
        // Sent
        status = 'sent';
        // sent_at é created_at + 30s a 10min
        const delayMs = randomInt(30, 600) * 1000;
        sentAt = new Date(order.createdAt.getTime() + delayMs).toISOString();
      } else if (statusRoll < 0.90) {
        // Failed
        status = 'failed';
        lastError = randomChoice(errors);
        attempts = randomInt(1, 5);
      } else {
        // Received (recent orders only)
        status = 'received';
        attempts = 0;
      }
      
      // Alguns pedidos têm notas
      const note = randomChoice(notes);
      
      orders.push({
        ...order,
        status,
        sentAt,
        lastError,
        attempts,
        note
      });
    }
    
    // Ordena por data (mais antigos primeiro para sequência correta de IDs)
    orders.sort((a, b) => a.createdAt - b.createdAt);
    
    // Renumera IDs para garantir sequência única
    orders.forEach((order, index) => {
      order.id = String(5000 + index + 1);
      order.payload.id = 5000 + index + 1;
    });
    
    // Insere pedidos no banco
    const { getDb } = await import('../src/db.js');
    const db = getDb();
    
    let sentCount = 0;
    let failedCount = 0;
    let receivedCount = 0;
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      
      // Cria pedido
      createOrder(order.id, order.payload, order.status);
      
      // Atualiza campos adicionais
      if (order.sentAt || order.lastError || order.attempts > 0) {
        updateOrderStatus(order.id, order.status, order.lastError, false, order.sentAt);
        
        // Atualiza attempts manualmente se necessário
        if (order.attempts !== 1) {
          db.run(`UPDATE orders SET attempts = ? WHERE id = ?`, [order.attempts, order.id]);
        }
        
        // Ajusta created_at para a data gerada
        db.run(`UPDATE orders SET created_at = ? WHERE id = ?`, [order.createdAt.toISOString(), order.id]);
      }
      
      // Adiciona nota se existir
      if (order.note) {
        updateOrderNote(order.id, order.note);
      }
      
      // Cria logs
      createOrderLog(order.id, 'created', 'Order received from webhook');
      
      if (order.status === 'sent') {
        if (order.attempts > 1) {
          for (let j = 1; j < order.attempts; j++) {
            createOrderLog(order.id, 'retry', `Retry attempt ${j}`);
          }
        }
        createOrderLog(order.id, 'sent', 'Order sent to fulfillment successfully');
        sentCount++;
      } else if (order.status === 'failed') {
        for (let j = 1; j < order.attempts; j++) {
          createOrderLog(order.id, 'retry', `Retry attempt ${j}`);
          createOrderLog(order.id, 'failed', order.lastError);
        }
        failedCount++;
      } else {
        receivedCount++;
      }
      
      if (order.note) {
        createOrderLog(order.id, 'note_added', 'Note added by admin');
      }
      
      // Progresso visual
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`[SEED] Inserindo... ${i + 1}/${numOrders}\r`);
      }
    }
    
    console.log(`\n`);
    
    // Salva no disco
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    
    console.log('[SEED] ✅ Seed concluído com sucesso!\n');
    console.log('[SEED] 📊 Estatísticas:');
    console.log(`[SEED]   • Total: ${numOrders} pedidos`);
    console.log(`[SEED]   • Enviados: ${sentCount} (${(sentCount/numOrders*100).toFixed(1)}%)`);
    console.log(`[SEED]   • Falhados: ${failedCount} (${(failedCount/numOrders*100).toFixed(1)}%)`);
    console.log(`[SEED]   • Recebidos: ${receivedCount} (${(receivedCount/numOrders*100).toFixed(1)}%)`);
    console.log(`[SEED]   • Período: últimos 30 dias`);
    console.log('\n[SEED] 🚀 Acesse http://localhost:5173 para ver o dashboard\n');
    
    process.exit(0);
  } catch (error) {
    console.error('[SEED] ❌ Erro ao inserir pedidos:', error);
    process.exit(1);
  }
}

seedOrders();
