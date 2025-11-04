# Guia de Features Avançadas

## 🌙 Dark Mode

### Como Usar

1. Clique no botão **🌙** (lua) no header do dashboard
2. O tema muda instantaneamente para escuro
3. Clique em **☀️** (sol) para voltar ao modo claro
4. Sua preferência é salva automaticamente

### Benefícios

- Reduz fadiga ocular em ambientes escuros
- Economiza bateria em telas OLED
- Visual moderno e profissional
- Cores otimizadas para ambos os modos

---

## 💾 Filtros Salvos

### Como Salvar um Filtro

1. Configure os filtros como preferir:
   - Selecione o período (Hoje/7d/30d)
   - Escolha o status (Todos/Enviado/Falhou/Recebido)
   - Digite uma busca (opcional)

2. Clique em **"💾 Salvar Filtro Atual"**

3. Digite um nome descritivo:
   - ✅ Bom: "Falhas de Hoje", "Pedidos VIP", "Problemas da Semana"
   - ❌ Evite: "Filtro 1", "Teste", "abc"

4. Clique em **"Salvar"**

### Como Usar Filtros Salvos

1. Clique em **"⭐ Filtros Salvos (3)"**
2. Escolha um filtro da lista
3. Todos os filtros são aplicados automaticamente

### Gerenciar Filtros

- **Aplicar**: Clique no nome do filtro
- **Deletar**: Clique no ícone 🗑️
- **Ver detalhes**: Cada filtro mostra período + status + busca

### Exemplos Úteis

```
"Emergências" → failed + today + vazio
"Monitoramento Semanal" → all + 7d + vazio
"Cliente Maria" → all + 30d + "maria@gmail.com"
"VIPs Atrasados" → received + today + "VIP"
```

---

## 📊 Drill-down Interativo

### Como Usar

1. Veja o gráfico de tendências (Pedidos no Período)
2. **Clique em qualquer ponto** da linha
3. A tabela abaixo filtra automaticamente para aquela data
4. Badge laranja mostra: "📅 Filtrando por: 03/11/2025"
5. Clique em **"✕ Limpar filtro"** para voltar

### Casos de Uso

**Cenário 1: Investigar Pico de Falhas**
```
1. Vê no gráfico: 03/11 teve 5 falhas (ponto vermelho alto)
2. Clica no ponto do dia 03/11
3. Vê exatamente quais pedidos falharam
4. Clica em cada um para ver detalhes
5. Faz retry em lote
```

**Cenário 2: Analisar Dia de Alto Volume**
```
1. Gráfico mostra: 01/11 teve 15 pedidos (pico)
2. Clica no ponto
3. Analisa quem eram os clientes
4. Exporta CSV apenas daquele dia
```

### Dicas

- 💡 Funciona em todos os períodos (Hoje/7d/30d)
- 💡 Combina com outros filtros (status, busca)
- 💡 Badge sempre mostra quando filtro está ativo

---

## 🤖 Bot do Telegram

### Configuração Inicial

```bash
# 1. Obter seu Chat ID
cd backend
npm run telegram:setup

# 2. Envie mensagem para o bot
# 3. Copie o Chat ID do terminal
# 4. Adicione no backend/.env:
TELEGRAM_BOT_TOKEN=seu_token
TELEGRAM_ADMIN_CHAT_IDS=seu_chat_id

# 5. Reinicie o backend
```

### Comandos Principais

#### Métricas Rápidas

```
/hoje
```
Resposta:
```
📊 Métricas de Hoje

📦 Total: 12 pedidos
✅ Taxa de Sucesso: 91.7%
❌ Falhas: 1
⏱️ Tempo Médio: 5 min

📈 vs. Ontem:
📈 Pedidos: +20.0%
📈 Sucesso: +8.3%
```

#### Ver Problemas

```
/falhas
```
Lista todos os pedidos falhados com detalhes.

#### Detalhes de Pedido

```
/pedido 5108
```
Mostra cliente, itens, status, tentativas, erros.

#### Ação Remota

```
/retry 5108
```
Retenta enviar o pedido direto pelo Telegram!

### Alertas Automáticos

O bot monitora a cada **15 minutos** e envia alertas quando:

**🚨 Taxa de Falha Alta:**
```
⚠️ TAXA DE FALHA ELEVADA

📊 Últimos 7 dias:
❌ 15 de 65 pedidos falharam
📈 Taxa de falha: 23.1%

💡 Use /falhas para ver detalhes
```

**✅ Sistema Normalizado:**
```
✅ TAXA DE FALHA NORMALIZADA

📊 Taxa atual: 18.5%
Sistema operando normalmente.
```

**⚠️ Pedidos Travados:**
```
🚨 PEDIDOS COM MÚLTIPLAS FALHAS

3 pedido(s) falharam 3+ vezes:

📦 #5102 - 4 tentativas
   maria@gmail.com
📦 #5105 - 3 tentativas
   joao@hotmail.com

💡 Revise estes pedidos manualmente
```

### Múltiplos Admins

Adicione vários Chat IDs separados por vírgula:

```env
TELEGRAM_ADMIN_CHAT_IDS=123456789,987654321,555666777
```

Todos receberão os alertas!

---

## 🎨 Screenshots

### Dashboard Principal
- Cards de métricas com deltas
- Gráfico de tendências interativo (clicável!)
- Heatmap de distribuição horária
- Dark mode toggle
- Filtros salvos

### Tabela de Pedidos
- Busca e filtros avançados
- Seleção múltipla para ações em lote
- Status coloridos e intuitivos
- Filtros salvos para acesso rápido
- Drill-down do gráfico

### Detalhes do Pedido
- Drawer lateral completo
- Timeline de eventos
- Ações rápidas (Retry, Notas)

### Bot do Telegram
- Gestão completa via mobile
- Alertas em tempo real
- Comandos intuitivos
- 16 comandos disponíveis
