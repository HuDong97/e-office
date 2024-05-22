<template>
    <div class="tools">
        <el-container>
            <el-main>
                <el-row :gutter="20" class="chat-container">
                    <el-col :span="24">
                        <div class="chat-card">
                            <h2>聊天工具</h2>
                            <div class="chat-window">
                                <div v-for="message in chatMessages" :key="message.id" class="chat-message">
                                    <span class="sender">{{ message.sender }}:</span> {{ message.text }}
                                </div>
                            </div>
                            <el-input v-model="newMessage" placeholder="输入你的消息" @keyup.enter="sendMessage"></el-input>
                            <el-button type="primary" @click="sendMessage">发送</el-button>
                        </div>
                    </el-col>
                </el-row>
            </el-main>
        </el-container>
    </div>
</template>

<script>
export default {
    name: 'Tools',
    data() {
        return {
            chatMessages: [],
            newMessage: '',
        };
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim() !== '') {
                this.chatMessages.push({
                    id: Date.now(),
                    sender: '用户',
                    text: this.newMessage,
                });
                this.newMessage = '';
                // 模拟回复
                setTimeout(() => {
                    this.chatMessages.push({
                        id: Date.now() + 1,
                        sender: 'GPT-4o',
                        text: '这是一个模拟自动回复。',
                    });
                }, 1000);
            }
        },
    },
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
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chat-window {
    height: 200px;
    overflow-y: auto;
    margin-bottom: 20px;
    border: 1px solid #ebeef5;
    padding: 10px;
    border-radius: 5px;
}

.chat-message {
    margin-bottom: 10px;
}

.sender {
    font-weight: bold;
}
</style>
