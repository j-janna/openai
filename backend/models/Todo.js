/**
 * Todo 数据模型。
 * 定义待办事项的字段结构，并提供默认值与校验规则。
 */
const mongoose = require('mongoose');

// 使用 Schema 定义数据结构。
const todoSchema = new mongoose.Schema(
  {
    // 待办事项内容，必填。
    value: {
      type: String,
      required: [true, 'Todo 内容不能为空。'],
      trim: true,
    },
    // 是否完成，默认 false。
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    // 自动添加 createdAt / updatedAt 字段。
    timestamps: true,
  }
);

// 导出模型，集合名使用默认的复数形式 list -> lists。
module.exports = mongoose.model('Todo', todoSchema, 'list');
