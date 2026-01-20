// Vite 配置文件，启用 Vue 3 插件。
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    // 开发时默认端口。
    port: 5173,
  },
});
