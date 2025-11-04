<div align="center">

# 🚀 Shopify Automation Dashboard

### Dashboard Comercial Completo para Automação e Monitoramento de Pedidos Shopify

<p align="center">
  <strong>Analytics em Tempo Real</strong> • 
  <strong>Gestão Inteligente de Falhas</strong> • 
  <strong>Notificações Automáticas</strong> • 
  <strong>Bot do Telegram</strong>
</p>

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-26A5E4?logo=telegram&logoColor=white)](https://core.telegram.org/bots)

<p align="center">
  <i>Desenvolvido por <a href="https://github.com/ampliaro">Ampliaro Studio</a></i>
</p>

---

[Features](#-features) •
[Demo](#-demo-rápida) •
[Instalação](#-instalação) •
[Documentação](#-documentação) •
[Arquitetura](#-arquitetura) •
[Contribuir](#-contribuindo)

</div>

---

## 📸 Preview

![shopify_gif1](https://github.com/user-attachments/assets/bd22c24e-b975-412c-bd59-c82647ee10a5)

*clientes fictícios*

## ✨ Features

### 📊 **Analytics Completo**

- **Métricas em Tempo Real** com comparativos vs período anterior
- **Gráficos Interativos** (Recharts) - clique para drill-down
- **Heatmap** de distribuição horária
- **Exportação CSV** com métricas agregadas
- **Seletor de Período**: Hoje | 7 dias | 30 dias

### 🎯 **Gestão de Pedidos**

- **Busca Avançada** por ID ou email do cliente
- **Filtros Inteligentes** por status e período
- **Retry Individual** ou **em Lote** para pedidos falhados
- **Detalhes Completos** em drawer lateral
- **Timeline de Eventos** com histórico completo
- **Notas** editáveis para cada pedido

### 🤖 **Bot do Telegram**

- **16 Comandos Disponíveis** para gestão remota
- **Alertas Automáticos** quando taxa de falha > 20%
- **Monitoramento Proativo** a cada 15 minutos
- **Relatórios Sob Demanda** via `/relatorio`
- **Ações Remotas**: retry, busca, detalhes

### 🎨 **UX Moderna**

- **Dark Mode** com transições suaves
- **Filtros Salvos** para acesso rápido
- **Drill-down Interativo** - clique no gráfico → filtra tabela
- **Responsivo** - funciona em desktop, tablet e mobile
- **Tooltips Informativos** em todas as métricas

### 🔒 **Segurança**

- **Validação HMAC** de webhooks Shopify
- **Idempotência** via X-Shopify-Webhook-Id
- **Admin Token** para rotas protegidas
- **CORS** configurado

---

## 🎬 Demo Rápida

### Opção 1: Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/ampliaro/shopify-automation-dashboard.git
cd shopify-automation-dashboard

# Configure variáveis de ambiente
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Edite os .env files com seus tokens

# Inicie com Docker
docker-compose up --build

# Acesse: http://localhost:5173
```

### Opção 2: npm

```bash
# Backend
cd backend
npm install
npm run seed  # Popula com dados de demo
npm run dev

# Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

**Pronto!** Dashboard rodando em **http://localhost:5173**

---

## 🛠️ Tech Stack

<div align="center">

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Node.js, Express, SQLite (sql.js), Zod |
| **Frontend** | React 18, TypeScript, Vite, Recharts |
| **Notificações** | Telegram Bot API |
| **DevOps** | Docker, Docker Compose |
| **Testes** | Node Test Runner, Supertest |

</div>

### Por que essas tecnologias?

- **sql.js**: SQLite em WASM - zero dependências nativas, funciona em qualquer ambiente
- **Vite**: Build ultrarrápido com HMR instantâneo
- **Recharts**: Gráficos React-first, declarativos e responsivos
- **Telegram**: API gratuita e ilimitada para notificações
- **Zod**: Validação type-safe com inferência automática

Veja detalhes em [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [START_HERE.md](START_HERE.md) | Guia completo de instalação e configuração |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Decisões técnicas e arquitetura |
| [FEATURES.md](docs/FEATURES.md) | Guia detalhado de todas as features |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Como contribuir com o projeto |

---

## 🔌 API Endpoints

### Públicos

```http
POST   /webhook/shopify          # Recebe webhooks (validação HMAC)
GET    /healthz                  # Health check
```

### Administrativos (requerem `x-admin-token`)

**Métricas:**
```http
GET    /metrics/summary?range={today|7d|30d}
GET    /metrics/timeseries?range={today|7d|30d}
GET    /metrics/heatmap
```

**Pedidos:**
```http
GET    /orders?status=&q=&range=&specificDate=&limit=&offset=
GET    /orders/:id
GET    /orders/:id/logs
POST   /orders/:id/retry
POST   /orders/bulk/retry
PATCH  /orders/:id
```

**Relatórios:**
```http
GET    /reports/export.csv?range={today|7d|30d}&status=
```

Coleção completa: [docs/api_collection.json](docs/api_collection.json)

---

## 🤖 Comandos do Telegram

### Métricas
```
/hoje     - Estatísticas de hoje
/7dias    - Últimos 7 dias
/30dias   - Últimos 30 dias
/relatorio - Relatório completo
```

### Pedidos
```
/falhas             - Lista pedidos falhados
/recentes           - Últimos 10 pedidos
/pedido [ID]        - Detalhes de um pedido
/logs [ID]          - Timeline de eventos
/buscar [email]     - Busca por cliente
```

### Ações
```
/retry [ID]  - Retenta enviar pedido
/alertas     - Status do monitoramento
/status      - Status do sistema
```

---

## 🏗️ Arquitetura

```
┌──────────────┐
│   Shopify    │
│   Webhooks   │ (HMAC validated)
└──────┬───────┘
       │
       ↓
┌─────────────────────────────────┐
│      Backend (Express)          │
│  ┌────────┐  ┌──────────────┐  │
│  │ SQLite │←→│  Telegram    │  │
│  │(sql.js)│  │     Bot      │  │
│  └────────┘  └──────────────┘  │
│  ┌──────────────────────────┐  │
│  │   Monitoring Service     │  │
│  │   (Auto Alerts 15min)    │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │ REST API (Admin Token)
         ↓
┌─────────────────────────────────┐
│   Frontend (React + TS)         │
│  ┌─────────┐  ┌──────────────┐ │
│  │Dashboard│  │  Components  │ │
│  │Analytics│  │  (Recharts)  │ │
│  └─────────┘  └──────────────┘ │
└─────────────────────────────────┘
```

**Fluxo Completo**: Webhook → Validação → DB → Fulfillment → Logs → Dashboard → Telegram

Detalhes completos em [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 💡 Highlights Técnicos

### 🎯 **Problema Resolvido**

Vendedores Shopify precisam:
- ✅ Monitorar pedidos em tempo real
- ✅ Identificar falhas rapidamente
- ✅ Retentar envios com 1 clique
- ✅ Analisar tendências e padrões
- ✅ Receber alertas proativos

### 🏆 **Solução Implementada**

Dashboard completo com:
- Analytics visual com métricas acionáveis
- Sistema de retry inteligente
- Monitoramento automático 24/7
- Bot Telegram para gestão remota
- Drill-down interativo para investigação

### ⚡ **Diferenciais**

1. **Zero Dependências Nativas** - sql.js (WASM) funciona em qualquer ambiente
2. **Validação HMAC Custom** - Segurança implementada do zero
3. **Drill-down Interativo** - Clique no gráfico → filtra tabela automaticamente
4. **Alertas Inteligentes** - Notificação automática de anomalias
5. **Dark Mode Completo** - Tema otimizado para uso prolongado
6. **Filtros Salvos** - Produtividade com 1 clique
7. **100% Gratuito** - Todas as integrações são free tier

---

## 📊 Métricas do Projeto

- **Linhas de Código**: ~3.500+ (backend + frontend)
- **Componentes React**: 6 componentes principais
- **Endpoints API**: 15 endpoints
- **Comandos Telegram**: 16 comandos
- **Cobertura de Testes**: Backend core functions
- **Performance**: < 500ms dashboard load

---

## 🎓 Skills Demonstradas

### Backend
- [x] REST API design
- [x] Webhook validation (HMAC)
- [x] Database design e migrations
- [x] Idempotency patterns
- [x] Error handling robusto
- [x] Logging estruturado
- [x] External API integration
- [x] Bot development

### Frontend
- [x] React Hooks avançados
- [x] TypeScript strict mode
- [x] Data visualization (charts)
- [x] State management
- [x] Responsive design
- [x] Dark mode implementation
- [x] LocalStorage persistence
- [x] Performance optimization

### DevOps
- [x] Docker containerization
- [x] Docker Compose orchestration
- [x] Environment management
- [x] Health checks
- [x] Graceful shutdown

### Arquitetura
- [x] Separation of concerns
- [x] Modular design
- [x] Scalable structure
- [x] Security best practices
- [x] Documentation thoroughness

---

## 🚀 Quickstart

### Pré-requisitos

- Node.js 18+
- npm
- Docker (opcional)

### Instalação Rápida

```bash
# 1. Clone
git clone https://github.com/ampliaro/shopify-automation-dashboard.git
cd shopify-automation-dashboard

# 2. Configure variáveis
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Edite os .env com seus tokens

# 3. Instale dependências
cd backend && npm install
cd ../frontend && npm install

# 4. Seed de dados de demonstração
cd backend && npm run seed

# 5. Inicie (2 terminais)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 6. Acesse: http://localhost:5173
```

**Com Docker:**
```bash
docker-compose up --build
```

---

## 📋 Funcionalidades Principais

<table>
<tr>
<td width="50%">

### 📊 Dashboard Analytics
- Cards de métricas com deltas
- Gráfico de tendências (4 séries)
- Heatmap de distribuição horária
- Comparativos automáticos
- Alertas visuais de anomalias

### 🔍 Busca e Filtros
- Busca por ID ou email
- Filtro por status
- Filtro por período
- Filtros salvos (localStorage)
- Drill-down do gráfico

</td>
<td width="50%">

### ⚡ Ações Rápidas
- Retry individual
- Bulk retry (seleção múltipla)
- Marcar como enviado
- Adicionar notas
- Exportar CSV

### 🤖 Telegram Bot
- 16 comandos disponíveis
- Alertas automáticos (15min)
- Métricas em tempo real
- Ações remotas
- Relatórios completos

</td>
</tr>
</table>

---

## 🎯 Casos de Uso

### 1. Monitoramento Proativo
```
Vendedor recebe alerta no Telegram:
"🚨 Taxa de falha: 23% nos últimos 7 dias"

Ações:
→ Abre dashboard
→ Clica no pico de falhas no gráfico
→ Vê pedidos específicos daquele dia
→ Faz retry em lote
```

### 2. Investigação de Problemas
```
Cliente reclama: "Meu pedido não foi processado"

Vendedor:
→ /buscar maria@gmail.com (no Telegram)
→ Vê status e tentativas
→ /retry 5108 (retenta direto pelo bot)
→ ✅ Resolvido em 30 segundos
```

### 3. Análise de Performance
```
Gestor quer entender padrões:
→ Seleciona "30 dias"
→ Vê gráfico de tendências
→ Identifica: Segundas têm mais falhas
→ Heatmap mostra: 14h-16h é horário pico
→ Exporta CSV para análise detalhada
```

---

## 🏆 Destaques Técnicos

### Validação HMAC Customizada

```javascript
// Implementação própria de validação Shopify
const hmac = crypto.createHmac('sha256', secret);
hmac.update(rawBody, 'utf8');
const hash = hmac.digest('base64');

if (hash !== shopifyHmac) {
  return res.status(401).json({ error: 'Invalid HMAC' });
}
```

**Por quê**: Segurança crítica + demonstra conhecimento de crypto

### Drill-down Interativo

```typescript
// Click no gráfico → filtra tabela automaticamente
<LineChart onClick={(e) => handleDateClick(e.activeLabel)}>
  // Extrai data do ponto clicado
  // Filtra orders pela data específica
  // Atualiza tabela em tempo real
</LineChart>
```

**Por quê**: UX avançada + interatividade inteligente

### Monitoramento Automático

```javascript
// Checa métricas a cada 15min
setInterval(() => {
  const metrics = getMetricsSummary('7d');
  const failureRate = calculateRate(metrics);
  
  if (failureRate > 20% && !alerted) {
    sendTelegramAlert(`🚨 Taxa de falha: ${failureRate}%`);
  }
}, 15 * 60 * 1000);
```

**Por quê**: Proatividade + automação real

---

## 📖 Documentação

### Para Usuários

- **[START_HERE.md](START_HERE.md)** - Setup completo passo a passo
- **[docs/FEATURES.md](docs/FEATURES.md)** - Guia de todas as features
- **[docs/QUICK_FEATURES.md](docs/QUICK_FEATURES.md)** - Features rápidas

### Para Desenvolvedores

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Decisões técnicas detalhadas
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Como contribuir
- **API Collection** - Postman/Insomnia em [docs/api_collection.json](docs/api_collection.json)

---

## 🗄️ Estrutura do Projeto

```
shopify-automation-dashboard/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express + rotas
│   │   ├── db.js           # SQLite + queries
│   │   ├── hmac.js         # Validação Shopify
│   │   ├── orders.js       # Lógica de pedidos
│   │   ├── metrics.js      # Analytics
│   │   ├── reports.js      # CSV export
│   │   ├── telegram.js     # Bot integration
│   │   └── monitoring.js   # Auto alerts
│   ├── scripts/
│   │   └── seed-orders.js  # Demo data (60-120 pedidos)
│   ├── test/
│   └── Dockerfile
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
│   │   └── lib/
│   │       └── api.ts      # HTTP client
│   └── Dockerfile
├── docs/
│   ├── FEATURES.md
│   ├── QUICK_FEATURES.md
│   └── api_collection.json
├── docker-compose.yml
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## 🔧 Variáveis de Ambiente

### Backend (.env)

```env
# Shopify Integration
SHOPIFY_SHARED_SECRET=your_shopify_secret

# API de Fulfillment
FULFILLMENT_URL=https://your-fulfillment-api.com/orders

# Servidor
PORT=3001
DATABASE_URL=./data/app.db
NODE_ENV=production

# Segurança
ADMIN_TOKEN=your_secure_random_token

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_IDS=123456789
```

### Frontend (.env)

```env
VITE_API_BASE=http://localhost:3001
VITE_ADMIN_TOKEN=same_as_backend_admin_token
```

---

## 🧪 Testes

```bash
cd backend
npm test
```

**Cobertura:**
- ✅ Validação HMAC
- ✅ Idempotency check
- ✅ Webhook processing
- ✅ Order status updates

---

## 🐳 Docker

### Desenvolvimento

```bash
docker-compose up
```

### Produção

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Inclui:**
- Health checks automáticos
- Volumes persistentes
- Restart policies
- Network isolation

---

## 📊 Database Schema

### Orders
```sql
id, created_at, status, payload, last_error, 
attempts, sent_at, note
```

### Order Logs
```sql
id, order_id, event, message, created_at
```

### Webhook IDs
```sql
webhook_id, received_at
```

Índices em `status`, `created_at`, `order_id` para performance.

---

## 🎨 Features Avançadas

### 🌙 Dark Mode
- Toggle no header
- Cores otimizadas (GitHub Dark inspired)
- Preferência persistida (localStorage)
- Transição suave (0.3s)

### 💾 Filtros Salvos
- Salve combinações de filtros
- Aplique com 1 clique
- Gerencie facilmente

### 📊 Drill-down
- Clique em qualquer ponto do gráfico
- Tabela filtra automaticamente
- Badge visual de filtro ativo

---

## 🚦 Roadmap

### ✅ Implementado (v1.0)
- Dashboard analytics completo
- Telegram bot com 16 comandos
- Alertas automáticos
- Dark mode
- Filtros salvos
- Drill-down interativo
- CSV export

### 🔄 Próximas Versões
- [ ] Multi-plataforma (WooCommerce, Mercado Livre)
- [ ] Retry automático com backoff
- [ ] Estatísticas por cliente
- [ ] WebSocket real-time
- [ ] Testes E2E completos

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para guidelines.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Desenvolvido por

<div align="center">

### **Ampliaro Studio**

*Building exceptional digital experiences*

[![GitHub](https://img.shields.io/badge/GitHub-ampliaro-181717?logo=github)](https://github.com/ampliaro)


## 🌟 Mostre seu Apoio

Se este projeto foi útil, considere dar uma ⭐ no repositório!

---

<div align="center">

**[⬆ Voltar ao Topo](#-shopify-automation-dashboard)**

</div>
