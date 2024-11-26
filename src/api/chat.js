import request from "@/utils/request.js";

export const invokeChatService = async (message) => {
  try {
    const response = await request.get(`/chat/invokeChat3`, {
      params: { msg: message }, // 使用 params 传递查询参数
    });

    // 如果 response 已经是 data，确保前端正确返回
    if (!response || !response.data) {
      throw new Error("后端响应格式错误：数据为空或缺少 data 字段");
    }
    return response; // 返回完整响应
  } catch (error) {
    throw new Error(`调用后端接口失败：${error.message}`);
  }
};
