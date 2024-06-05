<script setup>
import { ref, nextTick } from 'vue';
import { useTokenStore } from '@/stores/token.js';
import useUserInfoStore from '@/stores/userInfo.js';

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

const chatMessages = ref([]);
const newMessage = ref('');
const sending = ref(false);
const error = ref(null);

const sendMessage = async () => {
    if (newMessage.value.trim() !== '' && !sending.value) {
        if (newMessage.value.length > 200) {
            error.value = '消息过长，请限制在200字符以内。';
            return;
        }
        sending.value = true;
        error.value = null;

        const userMessage = createUserMessage();

        addMessage(userMessage);

        try {
            const gptMessage = await fetchGptResponse(userMessage.text);
            addMessage(gptMessage);
        } catch (err) {
            handleError(err);
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
    newMessage.value = '';
};

const fetchGptResponse = async (text) => {
    const response = await fetch(`/api/chat/invokeChat3?msg=${encodeURIComponent(text)}`, {
        method: 'GET',
        headers: {
            'Authorization': tokenStore.token,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    return {
        id: Date.now() + 1,
        sender: 'GPT-3.5',
        text: data,
        timestamp: new Date().toLocaleTimeString(),
    };
};

const handleError = (err) => {
    error.value = '消息发送失败，请重试。';
    console.error(err);
};

const scrollToBottom = () => {
    nextTick(() => {
        const chatWindow = document.querySelector('.chat-window');
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });
};
</script>

<template>
    <div class="tools">
        <el-container>
            <el-main>
                <el-row :gutter="20" class="chat-container">
                    <el-col :span="17">
                        <div class="chat-card">
                            <h2>Ai聊天工具</h2>
                            <div class="chat-window">
                                <transition-group name="message-fade" tag="div">
                                    <div v-for="message in chatMessages" :key="message.id"
                                        :class="['chat-message', message.sender === userInfoStore.info.userPic ? 'user-message' : 'system-message']">
                                        <div class="message-content">
                                            <span class="message-text">{{ message.text }}</span>
                                            <span class="timestamp">{{ message.timestamp }}</span>
                                        </div>
                                        <img :src="message.sender" v-if="message.sender === userInfoStore.info.userPic"
                                            class="avatar" alt="Avatar">
                                        <span class="sender" v-else>{{ message.sender }}</span>
                                    </div>
                                </transition-group>
                            </div>
                            <el-input v-model="newMessage" placeholder="输入你的消息" @keyup.enter="sendMessage"
                                :disabled="sending" class="input-box"></el-input>
                            <el-button type="primary" @click="sendMessage" :disabled="sending"
                                class="send-button">发送</el-button>
                            <div v-if="error" class="error-message">{{ error }}</div>
                        </div>
                    </el-col>
                </el-row>
            </el-main>
        </el-container>
    </div>
</template>

<style scoped>
.tools {
    padding: 20px;
}

.chat-container {
    margin-top: 20px;
    justify-content: center;
}

.chat-card {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 25px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    width: 100%;
}

.chat-window {
    height: 46vh;
    overflow-y: auto;
    margin-bottom: 20px;
    border: 1px solid #ebeef5;
    padding: 10px;
    border-radius: 5px;
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #ebeef5;
}

.chat-window::-webkit-scrollbar {
    width: 8px;
}

.chat-window::-webkit-scrollbar-track {
    background: #ebeef5;
    border-radius: 10px;
}

.chat-window::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 10px;
    border: 2px solid #ebeef5;
}

.chat-message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.message-content {
    display: flex;
    flex-direction: column;
    max-width: 70%;
}

.sender {
    font-size: 0.9em;
    color: #555;
    margin-left: 10px;
}

.message-text {
    word-wrap: break-word;
}

.timestamp {
    font-size: 0.7em;
    color: #999;
    margin-top: 2px;
}

.user-message {
    justify-content: flex-end;
}

.user-message .message-content {
    background-color: #e6f7ff;
    padding: 5px 10px;
    border-radius: 10px;
}

.system-message {
    justify-content: flex-start;
}

.system-message .message-content {
    background-color: #f5f5f5;
    padding: 5px 10px;
    border-radius: 10px;
}

.message-fade-enter-active,
.message-fade-leave-active {
    transition: opacity 0.5s;
}

.message-fade-enter,
.message-fade-leave-to {
    opacity: 0;
}

.error-message {
    color: red;
    margin-top: 10px;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.input-box {
    margin-top: 5px;
}

.send-button {
    margin-top: 10px;
}
</style>