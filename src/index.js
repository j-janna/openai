/**
 * 后端入口文件 - 使用 Express 启动 HTTP 服务并挂载路由
 * 详细注释说明每一步用途；使用 async/await 管理异步流程
 */

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const todoRoutes = require('./routes/todo');
const logger = require('./logger');
const path = require('path');

// 读取根目录下的 .env（如果存在）
dotenv.config();

const app = express();

// 使用内置中间件解析 JSON 请求体
app.use(express.json());

// 简单请求日志：在开发时使用 morgan 输出简洁日志
app.use(morgan('dev'));

// 自定义更详细的日志（会在控制台输出）
app.use(logger);

// 挂载 API 路由，所有路由以 /api 开头
app.use('/api', todoRoutes);

// 将 frontend 目录作为静态资源对外提供，这样可以直接在浏览器打开首页并通过同源调用 API
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// SPA 回退：非 /api 的请求直接返回前端 index.html（便于前端路由）
// SPA 回退：如果请求不是以 /api 开头，则返回前端的 index.html
// 使用通用中间件避免在路由匹配时触发 path-to-regexp 的参数解析错误
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 全局错误处理：捕获未处理的错误并返回统一格式
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 启动函数：先连接数据库再启动 HTTP 服务
async function start() {
  // 先读取外部配置的 Mongo 地址
  const configuredUri = process.env.MONGO_URI || 'mongodb://test-db-mongodb.ns-s86y0ylw.svc:27017/todo_db';

  // 保存内存 Mongo 的实例（如果回退使用）以便在退出时清理
  let inMemoryServer = null;

  async function shutdown() {
    // 优雅关闭流程：断开 mongoose 并停止内存 mongo（如存在）
    try {
      const mongoose = require('mongoose');
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    if (inMemoryServer) {
      try {
        await inMemoryServer.stop();
      } catch (e) {
        // ignore
      }
    }
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    // 尝试连接外部 MongoDB
    await connectDB(configuredUri);
    console.log('Connected to external MongoDB');
  } catch (error) {
    // 如果连接失败，则回退到内存 Mongo（便于本地开发与测试）
    console.warn('外部 MongoDB 连接失败，正在回退到内存 MongoDB（mongodb-memory-server）:', error.message);
    try {
      // 动态引入 mongodb-memory-server，避免在生产环境强制安装
      const { MongoMemoryServer } = require('mongodb-memory-server');
      inMemoryServer = await MongoMemoryServer.create();
      const memUri = inMemoryServer.getUri();
      await connectDB(memUri);
      console.log('Connected to in-memory MongoDB for fallback');
    } catch (memErr) {
      console.error('回退到内存 MongoDB 失败:', memErr);
      process.exit(1);
    }
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

module.exports = app;
