# 多阶段 Dockerfile：先构建前端（如果存在），再构建后端镜像

# 构建前端阶段（Node 官方镜像）
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend-vite/package.json frontend-vite/package-lock.json* ./frontend-vite/
WORKDIR /app/frontend-vite
RUN npm config set registry https://registry.npmmirror.com
RUN npm install
COPY frontend-vite/ ./
RUN npm run build

# 后端生产镜像
FROM node:18-alpine AS backend
WORKDIR /app

# 复制后端 package.json 并安装生产依赖
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# 复制后端源码
COPY . .

# 将前端构建产物复制到后端静态目录（覆盖 frontend/）
COPY --from=frontend-build /app/frontend-vite/dist/ ./frontend/

EXPOSE 3000
CMD ["node", "src/index.js"]
