import axios from "axios";
import { ElMessage } from "element-plus";
import { useTokenStore } from "@/stores/token.js";
import router from "@/router";

// 创建 Axios 实例
const instance = axios.create({ baseURL: "/api" });

// 控制错误消息显示的标志变量和定时器
let isShowingError = false;

instance.interceptors.request.use(
  (config) => {
    const tokenStore = useTokenStore();
    if (tokenStore.token) {
      config.headers.Authorization = tokenStore.token;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

instance.interceptors.response.use(
  (result) => {
    if (result.data.code === 1) {
      return result.data;
    }
    showError(result.data.message || "系统繁忙，请稍后重试");
    return Promise.reject(result.data);
  },
  (err) => {
    if (err.response) {
      const status = err.response.status;
      const message = err.response.data.message;

      if (status === 401) {
        showError(message || "您的登录已过期，请重新登录");
        router.push("/login");
      } else if (status === 409) {
        showError(message || "您的账号在其他设备上登录，请重新登录");
        router.push("/login");
      } else if (status >= 500) {
        showError("服务器开小差了，请稍后再试");
      } else {
        showError(message || "请求失败，请稍后重试");
      }
    } else {
      // 处理无响应错误
      if (err.message.includes("timeout")) {
        showError("请求超时，请检查网络连接");
      } else {
        showError("网络似乎出了点问题，请检查网络后重试");
      }
    }
    return Promise.reject(err);
  }
);

function showError(message) {
  if (!isShowingError) {
    isShowingError = true;
    ElMessage.error(message);
    // 设置定时器在一定时间后重置标志，避免重复提示
    setTimeout(() => {
      isShowingError = false;
    }, 2000); // 2秒内不再显示新的错误提示
  }
}

export default instance;
