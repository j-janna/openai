// Vite + Vue 3 入口：创建并挂载根组件
import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';

// 挂载应用到 index.html 中的 #app
createApp(App).mount('#app');
