# Arquitetura e Decisões Técnicas

Este documento explica as decisões de arquitetura e tecnologias escolhidas para o projeto.

## 🏗️ Visão Geral

Sistema de automação e monitoramento de pedidos Shopify com dashboard analítico completo, notificações em tempo real e gestão inteligente de falhas.

### Arquitetura High-Level

```
┌─────────────────┐
│   Shopify       │
│   Webhooks      │
└────────┬────────┘
         │ orders/create
         │ (HMAC validated)
         ↓
┌─────────────────────────────────────────┐
│           Backend (Node.js)             │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │   Express    │  │   Telegram Bot  │ │
│  │   Server     │←→│   Integration   │ │
│  └──────┬───────┘  └─────────────────┘ │
│         │                               │
│         ↓                               │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │   SQLite     │  │   Monitoring    │ │
│  │   (sql.js)   │  │   Service       │ │
│  └──────────────┘  └─────────────────┘ │
└──────────┬──────────────────────────────┘
           │ REST API
           │ (Admin Token)
           ↓
┌─────────────────────────────────────────┐
│        Frontend (React + TS)            │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  Dashboard   │  │   Components    │ │
│  │  Analytics   │  │   (Recharts)    │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
           │
           ↓
┌─────────────────┐
│   Vendedor      │
│   (Browser)     │
└─────────────────┘
```

---

## 🎯 Decisões Técnicas

### Por que sql.js e não better-sqlite3?

**Problema**: better-sqlite3 requer build tools nativos (Visual Studio Build Tools no Windows), causando problemas em diferentes ambientes.

**Solução**: sql.js (SQLite compilado para WebAssembly)

**Benefícios**:
- ✅ Zero dependências nativas
- ✅ Funciona em qualquer OS sem configuração
- ✅ Deploy mais simples (Docker, cloud functions)
- ✅ Portabilidade total

**Trade-off**: ~10-15% mais lento, mas imperceptível em volumes de < 100k pedidos.

---

### Por que Validação HMAC Manual?

**Decisão**: Implementar validação HMAC customizada em vez de usar biblioteca.

**Motivo**:
- Shopify usa SHA256 específico
- Raw body capture necessário
- Controle total sobre o processo
- Zero dependencies extras
- Educacional (mostra expertise)

**Implementação**:
```javascript
// hmac.js
const hmac = crypto.createHmac('sha256', secret);
hmac.update(rawBody, 'utf8');
const hash = hmac.digest('base64');
```

---

### Por que Recharts?

**Alternativas consideradas**:
- Chart.js → Muito configuração
- D3.js → Overkill para o caso de uso
- ApexCharts → Pesado (200kb+)

**Escolha**: Recharts

**Motivos**:
- ✅ React-first (componentes nativos)
- ✅ Leve (~90kb gzipped)
- ✅ API declarativa simples
- ✅ Responsivo out-of-the-box
- ✅ Customização fácil via props

---

### Por que Telegram e não outras plataformas?

**Comparação**:

| Plataforma | API Gratuita | Limite | Complexidade |
|------------|--------------|--------|--------------|
| Telegram | ✅ Sim | Ilimitado | 🟢 Baixa |
| WhatsApp | ❌ Não | N/A | 🔴 Alta |
| Slack | ✅ Sim | 10k/month | 🟡 Média |
| Discord | ✅ Sim | Ilimitado | 🟢 Baixa |
| Email | ✅ Sim | 100/day | 🟡 Média |

**Escolha**: Telegram

**Motivos**:
- API completamente gratuita e ilimitada
- Polling simples (não precisa webhook público)
- UX excelente (comandos com "/" nativos)
- Push notifications no mobile
- Markdown support nativo

---

### Arquitetura de Estado (Frontend)

**Decisão**: React Hooks + useState (sem Redux/Zustand)

**Por quê**:
- Escopo relativamente pequeno
- Sem estado complexo compartilhado
- Menos boilerplate
- Performance adequada
- Mais fácil de entender

**Quando adicionar State Management**:
- Multi-página com estado compartilhado
- WebSocket real-time updates
- Offline-first features
- Undo/Redo functionality

---

### Por que Monitoramento Polling (15min)?

**Alternativas**:
- WebSocket → Overkill para métricas
- Server-Sent Events → Complexidade adicional
- Polling curto (30s) → Carga desnecessária

**Escolha**: Polling de 15 minutos

**Motivo**:
- Métricas não mudam tão rápido
- Telegram entrega instantaneamente
- Reduz carga no servidor
- Vendedor pode pedir update manual (/relatorio)

---

## 📊 Fluxo de Dados

### Recebimento de Pedido

```
1. Shopify → POST /webhook/shopify
2. Validação HMAC ✓
3. Check idempotency ✓
4. Create order (status: received)
5. Send to fulfillment (async)
   ├─ Success → status: sent, sent_at: now
   └─ Failure → status: failed, last_error: msg
6. Create logs
7. Return 200 OK (fast response)
```

### Retry Flow

```
1. User clicks retry (dashboard ou Telegram)
2. Check order.status === 'failed' ✓
3. Send to fulfillment
   ├─ Success → status: sent, attempts++
   └─ Failure → status: failed, attempts++
4. Create log entry
5. Update UI
```

### Monitoramento

```
Every 15 minutes:
1. Get metrics (7d)
2. Calculate failure rate
3. If rate > 20% && not already alerted:
   → Send Telegram alert
4. Check stuck orders (attempts >= 3)
   → Send alert if found
5. If rate <= 20% && was alerted:
   → Send "normalized" notification
```

---

## 🗄️ Schema do Banco

### Orders Table

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,                    -- Shopify order ID
  created_at DATETIME DEFAULT (datetime('now')),
  status TEXT CHECK(status IN ('received', 'sent', 'failed')),
  payload TEXT NOT NULL,                  -- JSON completo do Shopify
  last_error TEXT,                        -- Último erro de fulfillment
  attempts INTEGER DEFAULT 0,             -- Contador de tentativas
  sent_at DATETIME NULL,                  -- Timestamp de envio bem-sucedido
  note TEXT                               -- Nota do vendedor
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### Order Logs Table

```sql
CREATE TABLE order_logs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  event TEXT NOT NULL,                    -- created, sent, failed, retry, etc.
  message TEXT,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_order_logs_order_id ON order_logs(order_id);
```

### Webhook IDs (Idempotency)

```sql
CREATE TABLE webhook_ids (
  webhook_id TEXT PRIMARY KEY,            -- X-Shopify-Webhook-Id
  received_at DATETIME DEFAULT (datetime('now'))
);
```

**Por que TEXT em vez de INTEGER?**
- IDs do Shopify podem ser muito grandes (> INT64)
- STRING é mais seguro e compatível

---

## 🔒 Segurança

### Validação HMAC (Shopify)

```javascript
// 1. Captura raw body (antes do JSON parse)
// 2. Calcula HMAC-SHA256 com shared secret
// 3. Compara com header X-Shopify-Hmac-Sha256
// 4. Rejeita se inválido (401)
```

**Por que é crítico?**
- Previne webhooks falsificados
- Garante que vem do Shopify
- Evita ataques de replay

### Idempotency

```javascript
// Verifica X-Shopify-Webhook-Id
// Se já processado → retorna 200 sem processar
// Previne duplicação de pedidos
```

### Admin Token

```javascript
// Todas as rotas admin requerem header:
// x-admin-token: <ADMIN_TOKEN>
// 
// Previne acesso não autorizado ao dashboard
```

---

## 📈 Performance

### Otimizações Implementadas

**Backend**:
- Índices em `status` e `created_at` para queries rápidas
- Paginação em todas as listagens
- Lazy loading de logs (só quando necessário)
- Cache em memória do DB (sql.js)

**Frontend**:
- Code splitting (Vite)
- Lazy loading de componentes pesados
- Debounce em buscas (300ms)
- Auto-refresh conservador (30s)
- LocalStorage para preferências

**Banco**:
- Arquivo único (app.db)
- Índices em colunas frequentes
- Queries otimizadas (LIMIT, WHERE indexado)

---

## 🔄 Possíveis Melhorias Futuras

### Curto Prazo
- [ ] WebSocket para updates real-time
- [ ] Retry automático com backoff exponencial
- [ ] Estatísticas por cliente
- [ ] Multi-idioma (i18n)

### Médio Prazo
- [ ] Multi-tenant (SaaS)
- [ ] Autenticação e autorização
- [ ] Integração com outras plataformas (WooCommerce, ML)
- [ ] Dashboard customizável (drag & drop widgets)

### Longo Prazo
- [ ] Machine Learning para predição de falhas
- [ ] API pública para terceiros
- [ ] Mobile app (React Native)
- [ ] Integração com ERPs

---

## 🛠️ Stack Técnica Justificada

| Tecnologia | Versão | Por Quê |
|------------|--------|---------|
| Node.js | 18+ | LTS, async/await nativo, módulos ES6 |
| Express | 4.x | Minimalista, flexível, maduro |
| sql.js | 1.10+ | SQLite WASM, zero deps nativas |
| Zod | 3.x | Validação type-safe, DX excelente |
| React | 18.x | Hooks, Concurrent, DX moderno |
| TypeScript | 5.x | Type safety, IntelliSense |
| Vite | 5.x | Build rápido, HMR instantâneo |
| Recharts | 2.x | React-first, declarativo |
| Telegram Bot API | Latest | Grátis, simples, poderoso |

---

## 📁 Estrutura de Pastas

```
shopify-automation/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express app + rotas
│   │   ├── db.js           # Database layer
│   │   ├── hmac.js         # Validação Shopify
│   │   ├── orders.js       # Lógica de pedidos
│   │   ├── metrics.js      # Cálculos analytics
│   │   ├── reports.js      # Geração CSV
│   │   ├── telegram.js     # Bot integration
│   │   └── monitoring.js   # Alertas automáticos
│   ├── scripts/
│   │   ├── seed-orders.js  # Dados de demo
│   │   └── get-telegram-chat-id.js
│   ├── test/               # Testes automatizados
│   └── data/               # SQLite database
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Admin.tsx   # Dashboard principal
│   │   ├── components/
│   │   │   ├── MetricCards.tsx
│   │   │   ├── TimeseriesChart.tsx
│   │   │   ├── Heatmap.tsx
│   │   │   ├── OrderDrawer.tsx
│   │   │   └── SavedFilters.tsx
│   │   ├── lib/
│   │   │   └── api.ts      # HTTP client
│   │   └── utils/
│   │       └── defaultFilters.ts
│   └── public/             # Assets estáticos
├── docs/
│   ├── FEATURES.md         # Guia de features
│   ├── QUICK_FEATURES.md   # Features rápidas
│   └── api_collection.json # Postman/Insomnia
├── docker-compose.yml
├── ARCHITECTURE.md         # Este arquivo
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── START_HERE.md
```

---

## 🔐 Separação de Responsabilidades

### Backend

**server.js** - Orquestração
- Rotas HTTP
- Middlewares
- Error handling
- Startup/shutdown

**db.js** - Camada de Dados
- Migrations
- CRUD operations
- Queries otimizadas

**orders.js** - Lógica de Negócio
- Processamento de pedidos
- Retry logic
- Integração com fulfillment

**metrics.js** - Analytics
- Cálculos de métricas
- Agregações temporais
- Comparativos

**telegram.js** - Notificações
- Bot commands
- Message formatting
- Alert delivery

**monitoring.js** - Observabilidade
- Health checks periódicos
- Detecção de anomalias
- Trigger de alertas

### Frontend

**Admin.tsx** - Orquestrador
- Estado global da página
- Coordenação entre componentes
- Handlers de eventos

**Components** - Componentes Reutilizáveis
- Lógica isolada
- Props bem definidas
- Responsabilidade única

**api.ts** - HTTP Layer
- Abstração de fetch
- Headers compartilhados
- Type safety

---

## 🚀 Performance e Escalabilidade

### Números Atuais (Testado)

- **Webhook processing**: < 100ms
- **Dashboard load**: < 500ms (com 109 pedidos)
- **Metrics calculation**: < 50ms
- **CSV export**: < 200ms (100 pedidos)
- **Telegram response**: < 1s

### Limites Estimados

**SQLite (sql.js)**:
- Adequado até: ~500k pedidos
- Queries rápidas: < 100ms até 100k registros
- File size: ~50MB com 100k pedidos

**Quando escalar**:
- PostgreSQL/MySQL para > 500k pedidos
- Redis para cache de métricas
- Queue system (Bull/BullMQ) para retries
- Load balancer para múltiplas instâncias

---

## 🧪 Testes

### Cobertura Atual

**Backend**:
- ✅ Validação HMAC
- ✅ Idempotency
- ✅ Webhook processing
- ✅ Order status updates

**Falta Implementar**:
- [ ] Metrics calculation tests
- [ ] CSV generation tests
- [ ] Telegram commands tests
- [ ] Integration tests completos

### Como Testar

```bash
# Backend
cd backend
npm test

# Frontend (quando adicionar)
cd frontend
npm test
```

---

## 🐳 Docker

### Multi-Stage Build

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "src/server.js"]
```

**Benefícios**:
- Imagem final menor
- Cache de layers
- Build reproduzível

---

## 📊 Métricas e Analytics

### Cálculos Implementados

**Taxa de Sucesso**:
```javascript
successRate = (sent / total) * 100
```

**Tempo Médio até Envio**:
```sql
AVG(julianday(sent_at) - julianday(created_at)) * 24 * 60
-- Resultado em minutos
```

**Delta Percentual**:
```javascript
delta = ((current - previous) / previous) * 100
// Com proteção para divisão por zero
```

**Agregação Temporal**:
- Hoje → Por hora
- 7 dias → Por dia
- 30 dias → Por dia

---

## 🎨 Design System

### Cores (Light Mode)

```css
--primary-color: #2196F3;    /* Azul Material */
--success-color: #4CAF50;    /* Verde Material */
--error-color: #F44336;      /* Vermelho Material */
--warning-color: #FF9800;    /* Laranja Material */
```

### Cores (Dark Mode)

```css
--bg-color: #0f1419;         /* GitHub Dark inspired */
--surface-color: #1c2128;
--text-primary: #e6edf3;
--border-color: #30363d;
```

**Inspiração**: GitHub Dark + Material Design

---

## 🔄 CI/CD (Para Implementar)

### Pipeline Sugerido

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  test:
    - Lint code
    - Run tests
    - Build frontend
    - Build backend
  
  deploy:
    - Build Docker images
    - Push to registry
    - Deploy to production
```

---

## 📈 Roadmap Técnico

### V1.0 (Atual)
- ✅ Webhook Shopify
- ✅ Dashboard analytics
- ✅ Telegram bot
- ✅ Dark mode
- ✅ Filtros salvos

### V1.1 (Próximo)
- [ ] Testes completos
- [ ] CI/CD pipeline
- [ ] Docker compose para produção
- [ ] Backup automático do DB

### V2.0 (Futuro)
- [ ] Multi-plataforma (WooCommerce, ML)
- [ ] Multi-tenant
- [ ] API pública
- [ ] WebSocket real-time

---

## 🤝 Contribuições

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](../CONTRIBUTING.md) para guidelines.

## 📝 Licença

MIT License - Veja [LICENSE](../LICENSE) para detalhes.

