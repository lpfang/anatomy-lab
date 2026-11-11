import { defineConfig } from 'vite';

// public/ 下的大数据文件不会被加指纹，用构建号作为 ?v= 参数防止浏览器读到旧缓存
const BUILD_ID = Date.now().toString(36);

export default defineConfig({
  base: './',
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  server: { port: 5178, headers: { 'Cache-Control': 'no-cache' } },
  preview: { port: 5179, headers: { 'Cache-Control': 'no-cache' } },
});
