# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm ci --only=production

# COPY . .
# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "run", "deploy:railway"]

FROM node:18-alpine

WORKDIR /app

# Installa TUTTE le dipendenze (dev incluse)
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "deploy:railway"]
