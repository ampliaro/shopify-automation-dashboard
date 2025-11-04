# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia arquivos buildados para nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe porta
EXPOSE 80

# Comando padrão do nginx
CMD ["nginx", "-g", "daemon off;"]

