# START HERE - Guia Completo

Guia detalhado para configurar e usar o Dashboard Comercial do Shopify Automation.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Rápida](#instalação-rápida)
3. [Integração Shopify](#integração-shopify)
4. [Usando o Dashboard](#usando-o-dashboard)
5. [Dados de Demonstração](#dados-de-demonstração)
6. [Testes](#testes)
7. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** 
- **Docker** (opcional, para deploy com containers)
- **Git**

> **Nota**: Este projeto usa `sql.js` (SQLite em WASM), então **não é necessário** Visual Studio Build Tools no Windows.

---

## Instalação Rápida

### 1. Clone e Configure

```bash
# Clone o repositório
git clone <repository-url>
cd shopify-automation

# Configure variáveis de ambiente
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

### 2. Configure o Backend (.env)

Edite `backend/.env`:

```env
SHOPIFY_SHARED_SECRET=your_shopify_secret_here
FULFILLMENT_URL=http://localhost:3001/mock/fulfillment
PORT=3001
DATABASE_URL=./data/app.db
NODE_ENV=development
ENABLE_MOCK=true
ADMIN_TOKEN=dev_admin_token_123
```

⚠️ **Importante**: Altere `ADMIN_TOKEN` para um valor seguro em produção!

### 3. Configure o Frontend (.env)

Edite `frontend/.env`:

```env
VITE_API_BASE=http://localhost:3001
VITE_ADMIN_TOKEN=dev_admin_token_123
```

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
# Backend (na pasta backend/)
npm run dev

# Frontend (novo terminal, na pasta frontend/)
npm run dev
```

### 6. Popule com Dados de Demonstração

```bash
# Na pasta backend/
npm run seed
```

Isso criará 60-120 pedidos realistas distribuídos nos últimos 30 dias.

### 7. Acesse o Dashboard

Abra no navegador: **http://localhost:5173**

---

## Integração Shopify

### Passo 1: Criar Custom App no Shopify

1. Acesse o admin do seu Shopify: `https://SEU_LOJA.myshopify.com/admin`
2. Vá em **Settings** → **Apps and sales channels**
3. Clique em **Develop apps**
4. Clique em **Create an app**
5. Dê um nome: `Order Automation`
6. Clique em **Create app**

### Passo 2: Configurar Permissões

1. Vá na aba **Configuration**
2. Em **Admin API integration**, clique em **Configure**
3. Ative as seguintes permissões:
   - `read_orders`
   - `write_orders`
4. Clique em **Save**

### Passo 3: Obter API Credentials

1. Vá na aba **API credentials**
2. Anote o **API secret key** - este é o seu `SHOPIFY_SHARED_SECRET`
3. Copie e cole no seu `backend/.env`:

```env
SHOPIFY_SHARED_SECRET=shpss_1234567890abcdef...
```

### Passo 4: Configurar Webhook

1. Ainda na aba **API credentials**, role até **Webhooks**
2. Clique em **Add webhook**
3. Configure:
   - **Event**: `Orders creation`
   - **Format**: `JSON`
   - **URL**: Sua URL pública + `/webhook/shopify`
     - Em desenvolvimento, use **ngrok** (ver abaixo)
     - Em produção: `https://seu-dominio.com/webhook/shopify`
   - **API version**: Latest
4. Clique em **Save**

### Passo 5: Expor Localhost com ngrok (Desenvolvimento)

```bash
# Instale ngrok (se não tiver)
# https://ngrok.com/download

# Exponha o backend
ngrok http 3001

# Copie a URL gerada (ex: https://abc123.ngrok.io)
# Use como URL do webhook: https://abc123.ngrok.io/webhook/shopify
```

### Passo 6: Testar Webhook

1. No Shopify Admin, crie um pedido de teste
2. Verifique os logs do backend - você deve ver:
   ```
   [WEBHOOK] Received order 1234567890
   [ORDER] Created order 1234567890 with status 'received'
   ```
3. Acesse o dashboard e veja o pedido aparecer

### Validação de Segurança

O sistema automaticamente:

- ✅ Valida HMAC usando o `SHOPIFY_SHARED_SECRET`
- ✅ Verifica idempotência via `X-Shopify-Webhook-Id`
- ✅ Rejeita webhooks inválidos com erro 401

---

## Usando o Dashboard

### Visão Geral

O dashboard está em **http://localhost:5173** e oferece:

- 📊 **Métricas em tempo real** com comparativos
- 📈 **Gráficos de tendência** por dia/hora
- 🔥 **Heatmap** de distribuição horária
- 🔍 **Busca e filtros** avançados
- ✅ **Ações em lote** para retry
- 📝 **Detalhes completos** de cada pedido

### 1. Seletor de Período

No topo, escolha o período de análise:

- **Hoje**: Pedidos do dia atual + heatmap por hora
- **7 dias**: Última semana
- **30 dias**: Último mês

### 2. Cards de Métricas

Exibe 4 métricas principais:

- **Pedidos**: Total no período com delta vs período anterior
- **Taxa de Sucesso**: % de pedidos enviados com sucesso
- **Falhas**: Total de pedidos falhados (alerta se > 20%)
- **Tempo Médio**: Tempo médio até envio ao fulfillment

### 3. Gráfico de Tendência

Série temporal mostrando:

- Total de pedidos
- Enviados (verde)
- Falhados (vermelho)
- Recebidos (azul)

### 4. Heatmap (apenas "Hoje")

Mostra distribuição de pedidos por hora (0-23h) com intensidade de cor.

### 5. Busca e Filtros

**Busca**: Digite ID do pedido ou email do cliente

**Filtro de Status**:
- Todos
- Recebido
- Enviado
- Falhou

### 6. Tabela de Pedidos

Colunas:

- Checkbox (para seleção múltipla)
- ID do pedido
- Data de criação
- Status (badge colorido)
- Email do cliente
- Tentativas
- Nota (📝 se houver)

**Clique em qualquer linha** para abrir detalhes completos.

### 7. Ações em Lote

1. Selecione pedidos falhados (checkbox)
2. Clique em **"Retry Selecionados"**
3. Confirme a ação

O sistema retentará todos os pedidos selecionados.

### 8. Detalhes do Pedido (Drawer)

Ao clicar em um pedido, abre drawer lateral com:

- **Informações do cliente**: Nome, email
- **Endereço de entrega**: Completo
- **Itens**: Produtos, quantidades, SKUs, preços
- **Detalhes**: Datas, tentativas, erros
- **Nota**: Campo editável para observações
- **Timeline**: Histórico completo de eventos

**Ações disponíveis**:
- **Retry**: Retenta envio (se falhado)
- **Marcar como Enviado**: Muda status manualmente
- **Salvar Nota**: Adiciona observação ao pedido

### 9. Exportar CSV

Botão **"Exportar CSV"** no header:

- Exporta pedidos do período e filtro atual
- Inclui todas as colunas essenciais
- Adiciona sumário de métricas ao final
- Download automático do arquivo

---

## Dados de Demonstração

### Gerar Dados de Seed

```bash
cd backend
npm run seed
```

**O que o seed faz**:

- Cria 60-120 pedidos realistas
- Distribui ao longo de 30 dias (mais recentes = mais pedidos)
- Mix de status: ~75% enviados, ~15% falhados, ~10% recebidos
- Clientes e produtos variados
- Endereços brasileiros realistas
- Tentativas e erros coerentes
- Timestamps de envio realistas (30s-10min após criação)
- Logs de eventos para cada pedido

### Limpar e Reiniciar

```bash
# Para limpar o banco e recomeçar:
rm backend/data/app.db
npm run seed
```

---

## Testes

### 1. Health Check

```bash
curl http://localhost:3001/healthz
```

Resposta esperada:
```json
{"status":"ok","timestamp":"2025-11-04T..."}
```

### 2. Testar Métricas (com Admin Token)

```bash
curl -H "x-admin-token: dev_admin_token_123" \
  http://localhost:3001/metrics/summary?range=7d
```

### 3. Testar Webhook com HMAC

Use o script helper:

```bash
cd test
node hmac-test.js sample-order.json
```

Copie o comando cURL gerado e execute.

### 4. Testes Automatizados

```bash
cd backend
npm test
```

---

## Troubleshooting

### Erro: "Admin token is required"

- Verifique se `ADMIN_TOKEN` está configurado no `backend/.env`
- Verifique se `VITE_ADMIN_TOKEN` está configurado no `frontend/.env`
- Certifique-se de que os valores são idênticos

### Erro: "Invalid HMAC signature"

1. Verifique se `SHOPIFY_SHARED_SECRET` está correto
2. Use `test/hmac-test.js` para gerar HMAC válido
3. Certifique-se de que o body é exatamente o mesmo usado no cálculo

### Webhook não aparece no dashboard

1. Verifique logs do backend
2. Confirme que HMAC está correto
3. Verifique se banco de dados foi criado em `backend/data/app.db`
4. Tente criar pedido manualmente via seed

### Erro: "Database not initialized"

```bash
# Certifique-se de que a pasta data existe
mkdir -p backend/data
```

### Porta já em uso (EADDRINUSE)

Mude a `PORT` no `backend/.env` ou encerre o processo:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Gráficos não aparecem

1. Verifique se `recharts` está instalado:
   ```bash
   cd frontend
   npm install recharts
   ```
2. Limpe cache e reinstale:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### ngrok expira (desenvolvimento)

ngrok free tem limite de tempo. Quando expirar:

1. Reinicie: `ngrok http 3001`
2. Copie nova URL
3. Atualize URL do webhook no Shopify

---

## Bot do Telegram (Opcional)

### Configurar Bot

O sistema inclui integração completa com Telegram para monitorar e gerenciar pedidos remotamente.

#### 1. Já tenho o Bot criado

Se você já criou o bot no @BotFather, siga:

```bash
# 1. Adicione o token no backend/.env
TELEGRAM_BOT_TOKEN=seu_token_do_botfather_aqui

# 2. Obtenha seu Chat ID
cd backend
npm run telegram:setup

# 3. Envie uma mensagem para o bot no Telegram
# O script mostrará seu Chat ID

# 4. Adicione o Chat ID no .env
TELEGRAM_ADMIN_CHAT_IDS=seu_chat_id_aqui

# 5. Reinicie o backend
npm run dev
```

#### 2. Criar um novo Bot

Se ainda não tem bot:

1. Abra o Telegram e busque por **@BotFather**
2. Digite `/newbot`
3. Escolha um nome (ex: OrderFlow Bot)
4. Escolha um username (ex: OrderFlowBot ou SuaMarcaBot)
5. Copie o token recebido
6. Siga os passos acima

### Comandos Disponíveis

Uma vez configurado, você pode usar:

**📊 Métricas:**
- `/hoje` - Estatísticas de hoje
- `/7dias` - Últimos 7 dias
- `/30dias` - Últimos 30 dias

**📦 Pedidos:**
- `/falhas` - Lista pedidos falhados
- `/recentes` - Últimos 10 pedidos
- `/pedido [ID]` - Detalhes completos
- `/logs [ID]` - Timeline de eventos

**⚡ Ações:**
- `/retry [ID]` - Retenta enviar pedido
- `/buscar [email]` - Busca por cliente

**ℹ️ Outros:**
- `/status` - Status do sistema
- `/ajuda` - Lista de comandos

### Notificações Automáticas

O bot pode enviar alertas automáticos quando:
- Taxa de falha ultrapassa 20%
- Pedido falha mais de 3 vezes
- Sistema volta ao normal

(Feature disponível para implementação futura)

---

## Próximos Passos

1. **Deploy em Produção**:
   - Configure variáveis de ambiente seguras
   - Use domínio real para webhook
   - Configure SSL/HTTPS
   - Use banco de dados persistente

2. **Personalize**:
   - Ajuste cores no `Admin.css`
   - Adicione campos customizados
   - Integre com sua API de fulfillment real
   - Configure bot do Telegram

3. **Monitore**:
   - Use bot do Telegram para alertas em tempo real
   - Monitore performance das APIs
   - Analise métricas regularmente

---

## Suporte

Para problemas ou dúvidas:

- Verifique logs do backend e frontend
- Consulte documentação do Shopify: https://shopify.dev/docs/apps/webhooks
- Documentação do Telegram Bot: https://core.telegram.org/bots
- Abra uma issue no repositório
