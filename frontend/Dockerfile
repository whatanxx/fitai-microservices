FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Vite default dev server command
CMD ["npm", "run", "dev", "--", "--host"]
