<template>
  <!-- 整体容器，控制背景与布局 -->
  <div class="app" :class="{ 'theme-dark': isDarkMode }">
    <!-- 顶部渐变背景块 -->
    <header class="hero">
      <div class="hero__content">
        <!-- 标题区域 -->
        <div>
          <p class="hero__eyebrow">专注当下 · 高效管理</p>
          <h1 class="hero__title">Todo List</h1>
          <p class="hero__subtitle">
            一个灵感来自 Apple 官网设计美学的清爽待办清单。
          </p>
        </div>
        <!-- 主题切换按钮 -->
        <button class="theme-toggle" @click="toggleTheme">
          <span class="theme-toggle__icon" aria-hidden="true">
            <!-- 月亮/太阳图标 -->
            <svg v-if="isDarkMode" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3a9 9 0 0 0 0 18 9 9 0 0 0 8.66-6.28 7.2 7.2 0 0 1-9.38-9.38A8.98 8.98 0 0 0 12 3Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="4.5"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span>{{ isDarkMode ? '夜间模式' : '亮色模式' }}</span>
        </button>
      </div>
    </header>

    <!-- 主体内容区域 -->
    <main class="content">
      <!-- 输入卡片 -->
      <section class="card">
        <div class="card__header">
          <h2>添加待办事项</h2>
          <span class="card__badge">今日清单</span>
        </div>
        <form class="input-group" @submit.prevent="handleAddTodo">
          <input
            v-model="newTodo"
            type="text"
            placeholder="写下你要完成的事情..."
            aria-label="待办事项"
          />
          <button type="submit" class="primary-btn" :disabled="isSubmitting">
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span>添加</span>
          </button>
        </form>
        <p class="helper-text">
          {{ errorMessage || '保持节奏，逐个击破。' }}
        </p>
      </section>

      <!-- 进度统计卡片 -->
      <section class="card">
        <div class="card__header">
          <h2>完成度</h2>
          <span class="card__badge">{{ progressPercentage }}%</span>
        </div>
        <div class="progress">
          <div class="progress__bar">
            <div class="progress__bar-fill" :style="{ width: progressPercentage + '%' }" />
          </div>
          <div class="progress__meta">
            <span>已完成 {{ completedCount }} 项</span>
            <span>共 {{ totalCount }} 项</span>
          </div>
        </div>
      </section>

      <!-- 过滤器与清单区域 -->
      <section class="card">
        <div class="card__header">
          <h2>待办清单</h2>
          <div class="filters">
            <button
              v-for="item in filters"
              :key="item.value"
              class="filter-btn"
              :class="{ active: currentFilter === item.value }"
              @click="setFilter(item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <!-- 加载状态提示 -->
        <div v-if="isLoading" class="state">
          <div class="spinner"></div>
          <p>正在加载待办事项...</p>
        </div>

        <!-- 清单列表 -->
        <transition-group name="list" tag="ul" class="todo-list" v-else>
          <li v-for="todo in filteredTodos" :key="todo._id" class="todo-item">
            <button class="check-btn" @click="toggleTodo(todo)">
              <span class="icon" aria-hidden="true">
                <svg v-if="todo.isCompleted" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="6"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                </svg>
              </span>
            </button>
            <div class="todo-item__content">
              <p :class="{ done: todo.isCompleted }">{{ todo.value }}</p>
              <small>{{ formatDate(todo.createdAt) }}</small>
            </div>
            <button class="delete-btn" @click="deleteTodo(todo)">
              <span class="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              删除
            </button>
          </li>
        </transition-group>

        <!-- 空状态提示 -->
        <div v-if="!isLoading && filteredTodos.length === 0" class="state">
          <p>当前没有待办事项，保持灵感继续前进。</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
// 引入 Vue 组合式 API。
import { computed, onMounted, ref } from 'vue';

// API 基础地址，可在 .env 中设置 VITE_API_BASE。
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// 输入框内容。
const newTodo = ref('');
// 待办事项列表。
const todos = ref([]);
// 当前筛选条件。
const currentFilter = ref('all');
// 夜间模式状态。
const isDarkMode = ref(false);
// 加载与提交状态。
const isLoading = ref(false);
const isSubmitting = ref(false);
// 错误提示信息。
const errorMessage = ref('');

// 过滤器选项。
const filters = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '未完成', value: 'pending' },
];

/**
 * 获取所有待办事项。
 */
const fetchTodos = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(`${API_BASE}/api/get-todo`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '获取待办事项失败。');
    }

    // 将数据保存到状态中。
    todos.value = result.data || [];
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

/**
 * 添加新的待办事项。
 */
const handleAddTodo = async () => {
  if (!newTodo.value.trim()) {
    errorMessage.value = '请输入待办事项内容。';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(`${API_BASE}/api/add-todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newTodo.value, isCompleted: false }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '添加失败。');
    }

    // 新增后将新数据插入列表顶部。
    todos.value.unshift(result.data);
    newTodo.value = '';
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * 切换待办事项完成状态。
 * @param {object} todo 待办事项对象。
 */
const toggleTodo = async (todo) => {
  try {
    const response = await fetch(`${API_BASE}/api/update-todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: todo._id }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '更新失败。');
    }

    // 更新本地数据。
    const index = todos.value.findIndex((item) => item._id === todo._id);
    if (index !== -1) {
      todos.value[index] = result.data;
    }
  } catch (error) {
    errorMessage.value = error.message;
  }
};

/**
 * 删除待办事项。
 * @param {object} todo 待办事项对象。
 */
const deleteTodo = async (todo) => {
  try {
    const response = await fetch(`${API_BASE}/api/del-todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: todo._id }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '删除失败。');
    }

    // 删除本地数据。
    todos.value = todos.value.filter((item) => item._id !== todo._id);
  } catch (error) {
    errorMessage.value = error.message;
  }
};

/**
 * 设置当前过滤条件。
 * @param {string} filter 过滤条件值。
 */
const setFilter = (filter) => {
  currentFilter.value = filter;
};

/**
 * 切换亮色/暗色主题。
 */
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
};

/**
 * 格式化日期为本地字符串。
 * @param {string} dateString 日期字符串。
 * @returns {string} 格式化后的日期。
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('zh-CN');
};

// 计算完成的数量。
const completedCount = computed(
  () => todos.value.filter((item) => item.isCompleted).length
);

// 计算总数量。
const totalCount = computed(() => todos.value.length);

// 计算完成率。
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

// 根据筛选条件过滤待办事项。
const filteredTodos = computed(() => {
  if (currentFilter.value === 'completed') {
    return todos.value.filter((item) => item.isCompleted);
  }
  if (currentFilter.value === 'pending') {
    return todos.value.filter((item) => !item.isCompleted);
  }
  return todos.value;
});

// 初始化时加载待办事项。
onMounted(() => {
  fetchTodos();
});
</script>

<style scoped>
/* 样式仅作用于当前组件，提高隔离性。 */
.app {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  transition: background 0.3s ease, color 0.3s ease;
}

.hero {
  padding: 3.5rem 8vw 5rem;
  background: var(--hero-gradient);
  color: var(--text-primary);
}

.hero__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.hero__eyebrow {
  font-size: 0.95rem;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  opacity: 0.75;
}

.hero__title {
  font-size: clamp(2.6rem, 4vw, 3.8rem);
  margin: 0.5rem 0;
}

.hero__subtitle {
  font-size: 1.1rem;
  max-width: 520px;
  line-height: 1.7;
  opacity: 0.9;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  border: none;
  background: var(--glass-bg);
  color: var(--text-primary);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.theme-toggle:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-strong);
}

.theme-toggle__icon svg {
  width: 18px;
  height: 18px;
}

.content {
  margin-top: -3.2rem;
  padding: 0 8vw 4rem;
  display: grid;
  gap: 2rem;
}

.card {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(12px);
  border: 1px solid var(--card-border);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card__badge {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  background: var(--badge-bg);
  color: var(--badge-text);
}

.input-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.input-group input {
  flex: 1;
  min-width: 240px;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.input-group input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.4rem;
  border-radius: 14px;
  border: none;
  background: var(--accent-primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-strong);
}

.helper-text {
  margin-top: 0.8rem;
  color: var(--text-secondary);
}

.progress__bar {
  width: 100%;
  height: 10px;
  background: var(--progress-bg);
  border-radius: 999px;
  overflow: hidden;
}

.progress__bar-fill {
  height: 100%;
  background: var(--accent-gradient);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.progress__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 0.8rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.filters {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--chip-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active,
.filter-btn:hover {
  color: var(--text-primary);
  border-color: var(--accent-primary);
  background: var(--chip-active-bg);
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 18px;
  background: var(--list-bg);
  border: 1px solid var(--list-border);
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.todo-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-strong);
}

.todo-item__content {
  flex: 1;
}

.todo-item__content p {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
}

.todo-item__content p.done {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.todo-item__content small {
  color: var(--text-secondary);
}

.check-btn,
.delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-primary);
}

.check-btn .icon,
.delete-btn .icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--icon-bg);
  border-radius: 50%;
  padding: 0.4rem;
}

.delete-btn {
  color: var(--danger);
}

.state {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 0;
}

.spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 0.8rem;
  border-radius: 50%;
  border: 3px solid var(--progress-bg);
  border-top-color: var(--accent-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .hero {
    padding: 2.5rem 6vw 4rem;
  }

  .content {
    padding: 0 6vw 3rem;
  }

  .card {
    padding: 1.5rem;
  }

  .todo-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .delete-btn {
    align-self: flex-end;
  }
}
</style>
