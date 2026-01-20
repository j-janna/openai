/**
 * Todo List 后端服务入口。
 * 使用 Express + Mongoose 提供 RESTful API。
 */
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

// 连接数据库。
connectDB();

// 解析 JSON 请求体。
app.use(express.json());

// 启用 CORS，方便前端跨域访问。
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
  })
);

// 基础日志记录中间件，记录请求耗时与状态码。
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.info(
      `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

// 注册 Todo 路由，统一前缀 /api。
app.use('/api', todoRoutes);

// 处理未知路由。
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在。' });
});

// 统一错误处理。
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error('[Error]', error);
  res.status(500).json({ message: '服务器内部错误。' });
});

// 启动服务。
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.info(`[Server] Todo API running at http://localhost:${PORT}`);
});
