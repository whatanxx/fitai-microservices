# Etap budowania
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# W trybie dev Vite potrzebuje hosta 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
