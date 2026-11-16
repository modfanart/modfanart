# Node 18 reached end-of-life in April 2025 (no security patches).
FROM node:22-slim

WORKDIR /app

# Production mode: without this NODE_ENV was unset, so the API ran in
# "development" mode in production - request bodies (including passwords
# on /auth/workspace/login) were logged and 5xx responses leaked internals.
ENV NODE_ENV=production

# Reproducible, production-only install.
COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node . .

# Don't run as root.
USER node

# The server listens on 5000 (index.js); this said 3000.
EXPOSE 5000

CMD ["node", "index.js"]
