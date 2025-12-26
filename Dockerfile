# Stage 1: Build stage
FROM oven/bun:alpine AS build
WORKDIR /app

# Copy file package and  lock file of bun
COPY package.json bun.lockb ./

# Install dependencies of bun
RUN bun install --frozen-lockfile

# Copy all source code 
COPY . .

# Build Project (Vite create dist folder)
RUN bun run build

# Stage 2: Production stage (Use Nginx for lighweight)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]