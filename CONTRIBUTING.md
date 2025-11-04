# Contributing to Shopify Automation

Obrigado por considerar contribuir para este projeto! 🎉

## 🚀 Como Contribuir

### 1. Fork o Projeto

```bash
# Fork via GitHub UI, então clone seu fork:
git clone https://github.com/SEU_USERNAME/shopify-automation.git
cd shopify-automation
```

### 2. Crie uma Branch

```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bugfix
```

### 3. Faça suas Mudanças

- Siga o estilo de código existente
- Adicione comentários quando necessário
- Teste suas mudanças localmente

### 4. Commit

Use mensagens de commit descritivas:

```bash
git commit -m "feat: adiciona filtro por cliente no dashboard"
git commit -m "fix: corrige cálculo de taxa de sucesso"
git commit -m "docs: atualiza guia de instalação"
```

Prefixos recomendados:
- `feat:` - Nova feature
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, ponto e vírgula, etc.
- `refactor:` - Refatoração de código
- `test:` - Adiciona testes
- `chore:` - Manutenção, deps, etc.

### 5. Push e Pull Request

```bash
git push origin feature/sua-feature
```

Abra um Pull Request no GitHub com:
- Título claro
- Descrição do que foi alterado
- Screenshots (se aplicável)
- Referência a issues relacionadas

## 📋 Guidelines

### Código

- Use JavaScript/TypeScript moderno (ES6+)
- Mantenha funções pequenas e focadas
- Adicione validação de dados (Zod)
- Trate erros adequadamente

### CSS

- Use variáveis CSS (já definidas)
- Mantenha dark mode compatível
- Mobile-first quando possível
- Evite !important

### Backend

- Sempre valide inputs
- Log de erros relevantes
- Retorne status codes apropriados
- Mantenha endpoints RESTful

### Frontend

- Componentes reutilizáveis
- TypeScript com tipos adequados
- Loading states
- Error boundaries

## 🧪 Testes

Antes de submeter PR, rode:

```bash
# Backend
cd backend
npm test

# Verifique se inicia sem erros
npm run dev
```

## 📝 Documentação

Se sua mudança afeta o uso do sistema:
- Atualize o README.md
- Atualize o START_HERE.md
- Adicione exemplos se necessário

## 🐛 Report de Bugs

Ao reportar bugs, inclua:
1. **Descrição** clara do problema
2. **Passos para reproduzir**
3. **Comportamento esperado** vs **atual**
4. **Ambiente** (OS, Node version, browser)
5. **Screenshots** se aplicável
6. **Logs** relevantes

## 💡 Sugestões de Features

Para sugerir features, abra uma issue com:
- **Problema** que a feature resolve
- **Solução proposta**
- **Alternativas** consideradas
- **Contexto adicional**

## 📞 Dúvidas?

- Abra uma issue com label `question`
- Ou entre em contato: https://github.com/ampliaro

## 🙏 Obrigado!

Toda contribuição é apreciada, desde correção de typos até features complexas!

---

**Código de Conduta**: Seja respeitoso, construtivo e colaborativo.

