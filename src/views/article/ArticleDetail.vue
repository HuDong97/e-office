<script setup>
import {
    Star,
    Share,
    View,
    Sugar,
    ChatDotRound,

} from '@element-plus/icons-vue'

import { ref, onMounted } from 'vue';
import DOMPurify from 'dompurify';

const article = ref(null);
const sanitizedContent = ref('');

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const likeArticle = () => {
    article.value.likes++;
};

const viewArticle = () => {
    article.value.views++;
};

const toggleBookmark = () => {
    article.value.bookmarked = !article.value.bookmarked;
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
        shares: 199,
        comments: 909,
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
                    <div style="font-size: 20px" title="点赞">
                        <Sugar style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ article.likes }}</span>
                    </div>
                    <div style="font-size: 20px" title="收藏">
                        <Star style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ article.favorites }}</span>
                    </div>
                    <div style="font-size: 20px" title="分享">
                        <Share style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ article.shares }}</span>
                    </div>
                    <div style="font-size: 20px" title="评论">
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
    /* 设置宽度为屏幕宽度的 60% */
    height: 60vh;
    /* 设置高度为屏幕高度的 80% */
    margin: 10vh auto;
    /* 垂直居中 */
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

.article-content {
    margin-top: 20px;
    line-height: 1.6;
    color: #444;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    font-size: 18px;
    color: #999;
}
</style>
