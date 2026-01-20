/**
 * 简单日志中间件：记录请求的基本信息
 * 这里使用最小依赖（console）实现，方便在没有第三方日志库时也能工作
 */

module.exports = function (req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  // 在响应结束后打印耗时信息
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
