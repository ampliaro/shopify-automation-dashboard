# START HERE - Guia Completo

Guia detalhado para configurar e usar o Shopify Automation Dashboard.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação](#instalação)
3. [Integração Shopify](#integração-shopify)
4. [Dados de Demonstração](#dados-de-demonstração)
5. [Usando o Dashboard](#usando-o-dashboard)
6. [Testes](#testes)
7. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** (incluído com Node.js)
- **Git**
- **Docker** (opcional, para execução via containers)

> **Nota**: Este projeto usa `sql.js` (SQLite em WASM), portanto não requer compiladores nativos ou Visual Studio Build Tools.

---

## Instalação

### 1. Clone e Configure

```bash
# Clone o repositório
git clone https://github.com/ampliaro/shopify-automation-dashboard.git
cd shopify-automation-dashboard

# Configure variáveis de ambiente
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

### 2. Configure o Backend (.env)

Edite `backend/.env`:

```env
# Shopify Integration
SHOPIFY_SHARED_SECRET=seu_shopify_secret_aqui

# Fulfillment API
FULFILLMENT_URL=http://localhost:3001/mock/fulfillment

# Servidor
PORT=3001
DATABASE_URL=./data/app.db
NODE_ENV=development

# Segurança - CRÍTICO: Use valor seguro em produção
ADMIN_TOKEN=dev_admin_token_123

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=seu_bot_token
TELEGRAM_ADMIN_CHAT_IDS=123456789
```

**IMPORTANTE**: Altere `ADMIN_TOKEN` para um valor seguro e aleatório em produção.

### 3. Configure o Frontend (.env)

Edite `frontend/.env`:

```env
VITE_API_BASE=http://localhost:3001
VITE_ADMIN_TOKEN=dev_admin_token_123
```

**CRÍTICO**: `VITE_ADMIN_TOKEN` deve ser **idêntico** ao `ADMIN_TOKEN` do backend.

### 4. Instale Dependências

```bash
# Backend
cd backend
npm install

# Frontend (novo terminal)
cd frontend
npm install
```

### 5. Inicie os Servidores

```bash
# Backend (porta 3001)
cd backend
npm run dev

# Frontend (porta 5173) - novo terminal
cd frontend
npm run dev
```

### 6. Acesse o Dashboard

Abra no navegador: **http://localhost:5173**

---

## Integração Shopify

### Passo 1: Criar Custom App

1. Acesse o admin Shopify: `https://sua-loja.myshopify.com/admin`
2. Navegue para **Settings → Apps and sales channels → Develop apps**
3. Clique em **Create an app**
4. Dê um nome: `Order Automation` (ou similar)
5. Clique em **Create app**

### Passo 2: Configurar Permissões

1. Vá na aba **Configuration**
2. Em **Admin API integration**, clique em **Configure**
3. Ative as permissões:
   - `read_orders`
   - `write_orders`
4. Clique em **Save**

### Passo 3: Obter Shared Secret

1. Vá na aba **API credentials**
2. Copie o **API secret key** (este é o `SHOPIFY_SHARED_SECRET`)
3. Cole no `backend/.env`:

```env
SHOPIFY_SHARED_SECRET=shpss_1234567890abcdef...
```

### Passo 4: Configurar Webhook

1. Ainda em **API credentials**, role até **Webhooks**
2. Clique em **Add webhook** e configure:
   - **Event**: `Orders creation`
   - **Format**: `JSON`
   - **URL**: Sua URL pública + `/webhook/shopify`
     - Em desenvolvimento: use ngrok (veja abaixo)
     - Em produção: `https://seu-dominio.com/webhook/shopify`
   - **API version**: Latest
3. Clique em **Save**

### Passo 5: Expor Localhost (Desenvolvimento)

Em desenvolvimento, use ngrok para expor o backend:

```bash
# Instale ngrok: https://ngrok.com/download

# Exponha o backend (porta 3001)
ngrok http 3001

# Copie a URL gerada (ex: https://abc123.ngrok-free.app)
# Use no webhook: https://abc123.ngrok-free.app/webhook/shopify
```

### Passo 6: Testar Webhook

1. No Shopify Admin, crie um pedido de teste **OU**
2. Use **Send test notification** na configuração do webhook
3. Verifique os logs do backend - deve aparecer:
   ```
   [WEBHOOK] Received order 1234567890
   [ORDER] Created order 1234567890 with status 'received'
   ```
4. Acesse o dashboard e veja o pedido listado

### Validação de Segurança

O sistema automaticamente:

- Valida HMAC usando `SHOPIFY_SHARED_SECRET`
- Verifica idempotência via `X-Shopify-Webhook-Id`
- Rejeita webhooks inválidos com erro 401

---

## Dados de Demonstração

### Gerar Seed

Para popular o banco com dados fictícios:

```bash
cd backend
npm run seed
```

**O que o seed faz:**

- Cria 60-120 pedidos realistas
- Distribui ao longo de 30 dias (distribuição natural: mais recente = mais pedidos)
- Mix de status: ~75% enviados, ~15% falhados, ~10% recebidos
- Clientes e produtos brasileiros variados
- Endereços completos e realistas
- Tentativas e erros coerentes com o status
- Timestamps realistas (envio 30s-10min após criação)
- Logs de eventos para cada pedido

### Limpar e Reiniciar

```bash
# Para resetar o banco completamente:
rm backend/data/app.db
npm run seed
```

---

## Usando o Dashboard

### Visão Geral

Dashboard disponível em **http://localhost:5173**

Funcionalidades:

- **Métricas em tempo real**: Cards com totais, taxas e deltas vs período anterior
- **Gráficos de tendência**: Série temporal por dia/hora
- **Heatmap**: Distribuição horária (modo "Hoje")
- **Busca e filtros**: Por ID, email, status, período
- **Ações em lote**: Retry múltiplo
- **Detalhes completos**: Drawer com informações do pedido

### Seletor de Período

No topo, escolha:

- **Hoje**: Pedidos do dia + heatmap por hora
- **7 dias**: Última semana
- **30 dias**: Último mês

### Cards de Métricas

Exibe 4 métricas principais com comparativos:

- **Pedidos**: Total no período
- **Taxa de Sucesso**: % de pedidos enviados
- **Falhas**: Total de pedidos falhados
- **Tempo Médio**: Tempo até envio ao fulfillment

### Gráfico de Tendência

Série temporal mostrando:

- Total de pedidos
- Enviados (verde)
- Falhados (vermelho)
- Recebidos (azul)

Clique em qualquer ponto para filtrar a tabela por aquela data.

### Heatmap (apenas "Hoje")

Mostra distribuição de pedidos por hora (0-23h).

### Busca e Filtros

- **Busca**: Digite ID do pedido ou email do cliente
- **Status**: Todos / Recebido / Enviado / Falhou
- **Período**: Hoje / 7d / 30d
- **Data específica**: Clique no gráfico

### Tabela de Pedidos

Colunas:

- Checkbox (seleção múltipla)
- ID do pedido
- Data de criação
- Status (badge)
- Email do cliente
- Tentativas
- Nota (ícone se houver)

Clique em qualquer linha para abrir detalhes.

### Ações em Lote

1. Selecione pedidos (checkbox)
2. Clique em **"Retry Selecionados"**
3. Confirme

### Drawer de Detalhes

Ao clicar em um pedido:

- Informações do cliente
- Endereço de entrega
- Itens do pedido
- Detalhes de processamento
- Campo de nota editável
- Timeline de eventos

**Ações:**

- **Retry**: Retenta envio (se falhado)
- **Marcar como Enviado**: Altera status manualmente
- **Salvar Nota**: Adiciona observação

### Exportar CSV

Botão no header exporta pedidos do período/filtro atual com métricas agregadas.

---

## Testes

### 1. Health Check

```bash
curl http://localhost:3001/healthz
```

Resposta esperada:
```json
{"status":"ok","timestamp":"2025-11-05T..."}
```

### 2. Testar Métricas

```bash
curl -H "x-admin-token: dev_admin_token_123" \
  http://localhost:3001/metrics/summary?range=7d
```

### 3. Testar Webhook com HMAC

Para gerar um webhook válido com HMAC correto:

```bash
cd test
node hmac-test.js sample-order.json
```

Ou manualmente, usando cURL:

```bash
# 1. Calcule o HMAC do payload
PAYLOAD='{"id":1234567890,"email":"test@example.com","created_at":"2025-11-05T10:00:00Z"}'
SECRET="seu_shopify_secret"

# 2. No Linux/Mac:
HMAC=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)

# 3. No Windows (PowerShell):
# Use o script test/hmac-test.js

# 4. Envie o webhook:
curl -X POST http://localhost:3001/webhook/shopify \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-SHA256: $HMAC" \
  -H "X-Shopify-Webhook-Id: test-webhook-123" \
  -d "$PAYLOAD"
```

### 4. Testes Automatizados

```bash
cd backend
npm test
```

Cobertura:
- Validação HMAC
- Idempotência
- Processamento de pedidos
- Atualização de status

---

## Troubleshooting

### Erro: "Admin token is required"

**Causa**: Token não configurado ou diferente entre backend/frontend.

**Solução**:
1. Verifique `ADMIN_TOKEN` no `backend/.env`
2. Verifique `VITE_ADMIN_TOKEN` no `frontend/.env`
3. Certifique-se de que os valores são **idênticos**
4. Reinicie ambos os servidores

### Erro: "Invalid HMAC signature"

**Causa**: Shared secret incorreto ou payload alterado.

**Solução**:
1. Confirme `SHOPIFY_SHARED_SECRET` no `backend/.env`
2. Use `test/hmac-test.js` para gerar HMAC válido
3. Verifique que o body do webhook não foi modificado

### Webhook não aparece no dashboard

**Diagnóstico**:
1. Verifique logs do backend para erros
2. Confirme que HMAC é válido
3. Verifique se `backend/data/app.db` existe
4. Teste com seed: `npm run seed`

**Solução**:
```bash
# Certifique-se da pasta data
mkdir -p backend/data

# Reinicie o backend
cd backend
npm run dev
```

### Erro: "Database not initialized"

**Solução**:
```bash
mkdir -p backend/data
# O banco será criado automaticamente na primeira execução
```

### Porta já em uso (EADDRINUSE)

**Windows**:
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
lsof -ti:3001 | xargs kill -9
```

**Alternativa**: Mude `PORT` no `backend/.env`

### Frontend não conecta ao backend

**Sintomas**: Métricas não carregam, erro de CORS.

**Solução**:
1. Confirme que backend está rodando em `http://localhost:3001`
2. Verifique `VITE_API_BASE` no `frontend/.env`
3. Verifique console do navegador para erros
4. Teste endpoint direto: `curl http://localhost:3001/healthz`

### Gráficos não aparecem

**Solução**:
   ```bash
   cd frontend
   npm install recharts
npm run dev
   ```

Se persistir:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### ngrok expira (desenvolvimento)

ngrok free tem sessões temporárias.

**Solução**:
1. Reinicie: `ngrok http 3001`
2. Copie nova URL
3. Atualize webhook no Shopify Admin

### Métricas mostram "0" mesmo com seed

**Causa**: Dados podem estar fora do período selecionado.

**Solução**:
1. Selecione período "30 dias"
2. Verifique se seed rodou com sucesso
3. Confirme dados no banco:
   ```bash
   # Conte pedidos
   cd backend
   node -e "import('./src/db.js').then(db => console.log(db.getOrders({}).length))"
   ```

---

## Bot do Telegram (Opcional)

### Configurar

1. Crie bot no **@BotFather** (Telegram)
2. Copie o token recebido
3. Adicione ao `backend/.env`:
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
4. Obtenha seu Chat ID:
```bash
cd backend
npm run telegram:setup
   # Envie mensagem para o bot
   # Script mostrará seu Chat ID
   ```
5. Adicione ao `.env`:
   ```env
   TELEGRAM_ADMIN_CHAT_IDS=123456789
   ```
6. Reinicie backend

### Comandos Disponíveis

**Métricas:**
- `/hoje` - Estatísticas de hoje
- `/7dias` - Últimos 7 dias
- `/30dias` - Últimos 30 dias
- `/relatorio` - Relatório completo

**Pedidos:**
- `/falhas` - Lista pedidos falhados
- `/recentes` - Últimos 10 pedidos
- `/pedido [ID]` - Detalhes de um pedido
- `/logs [ID]` - Timeline de eventos
- `/buscar [email]` - Busca por cliente

**Ações:**
- `/retry [ID]` - Retenta enviar pedido
- `/status` - Status do sistema
- `/ajuda` - Lista de comandos

---

## Próximos Passos

1. **Produção**:
   - Use `ADMIN_TOKEN` seguro (ex: UUID v4)
   - Configure SSL/HTTPS
   - Use domínio real para webhook
   - Configure variáveis via secrets do host

2. **Personalização**:
   - Ajuste cores em `frontend/src/pages/Admin.css`
   - Integre API de fulfillment real
   - Configure bot Telegram para alertas

3. **Monitoramento**:
   - Use bot para receber alertas
   - Analise métricas regularmente
   - Configure logs centralizados (opcional)

---

## Suporte

Para problemas ou dúvidas:

- Verifique logs do backend e console do navegador
- Consulte [documentação Shopify](https://shopify.dev/docs/apps/webhooks)
- Consulte [documentação Telegram Bot](https://core.telegram.org/bots)
- Abra uma issue no repositório
