# NeuroSonix Industrial Backend Docker Image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 8088
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S neurosonix -u 1001

WORKDIR /app

# Copy production files
COPY --from=build --chown=neurosonix:nodejs /app/dist ./dist
COPY --from=build --chown=neurosonix:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=neurosonix:nodejs /app/package*.json ./

USER neurosonix

EXPOSE 8088

ENV NODE_ENV=production
ENV PORT=8088

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8088/health || exit 1

CMD ["npm", "start"]