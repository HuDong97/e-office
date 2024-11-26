// 导入request.js请求工具
import request from "@/utils/request.js";

// 调用后端 /invokeChat3 接口的方法
export const chat3Service = (msg) => {
  return request
    .get("/chat/invokeChat3", {
      params: { msg },
    })
    .then((response) => {
      console.log("chat3Service response:", response); // 输出返回数据检查
      // 假设返回的data字段是包含响应文本的对象
      if (response && response.data) {
        return response.data; // 直接返回 data 字段
      } else {
        throw new Error("Invalid response format");
      }
    })
    .catch((error) => {
      console.error("Error in chat3Service:", error); // 捕获错误并输出
      throw error; // 继续抛出错误，前端可以处理
    });
};
