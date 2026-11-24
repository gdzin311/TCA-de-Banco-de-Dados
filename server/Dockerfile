FROM node:20-alpine

# o servidor procura o front-end em ../client, então mantemos as duas pastas lado a lado
WORKDIR /app/server

# primeiro só o package.json: o Docker reaproveita essa camada se as dependências não mudarem
COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ ./
COPY client/ /app/client/

EXPOSE 3000
CMD ["node", "app.js"]
