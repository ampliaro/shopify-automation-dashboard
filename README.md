# Shopify Automation Dashboard

> Dashboard comercial para automação de pedidos Shopify com métricas em tempo real, retry inteligente e gestão completa de fulfillment.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ampliaro/shopify-automation-dashboard/pulls)

---

## Demo

**🔗 Links:**

- [Landing Page](https://shopify-automation-dashboard.vercel.app)
- [Demo Interativa](https://shopify-automation-dashboard.vercel.app/demo)

---

## Features

- **Webhook Shopify** com validação HMAC e idempotência garantida
- **Métricas em tempo real** com comparativos de período (Hoje/7d/30d)
- **Retry automático** para pedidos falhados (individual ou em lote)
- **Filtros avançados** por status, período, data específica e busca textual
- **Timeline completa** de eventos com logs detalhados
- **Dark mode** com persistência de preferência
- **Heatmap** de distribuição horária de pedidos
- **Exportação CSV** com métricas agregadas
- **Demo mode** com dados mockados para showcase público

---

## Quick Start

> **Primeira vez?** Veja [DEPLOY.md](DEPLOY.md) para instruções de deploy na Vercel.

```bash
# Clone e instale
git clone https://github.com/ampliaro/shopify-automation-dashboard.git
cd shopify-automation-dashboard

# Configure backend
cd backend
cp env.example .env
npm install

# Configure frontend
cd ../frontend
cp env.example .env
npm install

# Execute
cd ..
npm run dev  # Ou execute backend e frontend separadamente
```

**Stack:** Node.js 18+ · Express · React 18 · TypeScript · Vite · SQLite

---

## Instalação

### Pré-requisitos

- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
cp env.example .env
# Edite .env conforme necessário
npm install
```

**Importante:** Configure o `ADMIN_TOKEN` no backend e use o **mesmo valor** em `VITE_ADMIN_TOKEN` no frontend.

### 2. Frontend

```bash
cd frontend
cp env.example .env
# Configure as variáveis de ambiente
npm install
```

### 3. Popular Banco de Dados (Opcional)

```bash
cd backend
npm run seed
```

Cria 60-120 pedidos fictícios distribuídos nos últimos 30 dias.

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

```env
# Shopify
SHOPIFY_SHARED_SECRET=shpss_seu_secret_aqui

# Fulfillment API
FULFILLMENT_URL=https://api.fulfillment.com/orders

# Server
PORT=3001
DATABASE_URL=./data/app.db
NODE_ENV=development
ENABLE_MOCK=true

# Security (DEVE corresponder ao frontend!)
ADMIN_TOKEN=seu_token_seguro_aqui
```

### Frontend (`frontend/.env`)

```env
# API Base
VITE_API_BASE=http://localhost:3001

# Auth (DEVE ser igual ao backend!)
VITE_ADMIN_TOKEN=seu_token_seguro_aqui

# Demo Mode (true = usa mocks, false = API real)
VITE_DEMO_MODE=false

# Contact URL
VITE_CONTACT_URL=mailto:studio@ampliaro.com
```

**⚠️ Importante:** `ADMIN_TOKEN` e `VITE_ADMIN_TOKEN` devem ser **idênticos**.

---

## Uso

### Dashboard

Acesse `http://localhost:5173` (ou `/demo` para modo demo)

**Funcionalidades:**

- **Cards de métricas**: Total de pedidos, taxa de sucesso, falhas, tempo médio
- **Gráfico de tendências**: Visualização temporal por status
- **Heatmap**: Distribuição de pedidos por hora (modo "Hoje")
- **Filtros**: Por status, período, data específica, busca por ID/email
- **Drawer de detalhes**: Informações completas + timeline de eventos
- **Retry**: Individual ou em lote para pedidos falhados
- **Exportação CSV**: Relatórios com métricas agregadas

### API Endpoints

#### Públicos

```
POST   /webhook/shopify    # Recebe webhooks (validação HMAC)
GET    /healthz            # Health check
```

#### Administrativos (requerem header `x-admin-token`)

**Métricas:**
```
GET    /metrics/summary?range={today|7d|30d}
GET    /metrics/timeseries?range={today|7d|30d}
GET    /metrics/heatmap
```

**Pedidos:**
```
GET    /orders?status=&q=&range=&specificDate=&limit=&offset=
GET    /orders/:id
GET    /orders/:id/logs
POST   /orders/:id/retry
POST   /orders/bulk/retry
PATCH  /orders/:id
```

**Relatórios:**
```
GET    /reports/export.csv?range={today|7d|30d}&status=
```

**Exemplo de retry:**

```bash
curl -X POST http://localhost:3001/orders/12345/retry \
  -H "x-admin-token: seu_token_aqui"
```

📖 Coleção completa: [docs/api_collection.json](docs/api_collection.json)

---

## Integração Shopify

### 1. Criar Custom App

1. Acesse `https://sua-loja.myshopify.com/admin`
2. **Settings → Apps and sales channels → Develop apps**
3. **Create an app** → Configure permissões:
   - `read_orders`
   - `write_orders`

### 2. Configurar Webhook

1. **API credentials → Webhooks → Add webhook**
2. Configure:
   - **Event**: `Orders creation`
   - **Format**: `JSON`
   - **URL**: `https://seu-backend.com/webhook/shopify`
   - **API version**: Latest
3. Copie o **API secret key**
4. Adicione ao `backend/.env`:
   ```env
   SHOPIFY_SHARED_SECRET=shpss_seu_secret_aqui
   ```

### 3. Testar Webhook

Use **Send test notification** no Shopify ou:

```bash
# Desenvolvimento local com ngrok
ngrok http 3001
# Configure a URL ngrok no webhook Shopify
```

---

## Deploy

### Vercel (Frontend com Demo Mode)

```bash
cd frontend
npm run build
vercel --prod
```

**Environment Variables:**
- `VITE_DEMO_MODE=true`
- `VITE_CONTACT_URL=mailto:studio@ampliaro.com`

📖 Guia completo: [DEPLOY.md](DEPLOY.md)

### Docker

```bash
docker-compose up --build
```

Acessa `http://localhost:5173`

---

## Scripts

### Backend

```bash
npm run dev        # Servidor de desenvolvimento (nodemon)
npm run start      # Produção
npm run seed       # Popular banco com dados de teste
npm test           # Executar testes
```

### Frontend

```bash
npm run dev          # Servidor de desenvolvimento (porta 5173)
npm run build        # Build de produção
npm run preview      # Preview da build
npm run lint         # ESLint
npm run lint:fix     # ESLint com auto-fix
npm run format       # Prettier
npm run type-check   # Verificar tipagem TypeScript
```

---

## Arquitetura

```
shopify-automation-dashboard/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express + rotas
│   │   ├── db.js           # SQLite + queries
│   │   ├── hmac.js         # Validação Shopify
│   │   ├── orders.js       # Lógica de pedidos
│   │   ├── metrics.js      # Analytics
│   │   └── reports.js      # CSV export
│   ├── scripts/
│   │   └── seed-orders.js  # Seed de dados
│   └── test/               # Testes unitários
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx # Landing page
│   │   │   ├── Demo.tsx    # Demo pública
│   │   │   └── Admin.tsx   # Dashboard principal
│   │   ├── components/     # MetricCards, Charts, Drawer, etc.
│   │   ├── mocks/          # Dados mockados para demo
│   │   └── lib/api.ts      # Cliente API com DEMO_MODE
│   ├── vercel.json         # Config Vercel (SPA rewrites)
│   └── public/             # Assets estáticos
└── docker-compose.yml
```

---

## Modo Demo

Para deploy público sem expor credenciais:

```bash
# frontend/.env
VITE_DEMO_MODE=true
```

**Benefícios:**
- ✅ Funciona 100% offline (sem backend)
- ✅ 50+ pedidos mockados estáveis
- ✅ Todas as features funcionais
- ✅ Perfeito para showcase

**Limitações:**
- Dados fictícios
- Ações de retry/update simuladas
- Exportação CSV desabilitada

---

## Testes

```bash
cd backend
npm test
```

**Cobertura:**
- Validação HMAC de webhooks
- Verificação de idempotência
- Processamento de pedidos
- Atualização de status

---

## Troubleshooting

### Build falha

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Failed to fetch" na demo

→ Certifique-se que `VITE_DEMO_MODE=true` está definido no `.env` e reinicie o dev server.

### Webhooks não chegam

→ Verifique `SHOPIFY_SHARED_SECRET` no backend e confirme URL pública acessível.

### ADMIN_TOKEN mismatch

→ Garanta que `backend/.env` e `frontend/.env` têm o mesmo token.

---

## Roadmap

- Suporte multi-loja (multi-tenant)
- Migração para PostgreSQL/Prisma
- Worker para retry automático em background
- Dashboard administrativo para gerenciar lojas
- Integração com mais plataformas (Nuvemshop, Magento)
- Métricas avançadas de conversão

---

## Licença

MIT License © 2025 Studio Ampliaro. Veja [LICENSE](LICENSE) para detalhes.

---

## Links

- **Repositório**: https://github.com/ampliaro/shopify-automation-dashboard
- **Issues**: https://github.com/ampliaro/shopify-automation-dashboard/issues
- **Landing Page**: https://shopify-automation-dashboard.vercel.app
- **Demo**: https://shopify-automation-dashboard.vercel.app/demo

---

**Studio Ampliaro** · [GitHub](https://github.com/ampliaro) · [Email](mailto:studio@ampliaro.com)
