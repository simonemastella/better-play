FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy workspace packages
COPY packages ./packages
COPY apps/fe ./apps/fe

# Install dependencies
RUN yarn workspaces focus @better-play/fe

# Build the app
WORKDIR /app/apps/fe
RUN yarn build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install a simple static server
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/apps/fe/dist ./dist

# Expose port
EXPOSE 5173

# Serve the app
CMD ["serve", "-s", "dist", "-l", "5173"]