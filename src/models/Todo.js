/**
 * Mongoose 模型 - Todo（存储在集合 'list' 中）
 * 模型字段说明：
 * - value: 待办事项文本内容，必填
 * - isCompleted: 是否已完成，布尔值，默认为 false
 * - createdAt: 创建时间，默认当前时间
 */

const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema(
  {
    // 待办内容，必填字符串
    value: {
      type: String,
      required: [true, 'value 字段是必须的'],
      trim: true,
    },
    // 是否完成，默认 false
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // 创建时间，自动设置
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // 指定集合名称为 'list'（题目要求）
    collection: 'list',
  }
);

// 导出模型，模型名称使用 'Todo'，但集合名固定为 'list'
module.exports = mongoose.model('Todo', TodoSchema);
