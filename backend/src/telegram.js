import TelegramBot from 'node-telegram-bot-api';
import { getMetricsSummary } from './metrics.js';
import { searchOrders, getOrderById, getOrderLogs } from './db.js';
import { retryOrder } from './orders.js';

let bot = null;
let adminChatIds = [];
let fulfillmentUrl = '';

/**
 * Inicializa o bot do Telegram
 */
export function initTelegramBot(token, adminIds, fulfillUrl) {
  if (!token) {
    console.log('[TELEGRAM] Bot token not provided, skipping initialization');
    return null;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    adminChatIds = adminIds ? adminIds.split(',').map(id => id.trim()) : [];
    fulfillmentUrl = fulfillUrl;

    setupCommands();
    
    console.log('[TELEGRAM] Bot initialized successfully');
    console.log(`[TELEGRAM] Admin chat IDs: ${adminChatIds.join(', ') || 'None configured'}`);
    
    return bot;
  } catch (error) {
    console.error('[TELEGRAM] Failed to initialize bot:', error.message);
    return null;
  }
}

/**
 * Verifica se o usuário é admin
 */
function isAdmin(chatId) {
  if (adminChatIds.length === 0) {
    return true; // Se não configurou admins, permite todos
  }
  return adminChatIds.includes(chatId.toString());
}

/**
 * Formata números para exibição
 */
function formatNumber(num) {
  return new Intl.NumberFormat('pt-BR').format(num);
}

/**
 * Formata data para exibição
 */
function formatDate(dateString) {
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
 * Configura todos os comandos do bot
 */
function setupCommands() {
  // Comando /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🤖 *OrderFlow Bot - Bem-vindo!*

Sou seu assistente para monitorar e gerenciar pedidos.

📊 *Comandos de Métricas:*
/hoje - Estatísticas de hoje
/7dias - Estatísticas dos últimos 7 dias
/30dias - Estatísticas dos últimos 30 dias
/relatorio - Relatório completo agora

📦 *Comandos de Pedidos:*
/falhas - Lista pedidos falhados
/recentes - Últimos 10 pedidos
/pedido [ID] - Detalhes de um pedido
/logs [ID] - Timeline de eventos do pedido

⚡ *Comandos de Ação:*
/retry [ID] - Retenta enviar um pedido
/buscar [email] - Busca pedidos por email

🔔 *Alertas:*
/alertas - Status dos alertas automáticos

ℹ️ *Informações:*
/ajuda - Mostra esta mensagem
/status - Status do sistema

💡 Seu Chat ID: \`${chatId}\`
${isAdmin(chatId) ? '✅ Você é admin' : '⚠️ Configure seu ID como admin no backend/.env'}
`;

    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  });

  // Comando /ajuda
  bot.onText(/\/ajuda/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Use /start para ver todos os comandos disponíveis.');
  });

  // Comando /hoje
  bot.onText(/\/hoje/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const metrics = getMetricsSummary('today');
      
      const message = `
📊 *Métricas de Hoje*

📦 Total: *${metrics.current.totalOrders}* pedidos
✅ Taxa de Sucesso: *${metrics.current.successRate}%*
❌ Falhas: *${metrics.current.failedOrders}*
⏱️ Tempo Médio: *${Math.round(metrics.current.avgTimeToSent)}* min

📈 vs. Ontem:
${metrics.deltas.totalOrders >= 0 ? '📈' : '📉'} Pedidos: ${metrics.deltas.totalOrders > 0 ? '+' : ''}${metrics.deltas.totalOrders.toFixed(1)}%
${metrics.deltas.successRate >= 0 ? '📈' : '📉'} Sucesso: ${metrics.deltas.successRate > 0 ? '+' : ''}${metrics.deltas.successRate.toFixed(1)}%
`;

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar métricas: ' + error.message);
    }
  });

  // Comando /7dias
  bot.onText(/\/7dias/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const metrics = getMetricsSummary('7d');
      
      const message = `
📊 *Últimos 7 Dias*

📦 Total: *${formatNumber(metrics.current.totalOrders)}* pedidos
✅ Taxa de Sucesso: *${metrics.current.successRate}%*
❌ Falhas: *${metrics.current.failedOrders}*
⏱️ Tempo Médio: *${Math.round(metrics.current.avgTimeToSent)}* min

📈 vs. 7 dias anteriores:
${metrics.deltas.totalOrders >= 0 ? '📈' : '📉'} Pedidos: ${metrics.deltas.totalOrders > 0 ? '+' : ''}${metrics.deltas.totalOrders.toFixed(1)}%
${metrics.deltas.successRate >= 0 ? '📈' : '📉'} Sucesso: ${metrics.deltas.successRate > 0 ? '+' : ''}${metrics.deltas.successRate.toFixed(1)}%
`;

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar métricas: ' + error.message);
    }
  });

  // Comando /30dias
  bot.onText(/\/30dias/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const metrics = getMetricsSummary('30d');
      
      const message = `
📊 *Últimos 30 Dias*

📦 Total: *${formatNumber(metrics.current.totalOrders)}* pedidos
✅ Taxa de Sucesso: *${metrics.current.successRate}%*
❌ Falhas: *${metrics.current.failedOrders}*
⏱️ Tempo Médio: *${Math.round(metrics.current.avgTimeToSent)}* min

📈 vs. 30 dias anteriores:
${metrics.deltas.totalOrders >= 0 ? '📈' : '📉'} Pedidos: ${metrics.deltas.totalOrders > 0 ? '+' : ''}${metrics.deltas.totalOrders.toFixed(1)}%
${metrics.deltas.successRate >= 0 ? '📈' : '📉'} Sucesso: ${metrics.deltas.successRate > 0 ? '+' : ''}${metrics.deltas.successRate.toFixed(1)}%
`;

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar métricas: ' + error.message);
    }
  });

  // Comando /falhas
  bot.onText(/\/falhas/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const orders = searchOrders({ status: 'failed', limit: 10 });
      
      if (orders.length === 0) {
        bot.sendMessage(chatId, '✅ Nenhum pedido falhado no momento!');
        return;
      }

      let message = `❌ *Pedidos Falhados (${orders.length}):*\n\n`;
      
      orders.forEach(order => {
        message += `📦 *#${order.id}*\n`;
        message += `👤 ${order.payload.customer?.email || 'N/A'}\n`;
        message += `🔄 Tentativas: ${order.attempts}\n`;
        message += `⚠️ Erro: ${order.last_error?.substring(0, 50) || 'N/A'}...\n`;
        message += `📅 ${formatDate(order.created_at)}\n\n`;
      });

      message += `💡 Use /retry [ID] para retentar`;

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar pedidos: ' + error.message);
    }
  });

  // Comando /recentes
  bot.onText(/\/recentes/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const orders = searchOrders({ limit: 10 });
      
      if (orders.length === 0) {
        bot.sendMessage(chatId, '📭 Nenhum pedido encontrado.');
        return;
      }

      let message = `📦 *Últimos ${orders.length} Pedidos:*\n\n`;
      
      orders.forEach(order => {
        const statusEmoji = order.status === 'sent' ? '✅' : order.status === 'failed' ? '❌' : '📥';
        message += `${statusEmoji} *#${order.id}* - ${order.status}\n`;
        message += `👤 ${order.payload.customer?.email || 'N/A'}\n`;
        message += `📅 ${formatDate(order.created_at)}\n\n`;
      });

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar pedidos: ' + error.message);
    }
  });

  // Comando /pedido [ID]
  bot.onText(/\/pedido (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const orderId = match[1].trim();
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const order = getOrderById(orderId);
      
      if (!order) {
        bot.sendMessage(chatId, `❌ Pedido #${orderId} não encontrado.`);
        return;
      }

      const statusEmoji = order.status === 'sent' ? '✅' : order.status === 'failed' ? '❌' : '📥';
      
      let message = `📦 *Pedido #${order.id}*\n\n`;
      message += `${statusEmoji} Status: *${order.status}*\n`;
      message += `👤 Cliente: ${order.payload.customer?.first_name} ${order.payload.customer?.last_name}\n`;
      message += `📧 Email: ${order.payload.customer?.email}\n`;
      message += `💰 Total: R$ ${order.payload.total_price}\n`;
      message += `🔄 Tentativas: ${order.attempts}\n`;
      message += `📅 Criado: ${formatDate(order.created_at)}\n`;
      
      if (order.sent_at) {
        message += `✅ Enviado: ${formatDate(order.sent_at)}\n`;
      }
      
      if (order.last_error) {
        message += `\n⚠️ *Último Erro:*\n${order.last_error}\n`;
      }
      
      if (order.note) {
        message += `\n📝 *Nota:*\n${order.note}\n`;
      }

      message += `\n💡 Use /logs ${orderId} para ver timeline`;

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar pedido: ' + error.message);
    }
  });

  // Comando /logs [ID]
  bot.onText(/\/logs (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const orderId = match[1].trim();
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const logs = getOrderLogs(orderId);
      
      if (logs.length === 0) {
        bot.sendMessage(chatId, `📭 Nenhum log encontrado para pedido #${orderId}.`);
        return;
      }

      let message = `📜 *Timeline do Pedido #${orderId}:*\n\n`;
      
      logs.forEach(log => {
        const emoji = log.event === 'created' ? '📥' : 
                     log.event === 'sent' ? '✅' : 
                     log.event === 'failed' ? '❌' : 
                     log.event === 'retry' ? '🔄' : '•';
        
        message += `${emoji} *${log.event}*\n`;
        if (log.message) {
          message += `   ${log.message}\n`;
        }
        message += `   ${formatDate(log.created_at)}\n\n`;
      });

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar logs: ' + error.message);
    }
  });

  // Comando /retry [ID]
  bot.onText(/\/retry (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const orderId = match[1].trim();
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      bot.sendMessage(chatId, `🔄 Retentando pedido #${orderId}...`);
      
      const result = await retryOrder(orderId, fulfillmentUrl);
      
      if (result.success) {
        bot.sendMessage(chatId, `✅ Pedido #${orderId} reenviado com sucesso!`);
      } else {
        bot.sendMessage(chatId, `❌ Falha ao reenviar pedido #${orderId}:\n${result.error}`);
      }
    } catch (error) {
      bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
    }
  });

  // Comando /buscar [email]
  bot.onText(/\/buscar (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const searchTerm = match[1].trim();
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const orders = searchOrders({ q: searchTerm, limit: 10 });
      
      if (orders.length === 0) {
        bot.sendMessage(chatId, `🔍 Nenhum pedido encontrado para: "${searchTerm}"`);
        return;
      }

      let message = `🔍 *Encontrados ${orders.length} pedido(s):*\n\n`;
      
      orders.forEach(order => {
        const statusEmoji = order.status === 'sent' ? '✅' : order.status === 'failed' ? '❌' : '📥';
        message += `${statusEmoji} *#${order.id}*\n`;
        message += `👤 ${order.payload.customer?.email || 'N/A'}\n`;
        message += `💰 R$ ${order.payload.total_price}\n`;
        message += `📅 ${formatDate(order.created_at)}\n\n`;
      });

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar: ' + error.message);
    }
  });

  // Comando /status
  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    
    const message = `
🤖 *Status do Sistema*

✅ Bot online
✅ Database conectado
✅ API funcionando
✅ Monitoramento ativo

⏰ Última atualização: ${formatDate(new Date().toISOString())}

${isAdmin(chatId) ? '✅ Você é admin' : '⚠️ Acesso limitado'}
`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  });

  // Comando /relatorio - Relatório completo
  bot.onText(/\/relatorio/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const today = getMetricsSummary('today');
      const week = getMetricsSummary('7d');
      const month = getMetricsSummary('30d');
      
      const message = `
📊 *RELATÓRIO COMPLETO*

📅 *HOJE*
📦 ${today.current.totalOrders} pedidos | ✅ ${today.current.successRate}% | ❌ ${today.current.failedOrders}
${today.deltas.totalOrders >= 0 ? '📈' : '📉'} ${today.deltas.totalOrders > 0 ? '+' : ''}${today.deltas.totalOrders.toFixed(1)}% vs ontem

📅 *ÚLTIMOS 7 DIAS*
📦 ${week.current.totalOrders} pedidos | ✅ ${week.current.successRate}% | ❌ ${week.current.failedOrders}
${week.deltas.totalOrders >= 0 ? '📈' : '📉'} ${week.deltas.totalOrders > 0 ? '+' : ''}${week.deltas.totalOrders.toFixed(1)}% vs 7d anteriores

📅 *ÚLTIMOS 30 DIAS*
📦 ${month.current.totalOrders} pedidos | ✅ ${month.current.successRate}% | ❌ ${month.current.failedOrders}
⏱️ Tempo médio: ${Math.round(month.current.avgTimeToSent)} min

🌐 Dashboard: http://localhost:5173
`;

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao gerar relatório: ' + error.message);
    }
  });

  // Comando /alertas - Status dos alertas
  bot.onText(/\/alertas/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      bot.sendMessage(chatId, '⛔ Acesso negado. Você não é admin.');
      return;
    }

    try {
      const { getMonitoringStatus } = await import('./monitoring.js');
      const status = getMonitoringStatus();
      const metrics = getMetricsSummary('7d');
      const failureRate = metrics.current.totalOrders > 0 
        ? (metrics.current.failedOrders / metrics.current.totalOrders) * 100 
        : 0;

      const message = `
🔔 *STATUS DOS ALERTAS*

${status.active ? '✅ Monitoramento ativo' : '⚠️ Monitoramento inativo'}
⏱️ Checagem: A cada 15 minutos
${status.lastChecked ? `📅 Última verificação: ${formatDate(status.lastChecked.toISOString())}` : ''}

📊 *Métricas Atuais (7d):*
❌ Taxa de falha: *${failureRate.toFixed(1)}%*
${failureRate > 20 ? '🚨 ALERTA ATIVO' : '✅ Normal (< 20%)'}

🔔 *Alertas configurados:*
• Taxa de falha > 20%
• Pedidos com 3+ tentativas
• Sistema normalizado

💡 Use /relatorio para ver métricas completas
`;

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Erro ao buscar status: ' + error.message);
    }
  });

  // Handler para comandos não reconhecidos
  bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/') && !msg.text.match(/\/(start|ajuda|hoje|7dias|30dias|falhas|recentes|pedido|logs|retry|buscar|status|relatorio|alertas)/)) {
      bot.sendMessage(msg.chat.id, '❓ Comando não reconhecido. Use /ajuda para ver os comandos disponíveis.');
    }
  });

  console.log('[TELEGRAM] Commands registered');
}

/**
 * Envia notificação de alerta para admins
 */
export function sendAlert(message) {
  if (!bot || adminChatIds.length === 0) {
    return;
  }

  adminChatIds.forEach(chatId => {
    bot.sendMessage(chatId, `🚨 *ALERTA*\n\n${message}`, { parse_mode: 'Markdown' })
      .catch(err => console.error(`[TELEGRAM] Failed to send alert to ${chatId}:`, err.message));
  });
}

/**
 * Envia notificação de informação para admins
 */
export function sendNotification(message) {
  if (!bot || adminChatIds.length === 0) {
    return;
  }

  adminChatIds.forEach(chatId => {
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
      .catch(err => console.error(`[TELEGRAM] Failed to send notification to ${chatId}:`, err.message));
  });
}

/**
 * Desliga o bot
 */
export function stopTelegramBot() {
  if (bot) {
    bot.stopPolling();
    console.log('[TELEGRAM] Bot stopped');
  }
}

