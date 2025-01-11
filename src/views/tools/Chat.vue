<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import useUserInfoStore from "@/stores/userInfo.js";
import {
  invokeChatService,
  invokeDeepSeekChat,
  getChatGptDetail,
  getDeepSeekChatDetail,
} from "@/api/chat.js";
const md = new MarkdownIt();
const userInfoStore = useUserInfoStore();
const inputArea = ref(null);
const chatMessages = ref([]);
const newMessage = ref("");
const sending = ref(false);
const error = ref(null);
const loading = ref(false);
const selectedModel = ref("deepseek"); // 默认选择deepseek
const scrollToInput = () => {
  nextTick(() => {
    if (inputArea.value) {
      inputArea.value.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
};
// 发送消息
const sendMessage = async () => {
  if (newMessage.value.trim() !== "" && !sending.value) {
    if (newMessage.value.length > 200) {
      error.value = "消息过长，请限制在200字符以内。";
      return;
    }
    sending.value = true;
    error.value = null;

    const userMessage = createUserMessage();
    addMessage(userMessage);

    loading.value = true;

    try {
      let gptMessage;
      if (selectedModel.value === "gpt-4") {
        gptMessage = await fetchGptResponse(userMessage.text);
      } else if (selectedModel.value === "deepseek") {
        gptMessage = await fetchDeepSeekResponse(userMessage.text);
      }
      addMessage(gptMessage);
    } catch (err) {
      console.error("发送消息失败：", err);
      error.value = "发送消息失败，请稍后重试。";
    } finally {
      loading.value = false;

      scrollToInput();
    }

    sending.value = false;
  }
};

// 创建用户消息
const createUserMessage = () => {
  return {
    id: Date.now(),
    sender: userInfoStore.info.userPic,
    text: newMessage.value,
    timestamp: new Date().toLocaleTimeString(),
  };
};

// 添加消息到聊天记录
const addMessage = (message) => {
  chatMessages.value.push(message);
  newMessage.value = "";
};

// 处理 GPT 响应
const fetchGptResponse = async (text) => {
  try {
    const response = await invokeChatService(text);
    return handleResponse(response, "GPT-4");
  } catch (error) {
    console.error("获取 GPT 响应失败：", error);
    throw new Error(`获取 GPT 响应失败：${error.message}`);
  }
};

// 处理 DeepSeek 响应
const fetchDeepSeekResponse = async (text) => {
  try {
    const response = await invokeDeepSeekChat(text);
    return handleResponse(response, "DeepSeek");
  } catch (error) {
    console.error("获取 DeepSeek 响应失败：", error);
    throw new Error(`获取 DeepSeek 响应失败：${error.message}`);
  }
};

// 统一处理响应
const handleResponse = (response, sender) => {
  if (!response || !response.data) {
    throw new Error("后端响应格式错误：数据为空或缺少 data 字段");
  }

  return {
    id: Date.now() + 1,
    sender,
    text: response.data,
    timestamp: new Date().toLocaleTimeString(),
  };
};

// 处理键盘事件
const handleKeydown = (event) => {
  if (event.key === "Enter" && event.shiftKey) {
    return;
  } else if (event.key === "Enter" && !event.shiftKey) {
    sendMessage();
    event.preventDefault();
  }
};

// 监听模型切换
watch(selectedModel, async (newModel) => {
  chatMessages.value = [];
  try {
    const response =
      newModel === "gpt-4"
        ? await getChatGptDetail()
        : await getDeepSeekChatDetail();
    if (response && response.data) {
      response.data.forEach((message) => {
        addMessage({
          id: message.id,
          sender: userInfoStore.info.userPic,
          text: message.question,
          timestamp: message.questionTime,
        });
        addMessage({
          id: message.id + 1,
          sender: newModel === "gpt-4" ? "GPT-4" : "DeepSeek",
          text: message.answer,
          timestamp: message.answerTime,
        });
      });
    }
  } catch (error) {
    console.error("获取聊天记录失败：", error);
    error.value = "获取聊天记录失败，请稍后重试。";
  } finally {
    // 模型切换后滚动到输入框
    scrollToInput();
  }
});

// 组件加载时获取聊天记录
onMounted(async () => {
  try {
    const response =
      selectedModel.value === "gpt-4"
        ? await getChatGptDetail()
        : await getDeepSeekChatDetail();
    if (response && response.data) {
      response.data.forEach((message) => {
        addMessage({
          id: message.id,
          sender: userInfoStore.info.userPic,
          text: message.question,
          timestamp: message.questionTime,
        });
        addMessage({
          id: message.id + 1,
          sender: selectedModel.value === "gpt-4" ? "GPT-4" : "DeepSeek",
          text: message.answer,
          timestamp: message.answerTime,
        });
      });
    }
  } catch (error) {
    console.error("获取聊天记录失败：", error);
    error.value = "获取聊天记录失败，请稍后重试。";
  } finally {
    // 滚动到输入框
    scrollToInput();
  }
});

const parseMarkdown = (text) => {
  const html = md.render(text);
  return DOMPurify.sanitize(html);
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>AI助手</span>
        <el-select
          v-model="selectedModel"
          placeholder="选择模型"
          style="margin-left: 20px; width: 150px"
        >
          <el-option label="GPT-4" value="gpt-4" />
          <el-option label="DeepSeek" value="deepseek" />
        </el-select>
      </div>
    </template>

    <div class="chat-window" style="border-radius: 20px">
      <transition-group name="message-fade" tag="div">
        <div
          v-for="message in chatMessages"
          :key="message.id"
          :class="[
            'chat-message',
            message.sender === userInfoStore.info.userPic
              ? 'user-message'
              : 'system-message',
          ]"
        >
          <!-- 消息昵称显示在内容前面 -->
          <span
            class="sender"
            v-if="message.sender === 'GPT-4' || message.sender === 'DeepSeek'"
            >{{ message.sender }}</span
          >
          <div class="message-content">
            <span
              class="message-text"
              v-html="parseMarkdown(message.text)"
            ></span>
            <span class="timestamp">{{ message.timestamp }}</span>
          </div>
          <!-- 用户头像显示在内容后面 -->
          <img
            :src="message.sender"
            v-if="message.sender === userInfoStore.info.userPic"
            class="avatar"
            alt="Avatar"
          />
        </div>
      </transition-group>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="dot-container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>

    <div ref="inputArea" class="input-area">
      <div class="input-container">
        <el-input
          type="textarea"
          v-model="newMessage"
          placeholder="输入你的消息"
          rows="1"
          :autosize="{ minRows: 1, maxRows: 6 }"
          class="input"
          @keydown="handleKeydown"
          style="max-height: 80px; overflow-y: auto"
          :disabled="loading"
        ></el-input>
        <el-button
          type="primary"
          @click="sendMessage"
          :disabled="sending || loading"
          class="send-button"
        >
          发送
        </el-button>
      </div>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </el-card>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 18px;
    font-weight: bold;
  }
}
.page-container {
  min-height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px;
  padding: 2rem;
  box-sizing: border-box;
}

.chat-window {
  min-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  padding: 10px;
  border-radius: 5px;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #ebeef5;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #ebeef5;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 10px;
    border: 2px solid #ebeef5;
  }
}

.chat-message {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  &.user-message {
    justify-content: flex-end;

    .message-content {
      background-color: #e6f7ff;
      padding: 5px 10px;
      border-radius: 10px;
      margin-right: 10px;
    }
  }

  &.system-message {
    justify-content: flex-start;

    .message-content {
      background-color: #f5f5f5;
      padding: 5px 10px;
      border-radius: 10px;
      margin-left: 10px;
    }
  }

  .message-content {
    display: flex;
    flex-direction: column;
    max-width: 70%;
  }

  .message-text {
    word-wrap: break-word;
  }

  .timestamp {
    font-size: 0.7em;
    color: #999;
    margin-top: 2px;
  }

  .sender {
    font-size: 0.9em;
    color: #555;
    margin-right: 10px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;

  .dot-container {
    display: flex;
    justify-content: space-between;
    width: 50px;

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #409eff;
      animation: bounce 0.6s infinite alternate;

      &:nth-child(1) {
        animation-delay: 0s;
      }

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-10px);
  }
}

.error-message {
  color: red;
  margin-top: 10px;
}

.input-container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;

  .input {
    flex-grow: 1;
    margin-right: 10px;
  }

  .send-button {
    margin-left: 10px;
    height: auto;
    border-radius: 50px;
  }
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.5s;
}

.message-fade-enter,
.message-fade-leave-to {
  opacity: 0;
}
</style>
