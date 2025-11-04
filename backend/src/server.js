import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, getDb, getOrders, countOrders, searchOrders, countOrdersWithSearch, getOrderById, getOrderLogs, updateOrderNote } from './db.js';
import { captureRawBody, validateHmac, checkIdempotency } from './hmac.js';
import { processOrder, retryOrder } from './orders.js';
import { getMetricsSummary, getTimeseriesData, getHeatmapData } from './metrics.js';
import { generateOrdersCSV } from './reports.js';
import { initTelegramBot, stopTelegramBot } from './telegram.js';
import { startMonitoring, stopMonitoring } from './monitoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validação de variáveis de ambiente com Zod
const envSchema = z.object({
  SHOPIFY_SHARED_SECRET: z.string().min(1, 'SHOPIFY_SHARED_SECRET is required'),
  FULFILLMENT_URL: z.string().url('FULFILLMENT_URL must be a valid URL'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().default('./data/app.db'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENABLE_MOCK: z.enum(['true', 'false']).default('true'),
  ADMIN_TOKEN: z.string().min(1, 'ADMIN_TOKEN is required'),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ADMIN_CHAT_IDS: z.string().optional(),
});

// Carrega e valida env
let env;
try {
  env = envSchema.parse(process.env);
  console.log('[CONFIG] Environment variables validated successfully');
} catch (error) {
  console.error('[CONFIG] Environment validation failed:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

// Função principal assíncrona
async function startServer() {
  const app = express();
  const PORT = parseInt(env.PORT, 10);

  // Inicializa banco de dados (assíncrono com sql.js)
  const dbPath = path.resolve(__dirname, '..', env.DATABASE_URL);
  await initDb(dbPath);

  // Auto-seed em produção se banco vazio
  if (env.NODE_ENV === 'production') {
    const totalOrders = countOrders({});
    if (totalOrders === 0) {
      console.log('[SEED] Database empty, running auto-seed...');
      const { seedOrdersSync } = await import('../scripts/seed-orders-sync.js');
      await seedOrdersSync();
    }
  }

  // Inicializa Telegram Bot (opcional)
  if (env.TELEGRAM_BOT_TOKEN) {
    initTelegramBot(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_ADMIN_CHAT_IDS, env.FULFILLMENT_URL);
    
    // Inicia monitoramento automático (checa a cada 15 minutos)
    startMonitoring(15);
  } else {
    console.log('[TELEGRAM] Bot token not configured, skipping Telegram integration');
  }

  // CORS restrito ao frontend local
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
  }));

  // Logger simples de requisições
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // Serve arquivos estáticos do frontend em produção
  if (env.NODE_ENV === 'production') {
    const frontendPath = path.resolve(__dirname, '../../frontend/dist');
    app.use(express.static(frontendPath));
    console.log(`[SERVER] Serving frontend from: ${frontendPath}`);
  }

  // JSON parser para rotas normais
  app.use(express.json());

  // ============================================================================
  // MIDDLEWARE
  // ============================================================================

  /**
   * Middleware de autenticação para rotas administrativas
   */
  function requireAdminToken(req, res, next) {
    const token = req.headers['x-admin-token'];
    
    if (!token) {
      return res.status(401).json({ error: 'Admin token is required' });
    }
    
    if (token !== env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }
    
    next();
  }

  // ============================================================================
  // ROTAS
  // ============================================================================

  /**
   * GET /healthz - Health check
   */
  app.get('/healthz', (req, res) => {
    try {
      const db = getDb();
      // Testa conexão com DB
      const stmt = db.prepare('SELECT 1');
      stmt.step();
      stmt.free();
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(503).json({ status: 'error', error: error.message });
    }
  });

  /**
   * GET /metrics/summary - Retorna métricas resumidas para os cards
   * Query params: range (today|7d|30d)
   */
  app.get('/metrics/summary', requireAdminToken, (req, res) => {
    try {
      const { range = '7d' } = req.query;
      const summary = getMetricsSummary(range);
      res.json(summary);
    } catch (error) {
      console.error('[METRICS] Error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics summary' });
    }
  });

  /**
   * GET /metrics/timeseries - Retorna dados de série temporal para o gráfico
   * Query params: range (today|7d|30d)
   */
  app.get('/metrics/timeseries', requireAdminToken, (req, res) => {
    try {
      const { range = '7d' } = req.query;
      const timeseries = getTimeseriesData(range);
      res.json(timeseries);
    } catch (error) {
      console.error('[METRICS] Error:', error);
      res.status(500).json({ error: 'Failed to fetch timeseries data' });
    }
  });

  /**
   * GET /metrics/heatmap - Retorna heatmap por hora do dia (hoje)
   */
  app.get('/metrics/heatmap', requireAdminToken, (req, res) => {
    try {
      const heatmap = getHeatmapData();
      res.json(heatmap);
    } catch (error) {
      console.error('[METRICS] Error:', error);
      res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }
  });

  /**
   * POST /webhook/shopify - Recebe webhook do Shopify
   * Usa raw body capture, validação HMAC e idempotência
   */
  app.post('/webhook/shopify', captureRawBody, validateHmac(env.SHOPIFY_SHARED_SECRET), checkIdempotency, async (req, res) => {
    try {
      const orderData = req.body;
      const orderId = orderData.id?.toString() || orderData.order_id?.toString();

      if (!orderId) {
        return res.status(400).json({ error: 'Missing order ID in payload' });
      }

      console.log(`[WEBHOOK] Received order ${orderId}`);

      // Processa pedido de forma assíncrona
      processOrder(orderId, orderData, env.FULFILLMENT_URL)
        .catch(error => console.error(`[WEBHOOK] Async processing error:`, error));

      // Retorna 200 imediatamente (Shopify espera resposta rápida)
      res.status(200).json({ 
        message: 'Webhook received', 
        order_id: orderId,
        webhook_id: req.webhookId 
      });
    } catch (error) {
      console.error('[WEBHOOK] Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /orders - Lista pedidos com filtros, busca e paginação
   * Query params: status, q (search), range (today|7d|30d), specificDate, limit, offset
   */
  app.get('/orders', requireAdminToken, (req, res) => {
    try {
      const { status, q, range, specificDate, limit = '50', offset = '0' } = req.query;

      const filters = {
        status: status || undefined,
        q: q || undefined,
        range: range || undefined,
        specificDate: specificDate || undefined,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      };

      const orders = searchOrders(filters);
      const total = countOrdersWithSearch({ 
        status: filters.status, 
        q: filters.q, 
        range: filters.range,
        specificDate: filters.specificDate 
      });

      res.json({
        orders,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: filters.offset + filters.limit < total,
        }
      });
    } catch (error) {
      console.error('[ORDERS] Error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  /**
   * GET /orders/:id - Busca um pedido por ID
   */
  app.get('/orders/:id', requireAdminToken, (req, res) => {
    try {
      const orderId = req.params.id;
      const order = getOrderById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('[ORDERS] Error:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  /**
   * GET /orders/:id/logs - Busca logs de um pedido
   */
  app.get('/orders/:id/logs', requireAdminToken, (req, res) => {
    try {
      const orderId = req.params.id;
      const logs = getOrderLogs(orderId);
      res.json({ logs });
    } catch (error) {
      console.error('[ORDERS] Error:', error);
      res.status(500).json({ error: 'Failed to fetch order logs' });
    }
  });

  /**
   * PATCH /orders/:id - Atualiza campos de um pedido (status, note)
   */
  app.patch('/orders/:id', requireAdminToken, async (req, res) => {
    try {
      const orderId = req.params.id;
      const { status, note } = req.body;

      const order = getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Atualiza status se fornecido
      if (status) {
        const validStatuses = ['received', 'sent', 'failed'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status value' });
        }

        const sentAt = status === 'sent' ? new Date().toISOString() : null;
        updateOrderStatus(orderId, status, order.last_error, false, sentAt);
        
        const { createOrderLog } = await import('./db.js');
        createOrderLog(orderId, 'status_updated', `Status manually changed to ${status}`);
      }

      // Atualiza nota se fornecida
      if (note !== undefined) {
        updateOrderNote(orderId, note);
        
        const { createOrderLog } = await import('./db.js');
        createOrderLog(orderId, 'note_added', 'Note updated by admin');
      }

      const updatedOrder = getOrderById(orderId);
      res.json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
      console.error('[ORDERS] Error:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  /**
   * POST /orders/:id/retry - Retenta envio de pedido falhado
   */
  app.post('/orders/:id/retry', requireAdminToken, async (req, res) => {
    try {
      const orderId = req.params.id;

      console.log(`[RETRY] Retrying order ${orderId}`);

      const result = await retryOrder(orderId, env.FULFILLMENT_URL);

      if (result.success) {
        res.json({ 
          message: 'Order retry successful', 
          order_id: orderId,
          status: result.status 
        });
      } else {
        res.status(500).json({ 
          error: 'Order retry failed', 
          order_id: orderId,
          details: result.error 
        });
      }
    } catch (error) {
      console.error('[RETRY] Error:', error);
      
      if (error.message === 'Order not found') {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      if (error.message === 'Only failed orders can be retried') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to retry order' });
    }
  });

  /**
   * POST /orders/bulk/retry - Retenta múltiplos pedidos falhados
   */
  app.post('/orders/bulk/retry', requireAdminToken, async (req, res) => {
    try {
      const { orderIds } = req.body;

      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({ error: 'orderIds must be a non-empty array' });
      }

      console.log(`[BULK_RETRY] Retrying ${orderIds.length} orders`);

      const results = [];
      
      for (const orderId of orderIds) {
        try {
          const result = await retryOrder(orderId, env.FULFILLMENT_URL);
          results.push({
            order_id: orderId,
            success: result.success,
            status: result.status,
            error: result.error || null
          });
        } catch (error) {
          results.push({
            order_id: orderId,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;

      res.json({
        message: `Bulk retry completed: ${successCount} succeeded, ${failedCount} failed`,
        results,
        summary: {
          total: results.length,
          succeeded: successCount,
          failed: failedCount
        }
      });
    } catch (error) {
      console.error('[BULK_RETRY] Error:', error);
      res.status(500).json({ error: 'Failed to process bulk retry' });
    }
  });

  /**
   * GET /reports/export.csv - Exporta pedidos como CSV
   * Query params: range (today|7d|30d), status (opcional)
   */
  app.get('/reports/export.csv', requireAdminToken, (req, res) => {
    try {
      const { range = '7d', status } = req.query;
      
      const csv = generateOrdersCSV(range, status || null);
      
      // Define headers para download
      const filename = `orders-${range}-${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Adiciona BOM para suporte UTF-8 no Excel
      res.write('\uFEFF');
      res.end(csv);
    } catch (error) {
      console.error('[REPORTS] Error:', error);
      res.status(500).json({ error: 'Failed to generate CSV report' });
    }
  });

  /**
   * POST /mock/fulfillment - Mock interno de API de fulfillment
   * Responde com sucesso/erro aleatório para simular comportamento real
   */
  if (env.ENABLE_MOCK === 'true') {
    app.post('/mock/fulfillment', (req, res) => {
      const { order_id } = req.body;

      // Simula delay de API externa
      setTimeout(() => {
        // 80% de sucesso, 20% de falha
        const success = Math.random() > 0.2;

        if (success) {
          console.log(`[MOCK] Fulfillment successful for order ${order_id}`);
          res.json({
            success: true,
            fulfillment_id: `FFL-${Date.now()}`,
            order_id,
            message: 'Order processed successfully'
          });
        } else {
          console.log(`[MOCK] Fulfillment failed for order ${order_id}`);
          res.status(500).json({
            success: false,
            error: 'Fulfillment service temporarily unavailable',
            order_id
          });
        }
      }, 100 + Math.random() * 400); // 100-500ms delay
    });

    console.log('[MOCK] Mock fulfillment endpoint enabled at POST /mock/fulfillment');
  }

  // ============================================================================
  // ERROR HANDLER
  // ============================================================================

  // Handler de erros central
  app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      ...(env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  // SPA fallback - serve index.html para rotas não-API em produção
  if (env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      const frontendPath = path.resolve(__dirname, '../../frontend/dist');
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    // 404 handler para desenvolvimento
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  // ============================================================================
  // SERVER START
  // ============================================================================

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Running on http://0.0.0.0:${PORT}`);
    console.log(`[SERVER] Environment: ${env.NODE_ENV}`);
    console.log(`[SERVER] Database: ${dbPath}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[SERVER] SIGTERM received, closing server...');
    stopMonitoring();
    stopTelegramBot();
    server.close(() => {
      console.log('[SERVER] Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('[SERVER] SIGINT received, closing server...');
    stopMonitoring();
    stopTelegramBot();
    server.close(() => {
      console.log('[SERVER] Server closed');
      process.exit(0);
    });
  });

  return app;
}

// Inicia o servidor
startServer().catch(error => {
  console.error('[SERVER] Failed to start:', error);
  process.exit(1);
});
