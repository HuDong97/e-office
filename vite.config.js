export default {
  // other vite config options
  server: {
    port: 8080 // 设置 Vite 服务器监听的端口为 8080
  },
  proxy: {
    '/user': {
      target: 'http://localhost:18081', // 将以 /user 开头的请求代理到 localhost:18081
      changeOrigin: true,
      rewrite: path => path.replace(/^\/user/, '') // 重写请求路径，去除掉 /user 前缀
    },
    '/article': {
      target: 'http://localhost:18082', // 将以 /article 开头的请求代理到 localhost:18082
      changeOrigin: true,
      rewrite: path => path.replace(/^\/article/, '') // 重写请求路径，去除掉 /article 前缀
    },
    '/category': {
      target: 'http://localhost:18083', // 将以 /category 开头的请求代理到 localhost:18083
      changeOrigin: true,
      rewrite: path => path.replace(/^\/category/, '') // 重写请求路径，去除掉 /category 前缀
    }
  }
}
