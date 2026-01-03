# Multi-stage build - Mọi thứ trong Docker
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (cache layer)
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build
ENV CI=false
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
