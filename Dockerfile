# --- Stage 1: Build ---
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
COPY server/prisma ./server/prisma/

RUN npm ci

COPY . .

RUN npx prisma generate --schema=server/prisma/schema.prisma
RUN npm run build
RUN npm run server:build

# --- Stage 2: Production ---
FROM node:24-alpine AS production

WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json* ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/prisma ./server/prisma
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=server/prisma/schema.prisma && node server/dist/index.js"]
