<script setup>
import {
    Star,
    View,
    Sugar,
    ChatDotRound,
} from '@element-plus/icons-vue';

import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DOMPurify from 'dompurify';
import { ElDrawer, ElButton, ElInput } from 'element-plus';
import { articleDetailService } from '@/api/article.js';
import { useTokenStore } from '@/stores/token.js'


const tokenStore = useTokenStore();
const route = useRoute();
const router = useRouter();
const article = ref(null);

const userBehavior = reactive({
    likesCount: 0,
    favoritesCount: 0,
    commentsCount: 0,
    viewsCount: 0
});
const sanitizedContent = ref('');
const commentsVisible = ref(false);
const newComment = ref('');

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const likeUserBehavior = () => {
    if (userBehavior.liked) {
        userBehavior.likesCount--;
    } else {
        userBehavior.likesCount++;
    }
    userBehavior.liked = !userBehavior.liked;
};

const toggleBookmark = () => {
    if (userBehavior.bookmarked) {
        userBehavior.favoritesCount--;
    } else {
        userBehavior.favoritesCount++;
    }
    userBehavior.bookmarked = !userBehavior.bookmarked;
};

const toggleComments = () => {
    commentsVisible.value = !commentsVisible.value;
};

const submitComment = () => {
    if (newComment.value.trim()) {
        article.commentsCount++;
        // 提交评论的逻辑，例如将评论发送到后端服务器
        newComment.value = ''; // 提交后清空输入框
    }
};

onMounted(async () => {
    const id = route.query.id;
    const articleId = route.query.id;

    if (id) {
        try {
            const articleResponse = await articleDetailService(id, {
                headers: { 'Authorization': tokenStore.token }
            });
            article.value = articleResponse.data;
            sanitizedContent.value = DOMPurify.sanitize(article.value.content);

            try {
                const response = await fetch(`/api/userBehavior/counts?articleId=${articleId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': tokenStore.token,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                userBehavior.likesCount = data.likesCount;
                userBehavior.commentsCount = data.commentsCount;
                userBehavior.viewsCount = data.viewsCount;
                userBehavior.favoritesCount = data.favoritesCount;
            } catch (userBehaviorError) {
                console.error('获取用户行为数据失败：', userBehaviorError);
            }

        } catch (error) {
            console.error('查看文章或获取用户行为数据失败', error);
            router.push('/404');
        }
    } else {
        console.error('查看文章失败');
        router.push('/404');
    }
});
</script>

<template>
    <div v-if="article" class="article-container">
        <div class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
            <p class="article-meta">
                <span>
                    <span class="article-date">发布时间：{{ formatDate(article.createTime) }}</span>
                    <span class="article-author">作者：{{ article.createUser }}</span>
                </span>
                <span class="article-icons">
                    <div style="font-size: 20px" title="点赞" @click="likeUserBehavior">
                        <Sugar
                            :style="{ width: '1em', height: '1em', marginRight: '2px', color: userBehavior['liked'] ? 'red' : '' }" />
                        <span>{{ userBehavior.likesCount }}</span>
                    </div>
                    <div style="font-size: 20px" title="收藏" @click="toggleBookmark">
                        <Star
                            :style="{ width: '1em', height: '1em', marginRight: '2px', color: userBehavior['bookmarked'] ? 'yellow' : '' }" />
                        <span>{{ userBehavior.favoritesCount }}</span>
                    </div>
                    <div style="font-size: 20px" title="评论" @click="toggleComments">
                        <ChatDotRound style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ userBehavior.commentsCount }}</span>
                    </div>
                    <div style="font-size: 20px" title="浏览量">
                        <View style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ userBehavior.viewsCount }}</span>
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

.article-container {
    max-width: 65%;
    height: 55vh;
    margin: 10vh auto;
    padding: 25px;
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
}

.send-button {
    height: auto;
}
</style>
