# Build stage
FROM node:20-alpine AS builder

# Install required build dependencies
RUN apk add --no-cache python3 make g++

# Install Yarn 4.9
RUN corepack enable && corepack prepare yarn@4.9.0 --activate

WORKDIR /app

# Copy root package files and Yarn configuration
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY tsconfig.json ./

# Copy workspace packages that realtime-api depends on
COPY packages/shared ./packages/shared

# Copy realtime-api app
COPY apps/realtime-api ./apps/realtime-api

# Install all dependencies and build
RUN yarn install
RUN yarn workspaces foreach -A run build

# Runtime stage
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/realtime-api/dist ./apps/realtime-api/dist
COPY --from=builder /app/apps/realtime-api/package.json ./apps/realtime-api/package.json
COPY --from=builder /app/apps/realtime-api/.env.docker ./apps/realtime-api/.env
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Set working directory to the app
WORKDIR /app/apps/realtime-api

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["node", "dist/main.js"]