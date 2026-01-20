/**
 * Todo 路由模块。
 * 提供查询、添加、更新、删除等 RESTful API。
 */
const express = require('express');
const Todo = require('../models/Todo');

const router = express.Router();

/**
 * GET /api/get-todo
 * 查询所有待办事项。
 */
router.get('/get-todo', async (req, res, next) => {
  try {
    // 从 list 集合中查找所有数据并按创建时间倒序排列。
    const todos = await Todo.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: todos });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/add-todo
 * 添加新的待办事项。
 */
router.post('/add-todo', async (req, res, next) => {
  try {
    const { value, isCompleted = false } = req.body;

    // 基本输入校验，确保 value 为非空字符串。
    if (!value || typeof value !== 'string' || !value.trim()) {
      return res.status(400).json({ message: '待办事项内容不能为空。' });
    }

    // 创建并保存新 Todo。
    const newTodo = await Todo.create({
      value: value.trim(),
      isCompleted: Boolean(isCompleted),
    });

    return res.status(201).json({ data: newTodo });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/update-todo
 * 根据 id 更新待办事项的完成状态（取反）。
 */
router.post('/update-todo', async (req, res, next) => {
  try {
    const { id } = req.body;

    // 校验 id 是否存在。
    if (!id) {
      return res.status(400).json({ message: '缺少待办事项 id。' });
    }

    // 查询指定待办事项。
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: '未找到对应的待办事项。' });
    }

    // 取反完成状态。
    todo.isCompleted = !todo.isCompleted;
    await todo.save();

    return res.status(200).json({ data: todo });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/del-todo
 * 根据 id 删除待办事项。
 */
router.post('/del-todo', async (req, res, next) => {
  try {
    const { id } = req.body;

    // 校验 id 是否存在。
    if (!id) {
      return res.status(400).json({ message: '缺少待办事项 id。' });
    }

    // 删除指定待办事项。
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: '未找到对应的待办事项。' });
    }

    return res.status(200).json({
      message: '删除成功。',
      data: { id: deletedTodo.id },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
