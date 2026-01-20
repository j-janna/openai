/**
 * Todo 路由定义
 * 实现四个接口：
 * - GET  /api/get-todo      : 查询所有待办事项
 * - POST /api/add-todo      : 添加新的待办事项
 * - POST /api/update-todo/  : 根据 id 切换 isCompleted 状态
 * - POST /api/del-todo/     : 根据 id 删除待办事项
 *
 * 使用 async/await 处理异步操作，并做基本输入验证与错误处理
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Todo = require('../models/Todo');

/**
 * GET /api/get-todo
 * 返回 'list' 集合中所有文档
 */
router.get('/get-todo', async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/add-todo
 * 请求体示例：{ "value": "买牛奶", "isCompleted": false }
 * 返回新建的待办对象（包含自动生成的 _id）
 */
router.post('/add-todo', async (req, res, next) => {
  try {
    const { value, isCompleted } = req.body;

    // 基本输入验证
    if (!value || typeof value !== 'string') {
      return res.status(400).json({ success: false, message: 'value 字段为必填字符串' });
    }

    const todo = new Todo({ value: value.trim(), isCompleted: !!isCompleted });
    const saved = await todo.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/update-todo/
 * 请求体示例：{ "id": "<ObjectId>" }
 * 功能：根据 id 找到文档并将 isCompleted 取反，返回更新后的对象
 */
router.post('/update-todo', async (req, res, next) => {
  try {
    const { id } = req.body;

    // 验证 id
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: '无效的 id' });
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ success: false, message: '未找到指定待办' });
    }

    // 切换完成状态
    todo.isCompleted = !todo.isCompleted;
    const updated = await todo.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/del-todo/
 * 请求体示例：{ "id": "<ObjectId>" }
 * 功能：根据 id 删除文档，返回操作结果
 */
router.post('/del-todo', async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: '无效的 id' });
    }

    const deleted = await Todo.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '未找到指定待办，删除失败' });
    }

    res.json({ success: true, deletedId: id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
