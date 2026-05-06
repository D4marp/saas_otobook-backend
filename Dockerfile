FROM node:20-alpine

WORKDIR /app

# tini avoids zombie processes when the Node server spawns workers
RUN apk add --no-cache tini

ENV NODE_ENV=production \
  PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .e

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/api', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
