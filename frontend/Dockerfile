FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
# Without these Vite skips PostCSS, and the bundle ships no Tailwind CSS at all
COPY postcss.config.cjs ./
COPY tailwind.config.cjs ./
COPY index.html ./
COPY src ./src
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# SPA routing fallback, plus /api proxied to the backend
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

