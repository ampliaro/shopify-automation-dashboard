# Shopify Automation Dashboard

Dashboard comercial para pedidos Shopify com métricas (Hoje/7d/30d), comparativos, heatmap opcional, retries (individual e em lote) e logs. Backend Node/Express com validação HMAC e idempotência; frontend React + Vite. Docker e seed inclusos.

## Preview

![shopify_gif1](https://github.com/user-attachments/assets/bd22c24e-b975-412c-bd59-c82647ee10a5)

*Dashboard com dados fictícios de demonstração*

## Recursos Principais

- Webhook `orders/create` com validação HMAC e idempotência
- Painel `/admin` com cards de métricas, gráficos de tendência e filtros avançados
- Sistema de retry individual e em lote para pedidos falhados
- Logs completos de eventos e timeline
- Exportação CSV com métricas agregadas
- Seed de dados de teste para desenvolvimento

## Quickstart

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/ampliaro/shopify-automation-dashboard.git
cd shopify-automation-dashboard

# Configure variáveis de ambiente
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
# Edite os arquivos .env com suas credenciais

# Instale dependências do backend
cd backend
npm install

# Instale dependências do frontend (novo terminal)
cd frontend
npm install
```

### Executar

```bash
# Backend (porta 3001)
cd backend
npm run dev

# Frontend (porta 5173) - novo terminal
cd frontend
npm run dev
```

Acesse: **http://localhost:5173**

### Com Docker

```bash
docker-compose up --build
```

Acesse: **http://localhost:5173**

## Dashboard

O painel administrativo oferece:

- **Cards de métricas**: Pedidos totais, taxa de sucesso, falhas e tempo médio, com comparativos vs período anterior
- **Gráfico de tendências**: Visualização temporal de pedidos por status (recebidos, enviados, falhados)
- **Heatmap**: Distribuição de pedidos por hora do dia (modo "Hoje")
- **Filtros avançados**: Por status, período, data específica e busca por ID ou email
- **Retry**: Ação individual ou em lote para reprocessar pedidos falhados
- **Drawer de detalhes**: Informações completas do pedido, cliente, itens, endereço e timeline de eventos
- **Logs**: Histórico completo de tentativas e erros
- **Notas**: Campo editável para observações

## Integração Shopify

### Configurar Custom App

1. Acesse o admin Shopify: `https://sua-loja.myshopify.com/admin`
2. Navegue para **Settings → Apps and sales channels → Develop apps**
3. Clique em **Create an app** e dê um nome (ex: "Order Automation")
4. Em **Configuration → Admin API integration**, ative as permissões:
   - `read_orders`
   - `write_orders`
5. Salve as alterações

### Configurar Webhook

1. Vá em **API credentials → Webhooks**
2. Clique em **Add webhook** e configure:
   - **Event**: `Orders creation`
   - **Format**: `JSON`
   - **URL**: `https://seu-dominio.com/webhook/shopify` (em dev, use ngrok)
   - **API version**: Latest
3. Copie o **API secret key** (Shared Secret)
4. Adicione ao `backend/.env`:
   ```env
   SHOPIFY_SHARED_SECRET=shpss_seu_secret_aqui
   ```
5. Use **Send test notification** no Shopify para testar
6. O pedido deve aparecer no dashboard em `/admin`

## Seed / Dados de Teste

Para popular o banco com dados de demonstração:

```bash
cd backend
npm run seed
```

Isso cria 60-120 pedidos fictícios distribuídos nos últimos 30 dias, com mix realista de status, clientes brasileiros e produtos variados.

Para visualizar os dados, acesse o dashboard e explore as diferentes métricas e filtros disponíveis.

## Limitações do MVP

- Fulfillment configurado via URL de API externa
- Autenticação simples baseada em token (`ADMIN_TOKEN`)
- Sem suporte multi-tenant (uma loja por instância)
- CI básico sem deploy automatizado
- Bot Telegram opcional (requer configuração adicional)

## Stack Técnica

**Backend:**
- Node.js + Express
- SQLite (sql.js - WASM, zero dependências nativas)
- Validação HMAC customizada para webhooks Shopify
- Zod para validação de schemas

**Frontend:**
- React 18 + TypeScript
- Vite (build e dev server)
- Recharts para visualizações
- CSS modular com dark mode

**DevOps:**
- Docker + Docker Compose
- Health checks e graceful shutdown

## Estrutura do Projeto

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
│   │   └── seed-orders.js  # Dados de demo
│   ├── test/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/Admin.tsx
│   │   ├── components/     # 6 componentes React
│   │   └── lib/api.ts
│   └── Dockerfile
├── docker-compose.yml
├── LICENSE
├── README.md
└── START_HERE.md
```

## Variáveis de Ambiente

### Backend (.env)

```env
# Shopify
SHOPIFY_SHARED_SECRET=seu_shopify_secret

# Fulfillment API
FULFILLMENT_URL=https://sua-api-fulfillment.com/orders

# Servidor
PORT=3001
DATABASE_URL=./data/app.db
NODE_ENV=production

# Segurança
ADMIN_TOKEN=seu_token_seguro_aqui

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=seu_bot_token
TELEGRAM_ADMIN_CHAT_IDS=123456789
```

### Frontend (.env)

```env
VITE_API_BASE=http://localhost:3001
VITE_ADMIN_TOKEN=mesmo_valor_do_backend
```

**Importante**: `ADMIN_TOKEN` e `VITE_ADMIN_TOKEN` devem ser idênticos.

## API Endpoints

### Públicos

```
POST   /webhook/shopify    # Recebe webhooks (validação HMAC)
GET    /healthz            # Health check
```

### Administrativos (requerem header `x-admin-token`)

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

Coleção completa: [docs/api_collection.json](docs/api_collection.json)


## Testes

```bash
cd backend
npm test
```

Cobertura:
- Validação HMAC de webhooks
- Verificação de idempotência
- Processamento de pedidos
- Atualização de status

## Documentação Adicional

- **[START_HERE.md](START_HERE.md)**: Guia completo de instalação, configuração e troubleshooting
- **[docs/api_collection.json](docs/api_collection.json)**: Coleção Postman/Insomnia

## Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.
