FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY . .

RUN npm run build
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main"]

