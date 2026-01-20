/**
 * 自动化 API 测试脚本（使用 mongodb-memory-server 启动内存 MongoDB）
 * 该脚本会：
 * 1. 启动内存 MongoDB
 * 2. 使用 mongoose 连接到内存数据库
 * 3. 启动一个临时的 Express 应用（挂载同一套路由）
 * 4. 逐个调用 API（查询、添加、更新、删除、再次查询）并打印结果
 * 5. 清理并退出
 *
 * 运行： `node test/test-api.js`
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../src/logger');
const todoRoutes = require('../src/routes/todo');

// 使用 node-fetch v2（CommonJS 兼容）进行 HTTP 请求
const fetch = require('node-fetch');

async function run() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // 连接 mongoose 到内存 MongoDB
  await mongoose.connect(uri);
  console.log('[Test] Connected to in-memory MongoDB');

  // 创建 express 应用并挂载路由
  const app = express();
  app.use(express.json());
  app.use(logger);
  app.use('/api', todoRoutes);

  const server = app.listen(3001, async () => {
    console.log('[Test] Test server listening on port 3001');

    try {
      // 1. GET 所有（应为空数组）
      console.log('== GET /api/get-todo ==');
      let res = await fetch('http://localhost:3001/api/get-todo');
      console.log('Status:', res.status);
      console.log(await res.json());

      // 2. POST 添加
      console.log('== POST /api/add-todo ==');
      res = await fetch('http://localhost:3001/api/add-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: '自动化测试待办', isCompleted: false }),
      });
      console.log('Status:', res.status);
      const added = await res.json();
      console.log(added);

      // 3. POST 更新（toggle）
      console.log('== POST /api/update-todo ==');
      res = await fetch('http://localhost:3001/api/update-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: added._id }),
      });
      console.log('Status:', res.status);
      console.log(await res.json());

      // 4. POST 删除
      console.log('== POST /api/del-todo ==');
      res = await fetch('http://localhost:3001/api/del-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: added._id }),
      });
      console.log('Status:', res.status);
      console.log(await res.json());

      // 5. GET 再次查询（应为空）
      console.log('== GET /api/get-todo (after delete) ==');
      res = await fetch('http://localhost:3001/api/get-todo');
      console.log('Status:', res.status);
      console.log(await res.json());
    } catch (err) {
      console.error('Test error:', err);
    } finally {
      // 关闭服务并断开数据库
      server.close(async () => {
        await mongoose.disconnect();
        await mongod.stop();
        console.log('[Test] Cleaned up and exiting');
        process.exit(0);
      });
    }
  });
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
