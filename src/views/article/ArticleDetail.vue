<script setup>
import {
    Star,
    Share,
    View,
    Sugar,
    ChatDotRound,
} from '@element-plus/icons-vue';

import { ref, onMounted } from 'vue';
import DOMPurify from 'dompurify';
import { ElDrawer, ElButton, ElInput } from 'element-plus';

const article = ref(null);
const sanitizedContent = ref('');
const commentsVisible = ref(false);
const newComment = ref(''); // 新增评论内容

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const likeArticle = () => {
    if (article.value.liked) {
        article.value.likes--;
    } else {
        article.value.likes++;
    }
    article.value.liked = !article.value.liked;
};

const toggleBookmark = () => {
    if (article.value.bookmarked) {
        article.value.favorites--;
    } else {
        article.value.favorites++;
    }
    article.value.bookmarked = !article.value.bookmarked;
};

const toggleComments = () => {
    commentsVisible.value = !commentsVisible.value;
};

const submitComment = () => {
    if (newComment.value.trim()) {
        article.value.comments++;
        // 在此处添加提交评论的逻辑，例如发送到后端服务器
        newComment.value = ''; // 提交后清空输入框
    }
};

const shareArticle = () => {
    // Your share functionality here
};

onMounted(() => {
    const mockArticle = {
        title: '示例文章标题',
        author: '某某某',
        creationDate: '2024-05-27T10:00:00Z',
        content: '<p>这是文章内容的示例。</p><p>这是另一段内容。</p>',
        views: 1000,
        likes: 10,
        favorites: 99,
        comments: 909,
        liked: false,
        bookmarked: false
    };

    article.value = mockArticle;
    sanitizedContent.value = DOMPurify.sanitize(mockArticle.content);
});
</script>

<template>
    <div v-if="article" class="article-container">
        <div class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
            <p class="article-meta">
                <span>
                    <span class="article-date">发布时间：{{ formatDate(article.creationDate) }}</span>
                    <span class="article-author">作者：{{ article.author }}</span>
                </span>
                <span class="article-icons">
                    <div style="font-size: 20px" title="浏览量">
                        <View style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ article.views }}</span>
                    </div>
                    <div style="font-size: 20px" title="点赞" @click="likeArticle">
                        <Sugar
                            :style="{ width: '1em', height: '1em', marginRight: '2px', color: article.liked ? 'red' : '' }" />
                        <span>{{ article.likes }}</span>
                    </div>
                    <div style="font-size: 20px" title="收藏" @click="toggleBookmark">
                        <Star
                            :style="{ width: '1em', height: '1em', marginRight: '2px', color: article.bookmarked ? 'yellow' : '' }" />
                        <span>{{ article.favorites }}</span>
                    </div>

                    <div style="font-size: 20px" title="评论" @click="toggleComments">
                        <ChatDotRound style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ article.comments }}</span>
                    </div>
                </span>
            </p>
        </div>
        <div class="article-content" v-html="sanitizedContent"></div>
    </div>
    <div v-else class="loading-container">
        <el-loading-spinner size="120px"></el-loading-spinner>
    </div>

    <el-drawer v-model="commentsVisible" :title="'评论区'" direction="rtl" size="30%">
        <div class="comments-container">
            <!-- 评论内容，可以根据实际需求替换 -->
            <div class="comments-section">
                <p>这是评论内容的示例。</p>
                <p>评论1：这是一条评论。</p>
                <p>评论2：这是另一条评论。</p>
                <p>评论3：这是第三条评论。</p>
            </div>

            <!-- 评论输入框 -->
            <div class="comment-input">
                <div class="input-container">
                    <el-input type="textarea" v-model="newComment" placeholder="请输入你的评论" rows="3"
                        class="input"></el-input>
                    <el-button type="primary" @click="submitComment" class="send-button">发送</el-button>
                </div>
            </div>
        </div>
    </el-drawer>






</template>

<style scoped>
.article-date {
    margin-right: 30px;
}

.article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.article-icons {
    display: flex;
    align-items: center;
}

.article-icons div {
    display: flex;
    align-items: center;
    margin-right: 20px;
}

.article-icons span {
    margin-left: 0px;
    font-size: 0.6em;
}

.article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.article-icons {
    display: flex;
    align-items: center;
}

.article-container {
    max-width: 65%;
    height: 60vh;
    margin: 10vh auto;
    padding: 30px;
    font-family: 'Arial', sans-serif;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.article-header {
    padding-bottom: 20px;
    border-bottom: 1px solid #ebebeb;
}

.article-title {
    margin: 0;
    font-size: 24px;
    color: #333;
}

.article-meta {
    font-size: 14px;
    color: #666;
}

.comments-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.comments-section {
    padding: 20px;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
}

.comment-input {
    margin-top: auto;
}

.input-container {
    display: flex;
    align-items: flex-end;
}

.input {
    flex: 1;
    margin-right: 10px;
    /* 调整输入框与发送按钮的间距 */
}

.send-button {
    height: auto;
}
</style>
