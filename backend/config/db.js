/**
 * 数据库连接模块。
 * 使用 Mongoose 连接 MongoDB，并对连接成功/失败进行日志记录。
 */
const mongoose = require('mongoose');

// 使用环境变量读取连接地址，如果没有提供则使用默认地址。
// 这里使用了用户提供的数据库服务域名。
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://test-db-mongodb.ns-s86y0ylw.svc:27017/todo';

/**
 * 连接数据库的异步方法。
 * @returns {Promise<void>} 返回连接结果的 Promise。
 */
const connectDB = async () => {
  try {
    // 使用 async/await 等待连接完成。
    await mongoose.connect(MONGODB_URI, {
      // 这些配置可提升兼容性与稳定性。
      // 注意：新版 Mongoose 默认已开启部分选项，这里显式保留注释说明。
    });
    console.info('[DB] MongoDB connected:', MONGODB_URI);
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error);
    // 连接失败直接退出进程，避免服务在无数据库的状态运行。
    process.exit(1);
  }
};

module.exports = connectDB;
