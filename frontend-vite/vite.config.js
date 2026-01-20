import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 简单配置：启用 Vue 插件并设置开发端口
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
  },
});
