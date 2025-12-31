FROM node:22-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.7

# Copy package manifests
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile=false

# Copy source
COPY . .

# Build Next.js app
RUN pnpm run build

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# Start Next.js - use node directly to avoid pnpm arg issues
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
