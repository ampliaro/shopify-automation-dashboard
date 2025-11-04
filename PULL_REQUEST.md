# feat: Shopify Automation MVP

## Resumo

Implementação completa do MVP de automação Shopify com backend Node.js + Express, frontend React, validação HMAC, integração com fulfillment e painel administrativo.

## O que foi implementado

### Backend
- ✅ Validação HMAC completa com comparação em tempo constante (`crypto.timingSafeEqual`)
- ✅ Idempotência de webhooks via `X-Shopify-Webhook-Id`
- ✅ Banco de dados SQLite com migrações automáticas
- ✅ Rotas: `/webhook/shopify`, `/orders`, `/orders/:id/retry`, `/mock/fulfillment`, `/healthz`
- ✅ Logger de requisições e handler de erros central
- ✅ Validação de variáveis de ambiente com Zod
- ✅ CORS restrito ao frontend
- ✅ Mock de fulfillment desabilitável em produção

### Frontend
- ✅ Interface admin em React + TypeScript
- ✅ Tabela de pedidos com colunas: ID, Data, Status, Tentativas, Último Erro, Ações
- ✅ Filtros por status (all, received, sent, failed)
- ✅ Paginação simples (prev/next)
- ✅ Botão Retry para pedidos falhados
- ✅ Auto-refresh a cada 10s
- ✅ Notificações de sucesso/erro

### Infraestrutura
- ✅ Dockerfile multi-stage para backend
- ✅ Dockerfile com nginx para frontend
- ✅ docker-compose.yml com healthcheck
- ✅ Volume para persistência de dados

### Qualidade
- ✅ Testes unitários de validação HMAC
- ✅ Testes de integração com supertest
- ✅ Documentação completa (README + START_HERE)
- ✅ Artefatos de teste (sample-order.json, hmac-test.js)
- ✅ Coleção Postman/Insomnia

## Como testar localmente

### Pré-requisitos
- Node.js 18+
- npm ou pnpm

### Setup

1. **Clone e configure**
   ```bash
   git checkout feature/shopify-mvp
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   ```

2. **Configure `backend/.env`**
   ```env
   SHOPIFY_SHARED_SECRET=test_secret_123
   FULFILLMENT_URL=http://localhost:3001/mock/fulfillment
   PORT=3001
   DATABASE_URL=./data/app.db
   NODE_ENV=development
   ENABLE_MOCK=true
   ```

3. **Instale dependências**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Inicie backend**
   ```bash
   cd backend
   npm run dev
   ```
   Aguarde: `[SERVER] Running on http://localhost:3001`

5. **Inicie frontend (novo terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Acesse: http://localhost:5173

### Testes

#### 1. Health Check
```bash
curl http://localhost:3001/healthz
```
Esperado: `{"status":"ok","timestamp":"..."}`

#### 2. Enviar Webhook
```bash
cd test
node hmac-test.js sample-order.json
```
Copie o comando cURL gerado e execute.

Esperado: `{"message":"Webhook received","order_id":"5678901234",...}`

#### 3. Listar Pedidos
```bash
curl http://localhost:3001/orders
```

#### 4. Ver no Painel
Acesse http://localhost:5173 e veja o pedido listado.

#### 5. Simular Falha e Retry
Desabilite mock temporariamente ou aguarde uma falha aleatória (20% de chance).
Clique no botão "Retry" no painel.

#### 6. Testes Automatizados
```bash
cd backend
npm test
```

### Teste com Docker

```bash
docker-compose up --build
```

Acesse:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## Observações

### Variáveis de Ambiente
**Crítico**: Configure `SHOPIFY_SHARED_SECRET` em `backend/.env` antes de rodar.

### Mock de Fulfillment
O endpoint `/mock/fulfillment` está habilitado por padrão (`ENABLE_MOCK=true`).
Em produção, use `ENABLE_MOCK=false` e configure `FULFILLMENT_URL` com a API real.

### Banco de Dados
SQLite cria o arquivo automaticamente em `backend/data/app.db` na primeira execução.

### Ports
- Backend: 3001
- Frontend: 5173 (dev) ou 80 (Docker)

## Checklist

- [x] Validação HMAC com comparação em tempo constante
- [x] Idempotência de webhooks
- [x] Banco de dados SQLite com migrações
- [x] Rotas principais (webhook, orders, retry, healthz)
- [x] Mock de fulfillment interno
- [x] Frontend com filtros e paginação
- [x] Botão Retry funcional
- [x] Auto-refresh
- [x] Testes unitários e integração
- [x] Docker e docker-compose
- [x] Documentação completa
- [x] Artefatos de teste

## Próximos passos (fora do escopo do MVP)

- Rate limiting nas rotas
- Autenticação para painel admin
- Métricas e observabilidade (Prometheus/Grafana)
- Deploy em cloud (AWS, GCP, Azure)
- CI/CD pipeline
- Logging estruturado (Winston/Pino)

## Screenshots

_(Adicionar screenshots ou GIF do painel funcionando)_

## Links Úteis

- [README.md](README.md) - Overview do projeto
- [START_HERE.md](START_HERE.md) - Guia detalhado de setup
- [docs/api_collection.json](docs/api_collection.json) - Coleção Postman/Insomnia

