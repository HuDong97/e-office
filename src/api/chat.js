// chat.js

export const sendChatMessage = async (text, token) => {
  try {
    // 处理请求参数并进行编码
    const encodedText = encodeURIComponent(text);

    const response = await fetch(`/api/chat/invokeChat3?msg=${encodedText}`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 假设返回的数据为 JSON 格式
    const responseData = await response.json();
    if (!responseData.data) {
      throw new Error("后端响应格式错误：缺少 data 字段");
    }

    return {
      id: Date.now() + 1,
      sender: "GPT-3.5",
      text: responseData.data,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    throw error;
  }
};
