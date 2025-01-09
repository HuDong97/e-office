<script setup>
import { ref, nextTick } from "vue";
import useUserInfoStore from "@/stores/userInfo.js";
import { invokeChatService } from "@/api/chat.js";

const userInfoStore = useUserInfoStore();

const chatMessages = ref([]);
const newMessage = ref("");
const sending = ref(false);
const error = ref(null);
const loading = ref(false);

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
      const gptMessage = await fetchGptResponse(userMessage.text);
      addMessage(gptMessage);
    } catch (err) {
      console.error("发送消息失败：", err);
    } finally {
      loading.value = false;
    }

    sending.value = false;
    scrollToBottom();
  }
};

const createUserMessage = () => {
  return {
    id: Date.now(),
    sender: userInfoStore.info.userPic,
    text: newMessage.value,
    timestamp: new Date().toLocaleTimeString(),
  };
};

const addMessage = (message) => {
  chatMessages.value.push(message);
  newMessage.value = "";
};

const fetchGptResponse = async (text) => {
  try {
    const response = await invokeChatService(text);

    if (!response || !response.data) {
      throw new Error("后端响应格式错误：数据为空或缺少 data 字段");
    }

    return {
      id: Date.now() + 1,
      sender: "GPT-3.5",
      text: response.data,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    console.error("获取 GPT 响应失败：", error);
    throw new Error(`获取 GPT 响应失败：${error.message}`);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const chatWindow = document.querySelector(".chat-window");
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });
};

const handleKeydown = (event) => {
  if (event.key === "Enter" && event.shiftKey) {
    return;
  } else if (event.key === "Enter" && !event.shiftKey) {
    sendMessage();
    event.preventDefault();
  }
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>AI助手</span>
      </div>
    </template>

    <div class="chat-window">
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
          <!-- GPT-3.5 的消息显示在内容前面 -->
          <span class="sender" v-if="message.sender === 'GPT-3.5'">{{
            message.sender
          }}</span>
          <div class="message-content">
            <span class="message-text">{{ message.text }}</span>
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

    <div class="input-area">
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
        ></el-input>
        <el-button
          type="primary"
          @click="sendMessage"
          :disabled="sending"
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;

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
