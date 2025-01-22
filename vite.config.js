import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0", // 监听所有网络接口
    port: 5173, // 指定端口号
    proxy: {
      "/api": {
        target: "http://192.168.62.130:18080", // 后端服务地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       //获取路径中包含了/api的请求
  //       target: "http://localhost:18080", //后台服务所在的地址
  //       changeOrigin: true, //修改地址
  //       rewrite: (path) => path.replace(/^\/api/, ""), // 重写请求路径，将 /api 开头的请求去掉 /api
  //     },
  //   },
  // },

  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
});
