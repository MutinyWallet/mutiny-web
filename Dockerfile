# Use Node.js as a base image for building the site
FROM node:20-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# This is the cooler way to run pnpm these days (no need to npm install it)
RUN corepack enable
COPY . /app
WORKDIR /app

# I think we need git be here because the vite build wants to look up the commit hash
RUN apt update && apt install -y git

# Add the ARG directives for build-time environment variables
ARG VITE_NETWORK="bitcoin"
ARG VITE_PROXY="wss://p.mutinywallet.com"
ARG VITE_ESPLORA="https://mutinynet.com/api"
ARG VITE_LSP="https://lsp.voltageapi.com"
ARG VITE_RGS="https://rgs.mutinynet.com/snapshot/"
ARG VITE_AUTH="https://auth.mutinywallet.com"
ARG VITE_STORAGE="https://storage.mutinywallet.com"
ARG VITE_SELFHOSTED="true"

# Install dependencies
RUN pnpm install --frozen-lockfile

# IDK why but it gets mad if you don't do this
RUN git config --global --add safe.directory /app

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
