# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Set backend URL for build
ARG PUBLIC_BACKEND_URL=https://backend-skillfest.nstsdc.org
ENV PUBLIC_BACKEND_URL=$PUBLIC_BACKEND_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Runner stage (Serve static files with Nginx)
FROM nginx:alpine AS runner

# Copy the build output to Nginx's HTML directory
# Astro usually outputs to 'dist'
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if you have one, otherwise use default
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
