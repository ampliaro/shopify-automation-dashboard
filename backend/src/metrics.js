import { getDb } from './db.js';

/**
 * Calcula o range de datas baseado no período selecionado
 */
function getDateRange(range) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate;
  let previousStartDate;
  let previousEndDate;

  switch (range) {
    case 'today':
      startDate = today;
      // Período anterior é o dia anterior
      previousEndDate = new Date(today);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      previousStartDate = new Date(previousEndDate);
      break;
    case '7d':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      // Período anterior são os 7 dias anteriores
      previousEndDate = new Date(startDate);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      break;
    case '30d':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
      // Período anterior são os 30 dias anteriores
      previousEndDate = new Date(startDate);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      break;
    default:
      throw new Error('Invalid range. Use: today, 7d, or 30d');
  }

  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    previousStartDate: previousStartDate.toISOString(),
    previousEndDate: previousEndDate.toISOString()
  };
}

/**
 * Calcula métricas resumidas para os cards
 */
export function getMetricsSummary(range = '7d') {
  const db = getDb();
  const { startDate, endDate, previousStartDate, previousEndDate } = getDateRange(range);

  // Métricas do período atual
  const currentStmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
      AVG(
        CASE 
          WHEN sent_at IS NOT NULL 
          THEN (julianday(sent_at) - julianday(created_at)) * 24 * 60
          ELSE NULL 
        END
      ) as avg_time_to_sent_minutes
    FROM orders
    WHERE created_at >= ? AND created_at <= ?
  `, [startDate, endDate]);

  let current = { total: 0, sent: 0, failed: 0, received: 0, avg_time_to_sent_minutes: 0 };
  if (currentStmt.step()) {
    current = currentStmt.getAsObject();
  }
  currentStmt.free();

  // Métricas do período anterior
  const previousStmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM orders
    WHERE created_at >= ? AND created_at <= ?
  `, [previousStartDate, previousEndDate]);

  let previous = { total: 0, sent: 0, failed: 0 };
  if (previousStmt.step()) {
    previous = previousStmt.getAsObject();
  }
  previousStmt.free();

  // Calcula taxa de sucesso
  const successRate = current.total > 0 ? (current.sent / current.total) * 100 : 0;
  const previousSuccessRate = previous.total > 0 ? (previous.sent / previous.total) * 100 : 0;

  // Calcula deltas (diferença percentual)
  const calculateDelta = (currentVal, previousVal) => {
    const curr = currentVal || 0;
    const prev = previousVal || 0;
    
    if (prev === 0) return curr > 0 ? 100 : 0;
    const delta = ((curr - prev) / prev) * 100;
    
    // Garante que sempre retorna um número válido
    return isNaN(delta) || !isFinite(delta) ? 0 : parseFloat(delta.toFixed(1));
  };

  return {
    current: {
      totalOrders: current.total || 0,
      successRate: parseFloat(successRate.toFixed(1)),
      failedOrders: current.failed || 0,
      avgTimeToSent: current.avg_time_to_sent_minutes || 0
    },
    previous: {
      totalOrders: previous.total || 0,
      successRate: parseFloat(previousSuccessRate.toFixed(1)),
      failedOrders: previous.failed || 0
    },
    deltas: {
      totalOrders: calculateDelta(current.total, previous.total),
      successRate: parseFloat((successRate - previousSuccessRate).toFixed(1)),
      failedOrders: calculateDelta(current.failed, previous.failed),
      avgTimeToSent: 0 // Calculado apenas para período atual
    },
    range,
    period: {
      start: startDate,
      end: endDate
    }
  };
}

/**
 * Retorna dados de série temporal para o gráfico
 */
export function getTimeseriesData(range = '7d') {
  const db = getDb();
  const { startDate, endDate } = getDateRange(range);

  let groupBy;
  let dateFormat;

  if (range === 'today') {
    // Agrupar por hora
    groupBy = `strftime('%Y-%m-%d %H:00:00', created_at)`;
    dateFormat = 'hour';
  } else {
    // Agrupar por dia
    groupBy = `date(created_at)`;
    dateFormat = 'day';
  }

  const stmt = db.prepare(`
    SELECT 
      ${groupBy} as period,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received
    FROM orders
    WHERE created_at >= ? AND created_at <= ?
    GROUP BY ${groupBy}
    ORDER BY period ASC
  `, [startDate, endDate]);

  const series = [];
  while (stmt.step()) {
    series.push(stmt.getAsObject());
  }
  stmt.free();

  return {
    series,
    range,
    dateFormat
  };
}

/**
 * Retorna dados de heatmap por hora do dia (apenas para hoje)
 */
export function getHeatmapData() {
  const db = getDb();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = today.toISOString();
  const endDate = now.toISOString();

  const stmt = db.prepare(`
    SELECT 
      CAST(strftime('%H', created_at) AS INTEGER) as hour,
      COUNT(*) as count
    FROM orders
    WHERE created_at >= ? AND created_at <= ?
    GROUP BY hour
    ORDER BY hour ASC
  `, [startDate, endDate]);

  const heatmap = Array(24).fill(0);
  
  while (stmt.step()) {
    const row = stmt.getAsObject();
    heatmap[row.hour] = row.count;
  }
  stmt.free();

  return {
    heatmap,
    date: today.toISOString().split('T')[0]
  };
}

/**
 * Calcula estatísticas agregadas para um período (usado em export CSV)
 */
export function getAggregatedStats(range = '7d', statusFilter = null) {
  const db = getDb();
  const { startDate, endDate } = getDateRange(range);

  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
      AVG(attempts) as avg_attempts
    FROM orders
    WHERE created_at >= ? AND created_at <= ?
  `;

  const params = [startDate, endDate];

  if (statusFilter) {
    query += ' AND status = ?';
    params.push(statusFilter);
  }

  const stmt = db.prepare(query, params);
  
  let stats = { total: 0, sent: 0, failed: 0, received: 0, avg_attempts: 0 };
  if (stmt.step()) {
    stats = stmt.getAsObject();
  }
  stmt.free();

  return stats;
}

