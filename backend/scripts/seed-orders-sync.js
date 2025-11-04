// Versão do seed que NÃO chama process.exit() - para usar em produção
import { getDb, createOrder, updateOrderStatus, createOrderLog, updateOrderNote } from '../src/db.js';

// [COPIAR TODA A LÓGICA DO seed-orders.js AQUI, mas SEM process.exit]

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
  { city: 'Porto Alegre', state: 'RS', zipPrefix: '90' }
];

const errors = [
  'Fulfillment service temporarily unavailable',
  'Connection timeout to fulfillment API',
  'Invalid product SKU in fulfillment system',
  'Payment validation pending',
  'Address validation failed'
];

const notes = ['Cliente VIP', 'Entrega expressa', null, null, null];

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
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.br'];
  const normalized = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${normalized}.${lastName.toLowerCase()}@${randomChoice(domains)}`;
}

function generateRecentDate() {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const randomWeight = Math.pow(Math.random(), 0.5);
  const timestamp = thirtyDaysAgo + (randomWeight * (now - thirtyDaysAgo));
  return new Date(timestamp);
}

function generateOrder(orderId) {
  const firstName = randomChoice(firstNames);
  const lastName = randomChoice(lastNames);
  const email = generateEmail(firstName, lastName);
  const location = randomChoice(cities);
  
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
      customer: { first_name: firstName, last_name: lastName, email },
      shipping_address: {
        address1: `Rua ${randomInt(1, 999)}`,
        city: location.city,
        province: location.state,
        zip: `${location.zipPrefix}${randomInt(100, 999)}-${randomInt(100, 999)}`,
        country: 'Brazil'
      },
      line_items: lineItems
    }
  };
}

export async function seedOrdersSync() {
  try {
    console.log('[SEED] 🌱 Iniciando seed...');
    
    const numOrders = randomInt(60, 120);
    console.log(`[SEED] 📦 Gerando ${numOrders} pedidos...`);
    
    const orders = [];
    
    for (let i = 1; i <= numOrders; i++) {
      const order = generateOrder(5000 + i);
      
      let status, sentAt = null, lastError = null, attempts = 1;
      const statusRoll = Math.random();
      
      if (statusRoll < 0.75) {
        status = 'sent';
        const delayMs = randomInt(30, 600) * 1000;
        sentAt = new Date(order.createdAt.getTime() + delayMs).toISOString();
      } else if (statusRoll < 0.90) {
        status = 'failed';
        lastError = randomChoice(errors);
        attempts = randomInt(1, 5);
      } else {
        status = 'received';
        attempts = 0;
      }
      
      const note = randomChoice(notes);
      
      orders.push({ ...order, status, sentAt, lastError, attempts, note });
    }
    
    orders.sort((a, b) => a.createdAt - b.createdAt);
    
    orders.forEach((order, index) => {
      order.id = String(5000 + index + 1);
      order.payload.id = 5000 + index + 1;
    });
    
    const db = getDb();
    let sentCount = 0, failedCount = 0, receivedCount = 0;
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      
      createOrder(order.id, order.payload, order.status);
      
      if (order.sentAt || order.lastError || order.attempts > 0) {
        updateOrderStatus(order.id, order.status, order.lastError, false, order.sentAt);
        
        if (order.attempts !== 1) {
          db.run(`UPDATE orders SET attempts = ? WHERE id = ?`, [order.attempts, order.id]);
        }
        
        db.run(`UPDATE orders SET created_at = ? WHERE id = ?`, [order.createdAt.toISOString(), order.id]);
      }
      
      if (order.note) {
        updateOrderNote(order.id, order.note);
      }
      
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
    }
    
    console.log('[SEED] ✅ Seed concluído!');
    console.log(`[SEED] 📊 ${numOrders} pedidos: ${sentCount} enviados, ${failedCount} falhados, ${receivedCount} recebidos`);
    
    return true;
  } catch (error) {
    console.error('[SEED] ❌ Erro:', error);
    return false;
  }
}

