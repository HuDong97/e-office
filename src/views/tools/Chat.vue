<script>
export default {
    name: 'Tools',
    data() {
        return {
            chatMessages: [],
            newMessage: '',
            sending: false,
            error: null, // 用于存储错误信息
        };
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim() !== '' && !this.sending) {
                if (this.newMessage.length > 200) { // 限制消息长度
                    this.error = '消息过长，请限制在200字符以内。';
                    return;
                }
                this.sending = true;
                this.error = null;
                this.chatMessages.push({
                    id: Date.now(),
                    sender: '用户',
                    text: this.newMessage,
                    timestamp: new Date().toLocaleTimeString(),
                });
                this.newMessage = '';
                this.scrollToBottom();
                // 模拟回复
                setTimeout(() => {
                    // 模拟网络错误
                    if (Math.random() < 0.1) {
                        this.error = '消息发送失败，请重试。';
                        this.sending = false;
                        return;
                    }
                    this.chatMessages.push({
                        id: Date.now() + 1,
                        sender: 'GPT-4o',
                        text: '这是一个模拟自动回复。',
                        timestamp: new Date().toLocaleTimeString(),
                    });
                    this.sending = false;
                    this.scrollToBottom();
                }, 1000);
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const chatWindow = this.$el.querySelector('.chat-window');
                chatWindow.scrollTop = chatWindow.scrollHeight;
            });
        },
    },
};
</script>

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
    /* 修改高度为页面的46% */
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
