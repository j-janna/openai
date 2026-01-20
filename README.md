# Todo List 后端（Node.js + Express + Mongoose）

项目包含一个简单的 Todo List 后端实现，满足以下接口：


主要文件说明：


快速使用说明：

1. 推荐先设置 npm 镜像加速（题主提示）：

```bash
npm config set registry https://registry.npmmirror.com
```

2. 安装依赖（在项目根目录运行）：

```bash
npm install express mongoose morgan dotenv
```

3. 启动服务：

```bash
node src/index.js
```

4. 若需更改数据库地址，请在项目根目录创建 `.env` 文件，参考 `.env.example`。

将前端原型作为静态资源托管：启动服务后打开浏览器访问 `http://localhost:3000/` 即可加载 `frontend/index.html`，前端会直接与同源的 `/api` 接口交互。

**Vite + Vue 3 前端（可选）**

我已在项目中添加了一个基于 Vite 的前端原型在 `frontend-vite/`，它是一个更接近生产的开发结构。


```bash
cd frontend-vite
npm install
npm run dev
```


```bash
npm run build
npm run preview
```

如果你希望把构建好的静态文件直接托管在后端，请将 `frontend-vite/dist` 的内容复制到 `frontend/` 或调整 `src/index.js` 的静态目录指向。

**Docker（后端）**

项目已添加一个简单的 `Dockerfile`，用于构建后端镜像。构建与运行镜像的示例命令：

```bash
# 在项目根目录构建镜像
docker build -t todo-backend:latest .

# 运行容器（注意映射端口和环境变量）
docker run -p 3000:3000 -e MONGO_URI="<your_mongo_uri>" todo-backend:latest
```

如果不指定 `MONGO_URI`，容器内的服务会尝试连接默认地址，失败时会回退到内存数据库以便开发或测试。

已新增的功能与说明：

- 多阶段 `Dockerfile`：在镜像构建时会先构建 `frontend-vite`，再构建后端镜像，最终镜像中包含后端与已构建好的前端静态文件。构建命令：

```bash
docker build -t todo-backend:latest .
```

- 根 `package.json` 新增脚本：`npm run build:frontend`（构建前端）与 `npm run docker:build`（构建镜像）。

- 添加 Playwright E2E 测试骨架：`test/e2e.spec.js`（需要安装 `@playwright/test` 才能执行，本地或 CI 可按需安装）。

- 前端增强：为删除按钮添加了图标 SVG、添加图标按钮样式和微动画（见 `frontend-vite/src/styles.css`）。

若你同意，我接下来会：
- （可选）在本地构建镜像并启动容器以验证完整镜像运行；这将需要下载镜像构建依赖并耗费时间。是否现在构建？
- 或我继续增强前端视觉（加入图标库、细化交互动效）。

错误处理、日志与验证：

- 使用了基础的输入验证（检查 `value` 字段与 `id` 的有效性）
- 使用 `morgan` + 自定义 `logger` 进行请求日志记录
- 全局错误处理中间件会返回统一结构的错误响应

注意事项：

- 本项目示例采用了题目给定的内部 DNS 地址作为默认 MongoDB 地址：
  `mongodb://test-db-mongodb.ns-s86y0ylw.svc:27017/todo_db`。
- 如果在本地开发或云环境中运行，请根据实际 Mongo 服务地址调整 `MONGO_URI`。
