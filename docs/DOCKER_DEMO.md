# 🐳 Demo com Docker

## Por que Docker é a Melhor Opção para Portfólio?

✅ **Funciona em qualquer ambiente** (Windows, Mac, Linux)  
✅ **Setup em 2 minutos** sem configuração complexa  
✅ **Ambiente isolado** - não interfere no sistema  
✅ **Reproduzível** - sempre funciona da mesma forma  
✅ **Profissional** - usado em produção real  

---

## 🚀 Quickstart

```bash
# Clone
git clone https://github.com/ampliaro/shopify-automation-dashboard.git
cd shopify-automation-dashboard

# Configure (opcional - tem defaults)
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Inicie
docker-compose up --build
```

**Aguarde ~2 minutos** e acesse: **http://localhost:5173**

---

## 📊 Dados de Demonstração

### Opção 1: Seed Automático (dentro do container)

```bash
# Em outro terminal, enquanto Docker está rodando:
docker-compose exec api npm run seed
```

Isso cria **60-120 pedidos** distribuídos nos últimos 30 dias.

### Opção 2: Seed antes de subir

```bash
# Se preferir popular antes:
cd backend
npm install
npm run seed
cd ..
docker-compose up
```

---

## 🎯 Para Demonstrar em Entrevistas

### Passo 1: Clone e Configure (30s)
```bash
git clone <repo>
cd shopify-automation-dashboard
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

### Passo 2: Inicie (2 min)
```bash
docker-compose up --build
```

### Passo 3: Popule Dados (10s)
```bash
docker-compose exec api npm run seed
```

### Passo 4: Mostre (5 min)
- Abra http://localhost:5173
- Mostre dashboard com métricas
- Clique no gráfico (drill-down)
- Mostre dark mode
- Mostre filtros salvos
- Abra detalhes de um pedido
- Mostre bot do Telegram (se configurado)

**Tempo total**: ~8 minutos do zero ao funcionando! ⚡

---

## 🎨 Personalize para Demo

### 1. Logo/Branding

Adicione logo da Ampliaro em `frontend/src/assets/logo.png`

### 2. Tema/Cores

Ajuste variáveis CSS em `frontend/src/pages/Admin.css`:

```css
:root {
  --primary-color: #SUA_COR;
  --success-color: #SUA_COR;
  /* ... */
}
```

### 3. Dados Customizados

Edite `backend/scripts/seed-orders.js` para:
- Produtos da sua empresa
- Nomes de clientes específicos
- Valores realistas do seu negócio

---

## 🔧 Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Reiniciar (rebuild)
docker-compose down
docker-compose up --build

# Limpar tudo e recomeçar
docker-compose down -v
docker-compose up --build
```

---

## 💡 Dicas para Portfólio

### No README principal:

```markdown
## 🎬 Demo Rápida

```bash
docker-compose up --build
# Acesse: http://localhost:5173
```

✅ Ambiente completo em 2 minutos
✅ Dados de demonstração incluídos
✅ Zero configuração necessária
```

### No LinkedIn/Portfólio:

```
🚀 Shopify Automation Dashboard

Dashboard comercial completo desenvolvido na Ampliaro Studio.

✨ Rode localmente em 2 minutos via Docker
📊 Analytics em tempo real com drill-down interativo
🤖 Bot Telegram com 16 comandos
🎨 Dark mode + filtros salvos

Tech: React, TypeScript, Node.js, Express, Docker

🔗 https://github.com/ampliaro/shopify-automation-dashboard

⚡ Quickstart: docker-compose up --build
```

---

## ✅ Checklist de Demo

Antes de mostrar para recrutador/cliente:

- [ ] Docker instalado e rodando
- [ ] Repositório clonado
- [ ] `.env` configurado (pelo menos ADMIN_TOKEN)
- [ ] `docker-compose up` executado
- [ ] Seed rodado (dados populados)
- [ ] Dashboard acessível em http://localhost:5173
- [ ] Testou: métricas, gráfico, tabela, dark mode
- [ ] (Opcional) Telegram bot configurado

**Pronto para impressionar!** 🎯

