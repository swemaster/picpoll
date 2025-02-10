# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Install serve globally
RUN npm install -g serve

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000", "--listen", "tcp://0.0.0.0"]