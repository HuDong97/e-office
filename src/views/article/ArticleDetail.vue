<template>
    <div v-if="article" class="article-container">
        <div class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
            <p class="article-date">{{ formatDate(article.creationDate) }}</p>
        </div>
        <div class="article-content" v-html="sanitizedContent"></div>
    </div>
    <div v-else class="loading-container">
        <p>Loading...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DOMPurify from 'dompurify';

const article = ref(null);
const sanitizedContent = ref('');

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

onMounted(() => {
    const mockArticle = {
        title: '示例文章标题',
        creationDate: '2024-05-27T10:00:00Z',
        content: '<p>这是文章内容的示例。</p><p>这是另一段内容。</p>',
    };

    article.value = mockArticle;
    sanitizedContent.value = DOMPurify.sanitize(mockArticle.content);

    console.log('Article Data:', article.value);
});
</script>

<style scoped>
html,
body {
    height: 100%;
    margin: 0;
}

.article-container {
    max-width: 85%;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    height: 90%;
}

.article-header {
    text-align: center;
}

.article-cover {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 8px;
}

.article-title {
    margin: 20px 0 10px;
    font-size: 2.5em;
    color: #333;
}

.article-date {
    margin: 0;
    font-size: 1em;
    color: #999;
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
    height: 90vh;
    font-size: 1.5em;
    color: #999;
}
</style>
