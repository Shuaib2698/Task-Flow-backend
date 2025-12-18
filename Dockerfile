FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code including entrypoint script
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install openssl for Prisma in production image
RUN apk add --no-cache openssl

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script from builder stage
COPY --from=builder /app/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/api/health || exit 1

EXPOSE 10000

# Use entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]