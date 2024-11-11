//导入axios  npm install axios
import axios from "axios";
//导入 Element Plus 组件库中的消息提示组件
import { ElMessage } from "element-plus";

// 创建 Axios 实例
const instance = axios.create({ baseURL: "/api" }); // 将 baseURL 设置为 /api

import { useTokenStore } from "@/stores/token.js";
//添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    //请求前的回调
    //添加token
    const tokenStore = useTokenStore();
    //判断有没有token
    if (tokenStore.token) {
      config.headers.Authorization = tokenStore.token;
    }
    return config;
  },
  (err) => {
    //请求错误的回调
    return Promise.reject(err);
  }
);

import router from "@/router";

//添加响应拦截器
instance.interceptors.response.use(
  (result) => {
    // 对响应数据进行处理，这里返回响应数据的 data 部分
    //判断业务状态码，1操作成功
    if (result.data.code === 1) {
      return result.data;
    }
    //操作失败

    ElMessage.error(result.data.message ? result.data.message : "服务异常");
    //异步操作的状态转换为失败
    return Promise.reject(result.data);
  },
  (err) => {
    // 判断响应状态码
    if (err.response) {
      const status = err.response.status;
      const message = err.response.data.message; // 从后端获取错误信息

      // 处理不同的错误状态码
      if (status === 401) {
        // 处理未授权错误
        ElMessage.error(message || "请先登录");
        router.push("/login");
      } else if (status === 409) {
        // 处理冲突错误
        ElMessage.error(message || "账号在其他设备登录，请重新登录");
        router.push("/login"); // 重定向到登录页面
      } else {
        // 处理其他错误
        ElMessage.error(message || "服务异常");
      }
    } else {
      // 处理网络错误或没有响应的情况
      ElMessage.error("网络错误，请稍后重试");
    }
    return Promise.reject(err); // 异步的状态转化成失败的状态
  }
);

export default instance;
