FROM node:24-alpine AS build

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Serve frontend with nginx (without SSL)
FROM nginx:stable-alpine
# Security updates of the base image are applied at build time.
RUN apk upgrade --no-cache
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
