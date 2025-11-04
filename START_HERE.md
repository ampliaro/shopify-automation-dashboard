# START HERE - Guia Completo de Setup

Guia detalhado para configurar e testar o Shopify Automation MVP.

## Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** ou **pnpm**
- **Docker** (opcional, para deploy com containers)
- **Git**

> **Nota**: Este projeto usa `sql.js` (SQLite em WASM) ao invés de `better-sqlite3`, então **não é necessário** Visual Studio Build Tools no Windows.

## Variáveis de Ambiente

### Backend (`backend/.env`)

Copie `backend/env.example` para `backend/.env` e configure:

```env
# Secret compartilhado com Shopify (obrigatório)
SHOPIFY_SHARED_SECRET=your_secret_here

# URL da API de fulfillment
FULFILLMENT_URL=http://localhost:3001/mock/fulfillment

# Porta do servidor
PORT=3001

# Caminho do banco de dados SQLite
DATABASE_URL=./data/app.db

# Ambiente (development, production, test)
NODE_ENV=development

# Habilita endpoint mock de fulfillment (true/false)
ENABLE_MOCK=true
```

**Importante**: `SHOPIFY_SHARED_SECRET` deve ser o mesmo configurado no painel do Shopify para webhooks.

### Frontend (`frontend/.env`)

Copie `frontend/env.example` para `frontend/.env`:

```env
# URL base da API backend
VITE_API_BASE=http://localhost:3001
```

## Como Rodar

### Modo npm (Desenvolvimento)

#### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Servidor rodando em: http://localhost:3001

#### 2. Frontend (novo terminal)

```bash
cd frontend
npm install
npm run dev
```

Interface rodando em: http://localhost:5173

### Modo Docker

```bash
# Build e start
docker-compose up --build

# Para parar
docker-compose down
```

Acesse:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## Teste Manual

### 1. Verificar Health Check

```bash
curl http://localhost:3001/healthz
```

Resposta esperada:
```json
{"status":"ok","timestamp":"2025-11-04T..."}
```

### 2. Gerar HMAC para Webhook

Use o script helper para gerar HMAC válido:

```bash
cd test
node hmac-test.js sample-order.json
```

Isso imprimirá:
- O HMAC calculado
- Comando cURL completo para testar

### 3. Enviar Webhook de Teste

Copie e execute o comando cURL gerado pelo script acima, ou use este exemplo:

```bash
# Defina seu secret
export SHOPIFY_SHARED_SECRET="your_secret_here"

# Envie webhook
curl -X POST http://localhost:3001/webhook/shopify \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-Sha256: <HMAC_GERADO>" \
  -H "X-Shopify-Webhook-Id: test-webhook-$(date +%s)" \
  -d @test/sample-order.json
```

**Nota**: Substitua `<HMAC_GERADO>` pelo valor retornado do `hmac-test.js`.

### 4. Verificar Pedidos

```bash
# Lista todos os pedidos
curl http://localhost:3001/orders

# Filtra por status
curl http://localhost:3001/orders?status=received
curl http://localhost:3001/orders?status=failed

# Com paginação
curl "http://localhost:3001/orders?limit=10&offset=0"
```

### 5. Retry de Pedido Falhado

```bash
# Substitua ORDER_ID pelo ID do pedido
curl -X POST http://localhost:3001/orders/ORDER_ID/retry
```

### 6. Painel Administrativo

Acesse http://localhost:5173 e:

1. Visualize lista de pedidos
2. Filtre por status (Todos, Recebido, Enviado, Falhou)
3. Clique em "Retry" para pedidos falhados
4. Observe atualização automática (refresh a cada 10s)

## Testes Automatizados

### Backend

```bash
cd backend
npm test
```

Executa:
- Testes unitários de validação HMAC
- Testes de integração de rotas

## Coleção Postman/Insomnia

Importe `docs/api_collection.json` no Postman ou Insomnia para ter todos os endpoints pré-configurados.

## Gravar Demo (GIF)

### Usando ffmpeg (Linux/Mac)

```bash
# Captura tela
ffmpeg -video_size 1920x1080 -framerate 25 -f x11grab -i :0.0 \
  -t 30 output.mp4

# Converte para GIF
ffmpeg -i output.mp4 -vf "fps=10,scale=800:-1:flags=lanczos" \
  -c:v gif output.gif
```

### Usando ShareX (Windows)

1. Baixe [ShareX](https://getsharex.com/)
2. Capture > Screen recording
3. Exporte como GIF

### Usando Kap (Mac)

1. Baixe [Kap](https://getkap.co/)
2. Selecione área e grave
3. Exporte como GIF

## Troubleshooting

### Erro: "Database not initialized"

```bash
# Certifique-se de que a pasta data existe
mkdir -p backend/data
```

### Erro: "EADDRINUSE: address already in use"

Porta já está em uso. Mude a `PORT` no `.env` ou encerre o processo:

```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Erro: "Invalid HMAC signature"

1. Verifique se `SHOPIFY_SHARED_SECRET` está correto
2. Use `test/hmac-test.js` para gerar HMAC válido
3. Certifique-se de que o body do webhook é exatamente o mesmo usado no cálculo do HMAC

### Webhook não aparece no painel

1. Verifique logs do backend
2. Confirme que HMAC está correto
3. Verifique se banco de dados foi criado em `backend/data/app.db`

## Próximos Passos

1. Configure webhook no painel Shopify apontando para sua URL pública
2. Use ngrok para expor localhost: `ngrok http 3001`
3. Configure `SHOPIFY_SHARED_SECRET` com o valor do Shopify
4. Teste com pedidos reais

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

