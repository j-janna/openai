<template>
  <div class="container">
    <div class="header">
      <div class="title">🍎 Todo（Vite 原型）</div>
      <div style="display:flex;gap:12px;align-items:center">
        <div class="small">完成率: {{ stats.percent }}%（{{ stats.done }} / {{ stats.total }}）</div>
        <button @click="toggleTheme" class="small">切换 {{ theme === 'dark' ? '亮色' : '夜间' }} 模式</button>
      </div>
    </div>

    <div class="card">
      <div class="input-row">
        <input v-model="input" @keyup.enter="addTodo" placeholder="添加新的待办..." />
        <button @click="addTodo" class="icon-btn" aria-label="添加"> 
          <!-- 加号图标 -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="filters">
        <button @click="filter = 'all'">全部</button>
        <button @click="filter = 'todo'">未完成</button>
        <button @click="filter = 'done'">已完成</button>
      </div>

      <div class="todo-list">
        <div v-if="loading" class="small">加载中...</div>
        <div v-else>
          <transition-group name="list" tag="div">
            <div v-for="t in filtered" :key="t._id" class="todo-item">
              <div class="todo-main">
                <div :class="['checkbox', { active: t.isCompleted }]" @click="toggleTodo(t._id)">
                  <svg v-if="t.isCompleted" width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div :class="['value', { completed: t.isCompleted }]">{{ t.value }}</div>
              </div>
              <div class="controls">
                <button @click="deleteTodo(t._id)" aria-label="删除" title="删除" class="icon-btn">
                  <!-- 简单垃圾桶图标 SVG -->
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>
          </transition-group>
          <div v-if="!filtered.length" class="small">暂无待办</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这个组件使用 Composition API（script setup）
import { ref, computed, onMounted } from 'vue';

const todos = ref([]);
const input = ref('');
const filter = ref('all');
const loading = ref(false);

// 拉取所有待办
async function fetchTodos() {
  loading.value = true;
  try {
    const res = await fetch('/api/get-todo');
    todos.value = await res.json();
  } catch (e) {
    console.error('fetchTodos error', e);
  } finally {
    loading.value = false;
  }
}

async function addTodo() {
  const v = input.value.trim();
  if (!v) return;
  try {
    const res = await fetch('/api/add-todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: v }),
    });
    const created = await res.json();
    todos.value.unshift(created);
    input.value = '';
  } catch (e) {
    console.error('addTodo error', e);
  }
}

async function toggleTodo(id) {
  try {
    const res = await fetch('/api/update-todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const updated = await res.json();
    const idx = todos.value.findIndex((t) => t._id === id);
    if (idx >= 0) todos.value[idx] = updated;
  } catch (e) {
    console.error('toggleTodo error', e);
  }
}

async function deleteTodo(id) {
  try {
    const res = await fetch('/api/del-todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const r = await res.json();
    if (r.success) todos.value = todos.value.filter((t) => t._id !== id);
  } catch (e) {
    console.error('deleteTodo error', e);
  }
}

const filtered = computed(() => {
  if (filter.value === 'done') return todos.value.filter((t) => t.isCompleted);
  if (filter.value === 'todo') return todos.value.filter((t) => !t.isCompleted);
  return todos.value;
});

const stats = computed(() => {
  const total = todos.value.length;
  const done = todos.value.filter((t) => t.isCompleted).length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
});

// 主题（dark / light）控制，写入 localStorage
import { watch } from 'vue';
const theme = ref(localStorage.getItem('theme') || 'light');
function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme.value);
  localStorage.setItem('theme', theme.value);
}
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  applyTheme();
}
applyTheme();

onMounted(fetchTodos);

// 监听 theme 变化以应用
watch(theme, () => applyTheme());
</script>

<style scoped>
/* 本组件不额外声明样式，使用全局样式 */
</style>
