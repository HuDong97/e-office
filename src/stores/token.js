//定义store
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTokenStore = defineStore(
  "token",
  () => {
    // 定义状态的内容
    const token = ref("");

    // 定义一个函数,修改token的值
    const setToken = (newToken) => {
      token.value = newToken;
    };

    // 函数,移除token的值
    const removeToken = () => {
      token.value = "";
    };

    // 新增获取token的函数
    const getToken = () => {
      return token.value;
    };

    return {
      token,
      setToken,
      removeToken,
      getToken,
    };
  },
  {
    persist: true, //持久化存储
  }
);
