import { defineStore } from "pinia";
import { ref } from "vue";

// 创建名为 'userInfo' 的 Pinia store
const useUserInfoStore = defineStore(
  "userInfo",
  () => {
    // 定义状态相关的内容
    const info = ref({});

    // 设置用户信息
    const setInfo = (newInfo) => {
      info.value = newInfo;
    };

    // 移除用户信息
    const removeInfo = () => {
      info.value = {};
    };

    // 返回 store 的状态和方法
    return { info, setInfo, removeInfo };
  },
  { persist: true }
); // 添加了持久化选项，保证状态在刷新页面后依然存在

export default useUserInfoStore;
