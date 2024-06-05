<script setup>
import { ref, onMounted } from 'vue';
import { useTokenStore } from '@/stores/token.js';

const tokenStore = useTokenStore();

const likesCount = ref(0);
const commentsCount = ref(0);
const viewsCount = ref(0);
const favoritesCount = ref(0);


</script>
<template>
    <div>
        <h1>测试页面</h1>

    </div>
</template>
