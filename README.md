# Shopify Automation - MVP

Sistema de automação de pedidos Shopify que recebe webhooks, valida HMAC, envia para API de fulfillment e disponibiliza painel administrativo para visualização e retry de pedidos.

## Quickstart

1. Clone o repositório:
   ```bash
   git clone <repository-url>
   cd shopify-automation
   ```

2. Configure variáveis de ambiente:
   ```bash
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   ```
   Edite `backend/.env` com seu `SHOPIFY_SHARED_SECRET`.

3. Instale dependências:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. Inicie o backend:
   ```bash
   cd backend
   npm run dev
   ```

5. Em outro terminal, inicie o frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. Acesse o painel: **http://localhost:5173**

7. Teste webhook (veja `START_HERE.md` para exemplos com HMAC)

## Demo

- **Backend API**: http://localhost:3001
- **Frontend Admin**: http://localhost:5173
- **Health Check**: http://localhost:3001/healthz

### Endpoints Principais

- `POST /webhook/shopify` - Recebe webhook do Shopify
- `GET /orders?status=&limit=&offset=` - Lista pedidos
- `POST /orders/:id/retry` - Retenta envio de pedido falhado
- `POST /mock/fulfillment` - Mock interno (dev/test)

## Docker

```bash
docker-compose up --build
```

Acesse:
- API: http://localhost:3001
- Web: http://localhost:5173

## Documentação Completa

Consulte [START_HERE.md](START_HERE.md) para instruções detalhadas de setup, exemplos de teste e troubleshooting.

## Tech Stack

- **Backend**: Node.js, Express, SQLite, Zod
- **Frontend**: React, TypeScript, Vite
- **Infraestrutura**: Docker, Docker Compose

## Estrutura

```
├── backend/          # API Node.js + Express
│   ├── src/          # Código fonte
│   ├── test/         # Testes unitários e integração
│   └── Dockerfile
├── frontend/         # Interface React
│   ├── src/          # Componentes e páginas
│   └── Dockerfile
├── docs/             # Documentação e coleções API
├── test/             # Artefatos de teste
└── docker-compose.yml
```

## Licença

MIT

