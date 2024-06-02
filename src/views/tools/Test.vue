<template>
    <div>
        <h1>测试页面</h1>
        <div>
            <p>点赞数: {{ likesCount }}</p>
            <p>评论数: {{ commentsCount }}</p>
            <p>浏览量: {{ viewsCount }}</p>
            <p>收藏数: {{ favoritesCount }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTokenStore } from '@/stores/token.js';

const tokenStore = useTokenStore();

const likesCount = ref(0);
const commentsCount = ref(0);
const viewsCount = ref(0);
const favoritesCount = ref(0);

onMounted(async () => {
    try {
        const response = await fetch(`/api/userBehavior/counts?articleId=41`, {
            method: 'GET',
            headers: {
                'Authorization': tokenStore.token,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('返回的数据:', data); // 在控制台输出返回的 data 信息

        likesCount.value = data.likesCount;
        commentsCount.value = data.commentsCount;
        viewsCount.value = data.viewsCount;
        favoritesCount.value = data.favoritesCount;
    } catch (error) {
        console.error('获取文章行为统计数据失败：', error);
    }
});
</script>
