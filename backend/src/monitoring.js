import { getMetricsSummary } from './metrics.js';
import { sendAlert, sendNotification } from './telegram.js';
import { searchOrders } from './db.js';

let monitoringInterval = null;
let lastAlertState = {
  highFailureRate: false,
  lastChecked: null
};

/**
 * Inicia monitoramento automático
 */
export function startMonitoring(intervalMinutes = 15) {
  if (monitoringInterval) {
    console.log('[MONITORING] Already running');
    return;
  }

  console.log(`[MONITORING] Starting monitoring (every ${intervalMinutes} minutes)`);
  
  // Executa imediatamente
  checkMetrics();
  
  // E depois a cada X minutos
  monitoringInterval = setInterval(() => {
    checkMetrics();
  }, intervalMinutes * 60 * 1000);
}

/**
 * Para monitoramento
 */
export function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('[MONITORING] Stopped');
  }
}

/**
 * Verifica métricas e envia alertas se necessário
 */
function checkMetrics() {
  try {
    const metrics = getMetricsSummary('7d');
    const failureRate = metrics.current.totalOrders > 0 
      ? (metrics.current.failedOrders / metrics.current.totalOrders) * 100 
      : 0;

    console.log(`[MONITORING] Checking metrics... Failure rate: ${failureRate.toFixed(1)}%`);

    // Alerta de taxa de falha alta
    if (failureRate > 20 && !lastAlertState.highFailureRate) {
      sendAlert(
        `⚠️ *TAXA DE FALHA ELEVADA*\n\n` +
        `📊 Últimos 7 dias:\n` +
        `❌ ${metrics.current.failedOrders} de ${metrics.current.totalOrders} pedidos falharam\n` +
        `📈 Taxa de falha: *${failureRate.toFixed(1)}%*\n\n` +
        `💡 Use /falhas para ver detalhes`
      );
      lastAlertState.highFailureRate = true;
      console.log('[MONITORING] ⚠️ High failure rate alert sent');
    }

    // Notificação quando volta ao normal
    if (failureRate <= 20 && lastAlertState.highFailureRate) {
      sendNotification(
        `✅ *TAXA DE FALHA NORMALIZADA*\n\n` +
        `📊 Taxa atual: ${failureRate.toFixed(1)}%\n` +
        `Sistema operando normalmente.`
      );
      lastAlertState.highFailureRate = false;
      console.log('[MONITORING] ✅ Failure rate normalized notification sent');
    }

    // Verifica pedidos com muitas tentativas (>3)
    checkStuckOrders();

    lastAlertState.lastChecked = new Date();
  } catch (error) {
    console.error('[MONITORING] Error checking metrics:', error);
  }
}

/**
 * Verifica pedidos "travados" com muitas falhas
 */
function checkStuckOrders() {
  try {
    const orders = searchOrders({ status: 'failed', limit: 100 });
    const stuckOrders = orders.filter(o => o.attempts >= 3);

    if (stuckOrders.length > 0 && stuckOrders.length <= 5) {
      // Só alerta se tiver alguns pedidos (não muitos)
      let message = `🚨 *PEDIDOS COM MÚLTIPLAS FALHAS*\n\n`;
      message += `${stuckOrders.length} pedido(s) falharam 3+ vezes:\n\n`;

      stuckOrders.slice(0, 5).forEach(order => {
        message += `📦 #${order.id} - ${order.attempts} tentativas\n`;
        message += `   ${order.payload.customer?.email || 'N/A'}\n`;
      });

      message += `\n💡 Revise estes pedidos manualmente`;

      sendAlert(message);
      console.log(`[MONITORING] ⚠️ Stuck orders alert sent (${stuckOrders.length} orders)`);
    }
  } catch (error) {
    console.error('[MONITORING] Error checking stuck orders:', error);
  }
}

/**
 * Envia relatório diário
 */
export function sendDailyReport() {
  try {
    const metrics = getMetricsSummary('today');
    
    const message = `
📊 *RELATÓRIO DIÁRIO*

📦 Total hoje: ${metrics.current.totalOrders} pedidos
✅ Enviados: ${metrics.current.totalOrders - metrics.current.failedOrders - (metrics.current.totalOrders - metrics.current.totalOrders)}
❌ Falhas: ${metrics.current.failedOrders}
📈 Taxa de sucesso: ${metrics.current.successRate}%
⏱️ Tempo médio: ${Math.round(metrics.current.avgTimeToSent)} min

${metrics.deltas.totalOrders >= 0 ? '📈' : '📉'} vs. ontem: ${metrics.deltas.totalOrders > 0 ? '+' : ''}${metrics.deltas.totalOrders.toFixed(1)}%

🌐 Dashboard: http://localhost:5173
`;

    sendNotification(message);
    console.log('[MONITORING] 📊 Daily report sent');
  } catch (error) {
    console.error('[MONITORING] Error sending daily report:', error);
  }
}

/**
 * Obtém status do monitoramento
 */
export function getMonitoringStatus() {
  return {
    active: monitoringInterval !== null,
    lastChecked: lastAlertState.lastChecked,
    alerts: {
      highFailureRate: lastAlertState.highFailureRate
    }
  };
}

