# ══════════════════════════════════════════════════════
#  Sea Hawk Courier — Multi-Stage Dockerfile
#  Stage 1: Build React portal
#  Stage 2: Production Node.js server
# ══════════════════════════════════════════════════════

# ── Stage 1: Build React Frontend ─────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package files first (better layer caching)
COPY frontend/package*.json ./
RUN npm ci --silent

# Copy source and build
COPY frontend/ .
# .env.production is NOT copied — use ARG/ENV at build time
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Stage 2: Production Backend ───────────────────────────
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup -g 1001 -S seahawk && adduser -S seahawk -u 1001

WORKDIR /app

# Install backend dependencies only
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production --silent && npm cache clean --force

# Generate Prisma client
COPY backend/prisma ./backend/prisma
RUN cd backend && npx prisma generate

# Copy backend source
COPY backend/src ./backend/src
COPY backend/server.js ./backend/server.js

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create runtime directories
RUN mkdir -p logs backups && chown -R seahawk:seahawk /app

# Switch to non-root user
USER seahawk

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

EXPOSE 3001

# Run migrations then start
CMD ["sh", "-c", "cd backend && npx prisma migrate deploy && node server.js"]
