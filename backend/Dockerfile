# Multi-stage build para otimizar o tamanho final
FROM node:18-alpine AS build

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production

# Stage final
FROM node:18-alpine

WORKDIR /app

# Copia node_modules do stage de build
COPY --from=build /app/node_modules ./node_modules

# Copia código fonte
COPY src ./src
COPY package.json ./

# Cria diretório de dados
RUN mkdir -p /app/data

# Expõe porta
EXPOSE 3001

# Define usuário não-root para segurança
USER node

# Comando para iniciar aplicação
CMD ["node", "src/server.js"]

