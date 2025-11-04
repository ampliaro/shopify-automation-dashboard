import { getDb } from './db.js';
import { getAggregatedStats } from './metrics.js';

/**
 * Calcula o range de datas baseado no período selecionado
 */
function getDateRange(range) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate;

  switch (range) {
    case 'today':
      startDate = today;
      break;
    case '7d':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
      break;
    default:
      throw new Error('Invalid range. Use: today, 7d, or 30d');
  }

  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString()
  };
}

/**
 * Escapa valores CSV (adiciona aspas se contém vírgula, nova linha ou aspas)
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Se contém vírgula, nova linha ou aspas, envolve em aspas
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Extrai email do cliente do payload JSON
 */
function extractCustomerEmail(payload) {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return data.email || data.customer?.email || '';
  } catch {
    return '';
  }
}

/**
 * Extrai total do pedido do payload JSON
 */
function extractTotal(payload) {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return data.total_price || data.total || '';
  } catch {
    return '';
  }
}

/**
 * Formata data para exibição no CSV
 */
function formatDateForCsv(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Gera CSV de pedidos para um período
 */
export function generateOrdersCSV(range = '7d', statusFilter = null) {
  const db = getDb();
  const { startDate, endDate } = getDateRange(range);

  // Query para buscar pedidos
  let query = `
    SELECT 
      id, created_at, status, attempts, last_error, sent_at, payload, note
    FROM orders
    WHERE created_at >= ? AND created_at <= ?
  `;
  
  const params = [startDate, endDate];

  if (statusFilter) {
    query += ' AND status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query, params);
  const orders = [];
  
  while (stmt.step()) {
    orders.push(stmt.getAsObject());
  }
  stmt.free();

  // Busca estatísticas agregadas
  const stats = getAggregatedStats(range, statusFilter);

  // Monta o CSV
  const csvLines = [];
  
  // Header
  csvLines.push('ID,Criado Em,Status,Tentativas,Erro,Enviado Em,Email Cliente,Total,Nota');
  
  // Linhas de dados
  orders.forEach(order => {
    const row = [
      escapeCsvValue(order.id),
      escapeCsvValue(formatDateForCsv(order.created_at)),
      escapeCsvValue(order.status),
      escapeCsvValue(order.attempts),
      escapeCsvValue(order.last_error),
      escapeCsvValue(formatDateForCsv(order.sent_at)),
      escapeCsvValue(extractCustomerEmail(order.payload)),
      escapeCsvValue(extractTotal(order.payload)),
      escapeCsvValue(order.note)
    ];
    csvLines.push(row.join(','));
  });

  // Adiciona linha em branco e sumário
  csvLines.push('');
  csvLines.push('RESUMO DO PERÍODO');
  csvLines.push(`Total de Pedidos,${stats.total}`);
  csvLines.push(`Enviados,${stats.sent}`);
  csvLines.push(`Falhados,${stats.failed}`);
  csvLines.push(`Recebidos,${stats.received}`);
  csvLines.push(`Média de Tentativas,${stats.avg_attempts ? parseFloat(stats.avg_attempts).toFixed(2) : '0'}`);
  csvLines.push(`Período,${range}`);
  csvLines.push(`Gerado em,${formatDateForCsv(new Date().toISOString())}`);

  return csvLines.join('\n');
}

