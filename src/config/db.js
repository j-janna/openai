/**
 * 数据库连接模块
 * 使用 mongoose 连接 MongoDB，并导出一个连接函数供应用入口使用
 */

const mongoose = require('mongoose');

/**
 * 连接到 MongoDB 的异步函数
 * @param {string} uri - MongoDB 连接字符串
 */
async function connectDB(uri) {
  try {
    // 一些常用的 mongoose 配置，避免弃用警告
    mongoose.set('strictQuery', true);

    // 使用 mongoose.connect 连接数据库
    // 注意：在较新版本的 mongoose 中，不再需要也不支持传入
    // `useNewUrlParser` 和 `useUnifiedTopology` 等已废弃选项，
    // 因此直接传入连接字符串即可。
    await mongoose.connect(uri);

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // 抛出错误让调用方（入口）决定如何处理
  }
}

module.exports = connectDB;
