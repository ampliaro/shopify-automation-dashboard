# 🚀 Deploy no Render.com - Guia Passo a Passo

## ✅ Pré-requisitos

- Conta no GitHub (já tem ✓)
- Repositório público (já tem ✓)
- Código já está no GitHub (já tem ✓)

---

## 📝 O QUE FAZER NO NAVEGADOR:

### **PASSO 1: Criar Conta no Render**

1. Acesse: **https://render.com**
2. Clique em **"Get Started for Free"**
3. Escolha **"Sign in with GitHub"**
4. Autorize o Render a acessar seu GitHub
5. ✅ Conta criada!

---

### **PASSO 2: Criar Novo Web Service**

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Na lista de repositórios, encontre: **`ampliaro/shopify-automation-dashboard`**
   - Se não aparecer, clique em "Configure account" e autorize acesso
4. Clique em **"Connect"**

---

### **PASSO 3: Configurar o Serviço**

Preencha os campos:

**Name** (nome do serviço):
```
shopify-automation-dashboard
```

**Region** (região):
```
Oregon (US West)
```
(ou qualquer outra próxima)

**Branch** (branch do Git):
```
main
```

**Root Directory** (deixar vazio):
```
(vazio)
```

**Runtime** (ambiente):
```
Node
```

**Build Command** (comando de build):
```
cd frontend && npm install && npm run build && cd ../backend && npm install && npm run seed
```

**Start Command** (comando de start):
```
cd backend && NODE_ENV=production node src/server.js
```

---

### **PASSO 4: Plano**

Selecione:
```
✅ Free
```

**Free tier inclui:**
- 750 horas/mês (suficiente!)
- 512 MB RAM
- Hiberna após 15 min de inatividade
- ✅ Perfeito para demo de portfólio!

---

### **PASSO 5: Variáveis de Ambiente**

Role até **"Environment Variables"** e adicione:

**Clique em "Add Environment Variable"** para cada uma:

```
NODE_ENV = production
PORT = 10000
DATABASE_URL = ./data/app.db
ENABLE_MOCK = true
FULFILLMENT_URL = http://localhost:10000/mock/fulfillment
SHOPIFY_SHARED_SECRET = demo_secret_for_portfolio
ADMIN_TOKEN = demo_token_for_portfolio
```

**Telegram (opcional):**
```
TELEGRAM_BOT_TOKEN = (seu token se quiser)
TELEGRAM_ADMIN_CHAT_IDS = (seu chat ID se quiser)
```

---

### **PASSO 6: Advanced Settings (opcional)**

**Health Check Path:**
```
/api/healthz
```
(Render vai verificar se está rodando)

**Auto-Deploy:**
```
✅ Yes
```
(Deploy automático quando você fizer push no GitHub)

---

### **PASSO 7: Criar o Web Service**

1. Clique em **"Create Web Service"** (botão azul no fim da página)
2. ⏳ Aguarde o build (5-10 minutos)
3. Você verá os logs em tempo real

---

## ⏳ O QUE ACONTECE DURANTE O BUILD:

```
[1/4] Clonando repositório...
[2/4] Instalando dependências frontend...
[3/4] Building frontend (Vite)...
[4/4] Instalando backend + seed...
✅ Deploy concluído!
```

Quando ver:
```
[SERVER] Running on http://0.0.0.0:10000
[SERVER] Environment: production
```

**Está pronto!** 🎉

---

## 🌐 ACESSAR SUA DEMO:

Render vai gerar uma URL tipo:
```
https://shopify-automation-dashboard.onrender.com
```

**Copie essa URL!**

---

## ⚠️ IMPORTANTE: Free Tier

**O serviço hiberna após 15 minutos** de inatividade.

**O que isso significa:**
- ✅ Primeira request: ~30-60s para "acordar"
- ✅ Depois disso: funcionamento normal
- ✅ Perfeito para demo de portfólio!

**Adicione no README:**
```markdown
## 🌐 Demo Online

**Acesse**: https://shopify-automation-dashboard.onrender.com

⏳ **Nota**: A demo pode levar ~30s para carregar na primeira vez (Render free tier hiberna após inatividade)
```

---

## 🔒 CREDENCIAIS DA DEMO:

Como configuramos `ADMIN_TOKEN = demo_token_for_portfolio`:

**Para acessar a demo**, adicione ao README:

```markdown
### Credenciais Demo

Token de admin (já configurado no frontend):
- `demo_token_for_portfolio`

Dados de demonstração incluem:
- 60-120 pedidos distribuídos em 30 dias
- Mix realista de status (enviados, falhados, recebidos)
- Clientes e produtos fictícios
```

---

## 🎯 APÓS DEPLOY BEM-SUCEDIDO:

### 1. **Teste a URL**
Acesse: `https://seu-app.onrender.com`

### 2. **Adicione Badge no README**

```markdown
[![Demo](https://img.shields.io/badge/Demo-Live-success?logo=render)](https://shopify-automation-dashboard.onrender.com)
```

### 3. **Adicione Seção Demo no README**

No topo, após os badges:

```markdown
## 🌐 Demo Online

**🔗 [Acesse a Demo](https://shopify-automation-dashboard.onrender.com)**

⏳ *Nota: Primeira carga pode levar ~30s (free tier hiberna)*

Dados de demonstração já populados:
- 📊 Métricas dos últimos 30 dias
- 📦 60-120 pedidos fictícios
- 🎨 Dark mode disponível
- 🤖 Bot do Telegram configurável
```

---

## 🐛 TROUBLESHOOTING:

### Build falha?

**Problema**: Erro no `npm run seed`

**Solução**: Remova o seed do buildCommand:
```
buildCommand: cd frontend && npm install && npm run build && cd ../backend && npm install
```

Adicione seed manual após deploy via Shell do Render.

### App não carrega?

**Verifique**:
1. Logs do Render (aba "Logs")
2. Health check passa? (aba "Events")
3. Porta correta? (PORT=10000)

### CORS error?

Já está configurado para aceitar qualquer origin em produção:
```javascript
origin: true
```

---

## 💰 CUSTOS:

**Total**: R$ 0,00/mês

**Free tier Render**:
- ✅ 750 horas/mês (sempre suficiente)
- ✅ Deploy ilimitados
- ✅ Hibernação automática (economia)
- ✅ SSL/HTTPS grátis
- ✅ Custom domain grátis

---

## 🎉 RESULTADO FINAL:

✅ Demo online funcionando  
✅ URL pública para compartilhar  
✅ Auto-deploy (push → deploy automático)  
✅ SSL/HTTPS configurado  
✅ Grátis para sempre  
✅ Perfeito para portfólio  

**Tempo total: 10-15 minutos!** ⚡

---

## 📊 NO SEU PORTFÓLIO:

```
🚀 Shopify Automation Dashboard

Dashboard comercial para automação de pedidos Shopify.

🌐 DEMO ONLINE: https://shopify-dashboard.onrender.com
📂 CÓDIGO: https://github.com/ampliaro/shopify-automation-dashboard

Features: Analytics em tempo real, Bot Telegram, Dark Mode,
Drill-down interativo, Alertas automáticos

Tech: React, TypeScript, Node.js, Express, SQLite, Recharts
```

---

**Pronto para fazer? Qualquer problema, é só avisar!** 🚀

