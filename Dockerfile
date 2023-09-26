# Use Node.js as a base image for building the site
FROM node:19-slim AS builder

RUN apt update && apt install -y git

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Add the ARG directives for build-time environment variables
ARG VITE_NETWORK="bitcoin"
ARG VITE_PROXY="wss://p.mutinywallet.com"
ARG VITE_ESPLORA="https://mutinynet.com/api"
ARG VITE_LSP="https://lsp.voltageapi.com"
ARG VITE_RGS="https://rgs.mutinynet.com/snapshot/"
ARG VITE_AUTH="https://auth.mutinywallet.com"
ARG VITE_STORAGE="https://storage.mutinywallet.com"
ARG VITE_SELFHOSTED="true"

# Copy package.json and pnpm-lock.yaml (or shrinkwrap.yaml) to utilize Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the files
COPY . .

# Build the static site
RUN pnpm run build

# Now, use Nginx as a base image for serving the site
FROM nginx:alpine

# Copy the static assets from the builder stage to the Nginx default static serve directory
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
