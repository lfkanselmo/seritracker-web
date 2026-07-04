# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# --- Runtime stage ---
FROM nginx:1.27-alpine

COPY --from=build /app/dist/seritracker-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/40-envsubst-api-url.sh /docker-entrypoint.d/40-envsubst-api-url.sh
RUN chmod +x /docker-entrypoint.d/40-envsubst-api-url.sh

EXPOSE 80
