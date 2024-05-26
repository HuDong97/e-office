<template>
    <div class="tools">
        <el-container>
            <el-main>
                <el-row :gutter="20" class="chat-container">
                    <el-col :span="24">
                        <div class="chat-card">
                            <h2>聊天工具</h2>
                            <div class="chat-window">
                                <transition-group name="message-fade" tag="div">
                                    <div v-for="message in chatMessages" :key="message.id"
                                        :class="['chat-message', message.sender === '用户' ? 'user-message' : 'system-message']">
                                        <span class="sender">{{ message.sender }}:</span>
                                        <span class="message-text">{{ message.text }}</span>
                                        <span class="timestamp">{{ message.timestamp }}</span>
                                    </div>
                                </transition-group>
                            </div>
                            <el-input v-model="newMessage" placeholder="输入你的消息" @keyup.enter="sendMessage"
                                :disabled="sending"></el-input>
                            <el-button type="primary" @click="sendMessage" :disabled="sending">发送</el-button>
                            <div v-if="error" class="error-message">{{ error }}</div>
                        </div>
                    </el-col>
                </el-row>
            </el-main>
        </el-container>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useTokenStore } from '@/stores/token.js';

const tokenStore = useTokenStore();
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

        const userMessage = {
            id: Date.now(),
            sender: '用户',
            text: newMessage.value,
            timestamp: new Date().toLocaleTimeString(),
        };

        chatMessages.value.push(userMessage);
        newMessage.value = '';
        scrollToBottom();

        try {
            const response = await fetch(`/api/chat/invokeChat3?msg=${encodeURIComponent(userMessage.text)}`, {
                method: 'GET',
                headers: {
                    'Authorization': tokenStore.token,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.text();
            const gptMessage = {
                id: Date.now() + 1,
                sender: 'GPT-3.5',
                text: data,
                timestamp: new Date().toLocaleTimeString(),
            };
            chatMessages.value.push(gptMessage);
        } catch (err) {
            error.value = '消息发送失败，请重试。';
        }
        sending.value = false;
        scrollToBottom();
    }
};

const scrollToBottom = () => {
    nextTick(() => {
        const chatWindow = document.querySelector('.chat-window');
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });
};
</script>

<style scoped>
.tools {
    padding: 20px;
}

.chat-container {
    margin-top: 20px;
}

.chat-card {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 25px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.sender {
    font-weight: bold;
    margin-right: 5px;
}

.message-text {
    word-wrap: break-word;
    max-width: 70%;
}

.timestamp {
    font-size: 0.8em;
    color: #999;
    margin-left: 10px;
}

.user-message {
    justify-content: flex-end;
}

.user-message .sender,
.user-message .message-text {
    background-color: #e6f7ff;
    padding: 5px 10px;
    border-radius: 10px;
}

.system-message {
    justify-content: flex-start;
}

.system-message .sender,
.system-message .message-text {
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
</style>
