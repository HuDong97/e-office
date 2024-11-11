import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        //获取路径中包含了/api的请求
        target: "http://localhost:18080", //后台服务所在的地址
        changeOrigin: true, //修改地址
        rewrite: (path) => path.replace(/^\/api/, ""), // 重写请求路径，将 /api 开头的请求去掉 /api
      },
    },
  },
});
