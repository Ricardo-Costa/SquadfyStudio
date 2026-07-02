# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY db.json index.js local.js ./
EXPOSE 3001
ENV PORT=3001
CMD ["node", "local.js"]
