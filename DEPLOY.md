# 🚀 Guia de Deploy Vercel

Este guia explica como fazer o deploy do Shopify Automation Dashboard na Vercel em modo demo (sem backend).

## Preparação

Certifique-se de que todos os commits foram feitos:

```bash
git status
git log --oneline -10
```

Você deve ver commits como:
- `chore(lint): configure eslint, prettier and typescript strict mode`
- `feat(demo): add mock data infrastructure for public demo`
- `feat(landing): create modern landing page with bilingual microcopy`
- `feat(demo): implement /demo route with DEMO_MODE support`
- `docs(readme): rewrite README to portfolio-level documentation`

## Deploy via CLI (Recomendado)

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login na Vercel

```bash
vercel login
```

### 3. Deploy em modo de produção

```bash
cd frontend
vercel --prod
```

Durante o processo, responda:

- **Set up and deploy?** → `Y`
- **Which scope?** → Selecione sua conta
- **Link to existing project?** → `N` (primeira vez)
- **What's your project's name?** → `shopify-automation-dashboard` (ou nome desejado)
- **In which directory is your code located?** → `./`
- **Want to override settings?** → `Y`
- **Build Command:** → `npm run build`
- **Output Directory:** → `dist`
- **Development Command:** → `npm run dev`

### 4. Configurar Variáveis de Ambiente

Após o deploy inicial, adicione as variáveis de ambiente:

```bash
vercel env add VITE_DEMO_MODE
# Digite: true

vercel env add VITE_CONTACT_URL
# Digite: https://linkedin.com/in/seu-perfil (ou sua URL de contato)
```

Aplique para Production, Preview e Development.

### 5. Redeploy com as variáveis

```bash
vercel --prod
```

## Deploy via Dashboard Vercel

### 1. Importar do GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **New Project**
3. Importe o repositório `ampliaro/shopify-automation-dashboard`

### 2. Configurar o Projeto

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3. Adicionar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_DEMO_MODE` | `true` | Production, Preview, Development |
| `VITE_CONTACT_URL` | `https://linkedin.com/in/seu-perfil` | Production, Preview, Development |

**Importante:** Substitua `https://linkedin.com/in/seu-perfil` pela sua URL real de contato.

### 4. Deploy

Clique em **Deploy** e aguarde o build.

## Verificação Pós-Deploy

### 1. Testar a Landing Page

```
https://seu-projeto.vercel.app/
```

Verifique:
- ✅ Hero section carrega
- ✅ CTAs funcionam
- ✅ "Falar comigo" usa a CONTACT_URL correta
- ✅ Design responsivo funciona

### 2. Testar a Demo

```
https://seu-projeto.vercel.app/demo
```

Verifique:
- ✅ Banner "MODO DEMO" aparece
- ✅ Métricas carregam (dados mockados)
- ✅ Gráficos renderizam
- ✅ Filtros funcionam
- ✅ Clique em pedidos abre drawer
- ✅ Dark mode funciona

### 3. Testar Rotas

```
https://seu-projeto.vercel.app/qualquer-rota-invalida
```

Deve redirecionar para a landing (/) devido ao fallback SPA.

## Atualizar README com URL do Deploy

Após o deploy, atualize o README:

```bash
# Edite README.md
# Substitua "https://seu-deploy.vercel.app/demo" pela URL real

git add README.md
git commit -m "docs(readme): add vercel deployment URL"
git push
```

## Domínio Customizado (Opcional)

### Via Dashboard:

1. Vá em **Project Settings → Domains**
2. Adicione seu domínio (ex: `shopify-dashboard.seudominio.com`)
3. Configure DNS conforme instruções da Vercel

### Via CLI:

```bash
vercel domains add shopify-dashboard.seudominio.com
```

## Troubleshooting

### Build falha com "Module not found"

**Solução:** Certifique-se de que está no diretório `frontend` ao fazer deploy.

```bash
cd frontend
vercel --prod
```

### Página em branco após deploy

**Solução:** Verifique se `vercel.json` está presente em `frontend/` com as rewrites corretas.

### CTAs de contato não funcionam

**Solução:** Verifique se `VITE_CONTACT_URL` está definida nas variáveis de ambiente do projeto Vercel.

```bash
vercel env ls
```

### Dados reais aparecem na demo

**Solução:** Certifique-se de que `VITE_DEMO_MODE=true` está definida em Production.

## Scripts Úteis

```bash
# Ver logs do deploy
vercel logs

# Listar deploys
vercel ls

# Ver variáveis de ambiente
vercel env ls

# Remover projeto (cuidado!)
vercel remove [project-name]
```

## Próximos Passos

1. ✅ Adicione a URL do deploy ao README
2. ✅ Compartilhe o link `/demo` no seu portfólio
3. ✅ Adicione screenshots reais em `frontend/public/`
4. ✅ Configure analytics (Vercel Analytics é gratuito)
5. ✅ Considere adicionar OpenGraph images para compartilhamento social

## Suporte

- 📚 Documentação Vercel: [vercel.com/docs](https://vercel.com/docs)
- 💬 Discord Vercel: [vercel.com/discord](https://vercel.com/discord)

---

**Pronto para impressionar recrutadores! 🚀**

