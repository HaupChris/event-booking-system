FROM node:20 as build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve frontend with nginx (without SSL)
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]