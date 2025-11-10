# ✅ Checklist de Deploy — Shopify Automation Dashboard

Use este checklist para garantir que tudo está pronto para o deploy e showcase.

---

## 📝 Antes do Deploy

### Personalização

- [ ] **Atualizar CONTACT_URL**
  - Arquivo: `frontend/.env` (ou Vercel Dashboard)
  - Alterar para: sua URL de contato (LinkedIn, portfolio, etc.)
  - Exemplo: `VITE_CONTACT_URL=https://linkedin.com/in/seu-perfil`

- [ ] **Atualizar informações pessoais no código**
  - [ ] `README.md` → Seção "Contato" (linha ~280)
  - [ ] `frontend/index.html` → Meta author (linha 8)
  - [ ] `frontend/src/pages/Landing.tsx` → Footer (linha 196)

- [ ] **Adicionar screenshots reais**
  - [ ] Rodar projeto: `cd frontend && npm run dev`
  - [ ] Tirar screenshot da landing page (`/`)
  - [ ] Tirar screenshot do dashboard (`/demo`)
  - [ ] Salvar em `frontend/public/screenshot-landing.png`
  - [ ] Salvar em `frontend/public/screenshot-dashboard.png`
  - [ ] Commit: `git add frontend/public/ && git commit -m "docs: add real screenshots"`

### Verificação Local

- [ ] **Build passa sem erros**
  ```bash
  cd frontend
  npm run build
  ```

- [ ] **Type-check OK**
  ```bash
  npm run type-check
  ```

- [ ] **Lint sem warnings**
  ```bash
  npm run lint
  ```

- [ ] **Testar localmente**
  ```bash
  npm run preview
  ```
  - [ ] Acessar http://localhost:4173
  - [ ] Testar landing page
  - [ ] Testar rota `/demo`
  - [ ] Testar rota `/admin` (deve mostrar demo também se DEMO_MODE=true)

---

## 🚀 Deploy

### Git

- [ ] **Push dos commits para GitHub**
  ```bash
  git status
  git push origin main
  ```

### Vercel (escolha uma opção)

**Opção A: Via CLI (recomendado)**

- [ ] Instalar Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy:
  ```bash
  cd frontend
  vercel --prod
  ```
- [ ] Adicionar variáveis de ambiente:
  ```bash
  vercel env add VITE_DEMO_MODE
  # Digite: true
  
  vercel env add VITE_CONTACT_URL
  # Digite: sua URL de contato
  ```
- [ ] Redeploy: `vercel --prod`

**Opção B: Via Dashboard**

- [ ] Acessar [vercel.com/new](https://vercel.com/new)
- [ ] Importar repositório do GitHub
- [ ] Configurar:
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Adicionar Environment Variables:
  - `VITE_DEMO_MODE=true`
  - `VITE_CONTACT_URL=sua-url`
- [ ] Clicar em "Deploy"

---

## ✅ Pós-Deploy

### Verificação

- [ ] **Landing page funciona**
  - [ ] Hero carrega corretamente
  - [ ] CTAs funcionam
  - [ ] "Falar comigo" abre URL correta
  - [ ] Design responsivo OK (testar mobile)
  - [ ] Sticky CTA mobile funciona

- [ ] **Demo funciona**
  - [ ] Banner "MODO DEMO" aparece
  - [ ] Métricas carregam
  - [ ] Gráficos renderizam
  - [ ] Filtros e busca funcionam
  - [ ] Clique em pedido abre drawer
  - [ ] Dark mode funciona
  - [ ] "Falar comigo" funciona

- [ ] **Rotas funcionam**
  - [ ] `/` → Landing
  - [ ] `/demo` → Demo
  - [ ] `/qualquer-coisa` → Redireciona para `/`

- [ ] **Performance**
  - [ ] Lighthouse score > 80 (opcional)
  - [ ] Página carrega em < 3s

### Documentação

- [ ] **Atualizar README com URL do deploy**
  ```bash
  # Editar README.md
  # Substituir "https://seu-deploy.vercel.app/demo" pela URL real
  
  git add README.md
  git commit -m "docs(readme): add production deployment URL"
  git push
  ```

- [ ] **Adicionar link no GitHub**
  - [ ] Settings → Website → Adicionar URL do deploy
  - [ ] About → Add description e topics (react, typescript, vite, shopify)

---

## 📢 Divulgação

### Portfolio

- [ ] **Adicionar ao portfolio pessoal**
  - Título: "Shopify Automation Dashboard"
  - Descrição: "Dashboard de automações e métricas para Shopify — projeto full-stack com React, TypeScript e Node.js"
  - Link: URL do deploy (`/demo`)
  - GitHub: Link do repositório

### LinkedIn

- [ ] **Criar post sobre o projeto**
  - [ ] Mencionar stack (React, TypeScript, Vite, etc.)
  - [ ] Destacar features (demo pública, dark mode, etc.)
  - [ ] Incluir link para `/demo`
  - [ ] Adicionar screenshot

- [ ] **Adicionar à seção Projetos**
  - Nome: Shopify Automation Dashboard
  - Link: URL do deploy
  - Associar skills: React, TypeScript, Node.js, etc.

### GitHub

- [ ] **Pin o repositório**
  - Settings → Customize your pins → Adicionar projeto

- [ ] **Adicionar topics**
  - react, typescript, vite, shopify, dashboard, automation, portfolio

- [ ] **Atualizar About**
  - Description: "Shopify Automation Dashboard — Portfolio project showcasing React + TypeScript"
  - Website: URL do deploy

---

## 🎯 Extras (Opcional)

### Analytics

- [ ] **Ativar Vercel Analytics**
  - Dashboard Vercel → Project → Analytics → Enable
  - Acompanhar pageviews e performance

### SEO

- [ ] **Adicionar Open Graph image**
  - Criar imagem 1200x630px
  - Salvar em `frontend/public/og-image.png`
  - Adicionar no `index.html`:
    ```html
    <meta property="og:image" content="/og-image.png" />
    ```

### Domínio Custom (Opcional)

- [ ] **Configurar domínio próprio**
  - Vercel Dashboard → Domains → Add
  - Configurar DNS
  - Aguardar propagação

### Melhorias Futuras

- [ ] Adicionar testes com Vitest
- [ ] Configurar Storybook para componentes
- [ ] Adicionar animações (Framer Motion)
- [ ] Implementar i18n completo (PT/EN)
- [ ] Criar versão PWA

---

## 📊 Métricas de Sucesso

Após deployment, acompanhe:

- [ ] **GitHub Stars** (compartilhe com comunidade)
- [ ] **Vercel Analytics** (pageviews, bounce rate)
- [ ] **Feedback** (LinkedIn, comentários)
- [ ] **Portfolio Views** (Google Analytics, se disponível)

---

## 🆘 Troubleshooting

### Build falha

```bash
# Limpar node_modules e reinstalar
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Página em branco

- Verificar console do browser (F12)
- Verificar se `vercel.json` está presente
- Verificar variáveis de ambiente no Vercel

### CTAs não funcionam

- Verificar se `VITE_CONTACT_URL` está definida
- Testar localmente com `.env` configurado

---

## ✨ Pronto!

Quando todos os itens estiverem marcados, seu projeto estará:

✅ Deployado e funcional  
✅ Documentado profissionalmente  
✅ Pronto para impressionar recrutadores  
✅ Showcaseando suas habilidades técnicas  

**Boa sorte com seu portfólio! 🚀**

---

**Dúvidas?** Revise:
- `SUMMARY.md` → O que foi feito
- `DEPLOY.md` → Como fazer deploy
- `README.md` → Documentação completa

