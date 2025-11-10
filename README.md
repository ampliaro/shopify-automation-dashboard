# Shopify Automation Dashboard

**Dashboard de automações e métricas para Shopify — projeto de portfólio**

Demonstra como construo painéis claros, rápidos e prontos para escalar integrações. Este projeto exemplifica boas práticas de desenvolvimento frontend/backend, com foco em qualidade de código, UX e arquitetura sustentável.

_Shopify automations & metrics dashboard — portfolio project showcasing clean, fast dashboards ready to scale integrations._

---

## 🚀 Demo ao Vivo

🔗 **[Ver Demo Interativa](https://seu-deploy.vercel.app/demo)**

Explore o dashboard completo com dados mockados — sem necessidade de credenciais ou configuração.

---

## ⚡ Quickstart (Desenvolvimento Local)

### Pré-requisitos

- Node.js 18+
- npm

### 1. Clonar e configurar

```bash
git clone https://github.com/ampliaro/shopify-automation-dashboard.git
cd shopify-automation-dashboard

# Configurar variáveis de ambiente
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
# Edite os arquivos .env conforme necessário
```

### 2. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend (em novo terminal)
cd frontend
npm install
```

### 3. Executar em modo desenvolvimento

```bash
# Backend (porta 3001)
cd backend
npm run dev

# Frontend (porta 5173) — novo terminal
cd frontend
npm run dev
```

Acesse: **http://localhost:5173**

### 4. Popular com dados de teste (opcional)

```bash
cd backend
npm run seed
```

---

## 🔧 Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `SHOPIFY_SHARED_SECRET` | `shpss_abc...` | Secret key do webhook Shopify (validação HMAC) |
| `FULFILLMENT_URL` | `https://api.fulfillment.com/orders` | URL da API de fulfillment |
| `PORT` | `3001` | Porta do servidor backend |
| `DATABASE_URL` | `./data/app.db` | Caminho do banco SQLite |
| `NODE_ENV` | `production` | Ambiente de execução |
| `ADMIN_TOKEN` | `seu_token_seguro` | Token de autenticação admin (deve coincidir com frontend) |
| `TELEGRAM_BOT_TOKEN` | _(opcional)_ | Token do bot Telegram para notificações |
| `TELEGRAM_ADMIN_CHAT_IDS` | _(opcional)_ | IDs de chat para alertas |

### Frontend (`frontend/.env`)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `VITE_API_BASE` | `http://localhost:3001` | URL base da API backend |
| `VITE_ADMIN_TOKEN` | `mesmo_do_backend` | Token de autenticação (deve ser idêntico ao backend) |
| `VITE_DEMO_MODE` | `true` | Ativa modo demo com mocks (use `true` no deploy público) |
| `VITE_CONTACT_URL` | `https://linkedin.com/in/seu-perfil` | URL de contato exibida nos CTAs |

**⚠️ Importante:** `ADMIN_TOKEN` e `VITE_ADMIN_TOKEN` devem ter valores idênticos.

---

## 📦 Modo Demo

O projeto inclui um modo demo completo que permite deploy público sem expor credenciais reais.

### Ativar modo demo:

```bash
# frontend/.env
VITE_DEMO_MODE=true
```

Quando ativo:
- Usa dados mockados estáveis em `src/mocks/data.ts`
- Não requer backend em execução
- Permite navegação completa por `/demo`
- Exibe banner informativo sobre o modo demo

### Limitações do modo demo:

- Dados fictícios (50 pedidos distribuídos em 7 dias)
- Ações de retry/update retornam sucesso simulado
- Exportação CSV desabilitada

---

## 🎨 Recursos Principais

### Dashboard (`/demo` ou `/admin`)

- **Cards de métricas**: Pedidos totais, taxa de sucesso, falhas e tempo médio, com comparativos vs período anterior
- **Gráfico de tendências**: Visualização temporal de pedidos por status (recebidos, enviados, falhados)
- **Heatmap**: Distribuição de pedidos por hora do dia (modo "Hoje")
- **Filtros avançados**: Por status, período, data específica e busca por ID ou email
- **Retry**: Ação individual ou em lote para reprocessar pedidos falhados
- **Drawer de detalhes**: Informações completas do pedido, cliente, itens, endereço e timeline de eventos
- **Dark mode**: Alternância entre temas claro e escuro

### Landing Page (`/`)

- Hero section com CTAs claros
- Showcase de features
- Stack técnica
- Links para demo e contato

---

## 🛠️ Stack Técnica

**Frontend:**
- React 18 + TypeScript (strict mode)
- Vite 5 (build e dev server)
- React Router para navegação
- Recharts para visualizações
- ESLint + Prettier configurados
- CSS modular com suporte a dark mode

**Backend:**
- Node.js + Express
- SQLite (sql.js - WASM, zero dependências nativas)
- Validação HMAC customizada para webhooks Shopify
- Sistema de retry com idempotência

**DevOps:**
- Docker + Docker Compose
- Vercel-ready (SPA rewrites)
- Health checks e graceful shutdown

---

## 📁 Estrutura do Projeto

```
shopify-automation-dashboard/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx       # Landing page
│   │   │   ├── Demo.tsx          # Demo pública
│   │   │   └── Admin.tsx         # Dashboard principal
│   │   ├── components/           # 6 componentes React
│   │   ├── mocks/
│   │   │   └── data.ts           # Dados mockados para demo
│   │   ├── lib/
│   │   │   └── api.ts            # Cliente API com suporte a DEMO_MODE
│   │   └── App.tsx               # Router principal
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   ├── vercel.json               # Configuração Vercel
│   └── package.json              # Scripts: dev, build, lint, format
├── backend/
│   ├── src/
│   │   ├── server.js             # Express + rotas
│   │   ├── db.js                 # SQLite + queries
│   │   ├── hmac.js               # Validação Shopify
│   │   ├── orders.js             # Lógica de pedidos
│   │   ├── metrics.js            # Analytics
│   │   └── reports.js            # CSV export
│   ├── scripts/
│   │   └── seed-orders.js        # Seed de dados de teste
│   └── test/                     # Testes unitários
├── docker-compose.yml
└── README.md
```

---

## 🚢 Deploy na Vercel

### Via CLI

```bash
cd frontend
npm run build
npx vercel --prod
```

### Via Dashboard Vercel

1. Importe o repositório GitHub
2. Configure o diretório raiz: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Adicione as variáveis de ambiente:
   - `VITE_DEMO_MODE=true`
   - `VITE_CONTACT_URL=sua_url_de_contato`

O deploy está configurado para SPA com fallback (`vercel.json` já incluído).

---

## 🧪 Scripts Disponíveis

### Frontend

```bash
npm run dev          # Servidor de desenvolvimento (porta 5173)
npm run build        # Build de produção
npm run preview      # Preview da build
npm run lint         # Executar ESLint
npm run lint:fix     # Corrigir problemas ESLint
npm run format       # Formatar código com Prettier
npm run type-check   # Verificar tipagem TypeScript
```

### Backend

```bash
npm run dev          # Servidor de desenvolvimento (nodemon)
npm run seed         # Popular banco com dados de teste
npm test             # Executar testes
```

---

## 🔐 Integração Shopify (Produção)

### 1. Criar Custom App

1. Acesse `https://sua-loja.myshopify.com/admin`
2. Navegue para **Settings → Apps and sales channels → Develop apps**
3. Clique em **Create an app**
4. Em **Configuration → Admin API integration**, ative:
   - `read_orders`
   - `write_orders`

### 2. Configurar Webhook

1. Em **API credentials → Webhooks**, clique em **Add webhook**
2. Configure:
   - **Event**: `Orders creation`
   - **Format**: `JSON`
   - **URL**: `https://seu-backend.com/webhook/shopify`
   - **API version**: Latest
3. Copie o **API secret key** (Shared Secret)
4. Adicione ao `backend/.env`:
   ```env
   SHOPIFY_SHARED_SECRET=shpss_seu_secret_aqui
   ```

---

## 📊 API Endpoints

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

---

## 🧩 Qualidade de Código

- ✅ TypeScript strict mode habilitado
- ✅ ESLint configurado com plugins React, TypeScript, a11y
- ✅ Prettier para formatação consistente
- ✅ Sem `any` explícito (apenas warns)
- ✅ Validação HMAC para webhooks
- ✅ Testes unitários para lógica crítica

---

## ♿ Acessibilidade

- Semântica HTML adequada
- Labels em todos os inputs
- ARIA attributes onde necessário
- Navegação por teclado funcional
- Contraste de cores WCAG AA
- Classe utilitária `.sr-only` para screen readers

---

## 📸 Screenshots

### Landing Page
![Landing page com hero section e CTAs](public/screenshot-landing.png)

### Dashboard
![Dashboard com métricas e gráficos](public/screenshot-dashboard.png)

_Screenshots fictícias — adicione capturas reais em `frontend/public/`._

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

---

## 🤝 Contato

**Rafael Gregório**

- 🔗 Portfolio: [seu-site.com](https://seu-site.com)
- 💼 LinkedIn: [linkedin.com/in/seu-perfil](https://linkedin.com/in/seu-perfil)
- 📧 Email: [seu-email@example.com](mailto:seu-email@example.com)

---

## 📝 Notas

- **Projeto de portfólio**: Este é um projeto demonstrativo. Não está afiliado à Shopify Inc.
- **Modo demo**: A demo pública usa dados fictícios e não requer credenciais reais.
- **Produção**: Para uso em produção, configure todas as variáveis de ambiente adequadamente e implemente autenticação robusta.

---

## 🔍 Documentação Adicional

- **[START_HERE.md](START_HERE.md)**: Guia completo de instalação e troubleshooting
- **[PULL_REQUEST.md](PULL_REQUEST.md)**: Template de PR
- **[docs/api_collection.json](docs/api_collection.json)**: Coleção Postman/Insomnia

---

**Made with ❤️ for my portfolio**
