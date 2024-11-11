<template>
  <div class="not-found">
    <h1>404 Not Found</h1>
    <p>你访问的页面不存在。</p>
    <router-link to="/home">返回首页</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
  font-size: 24px;
}

.not-found h1 {
  font-size: 48px;
  color: #333;
}

.not-found p {
  margin-top: 20px;
  color: #666;
}

.not-found router-link {
  margin-top: 20px;
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.not-found router-link:hover {
  background-color: #0056b3;
}
</style>
