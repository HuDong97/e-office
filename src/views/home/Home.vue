<script setup>
import { ref } from 'vue'
import { ElPagination } from 'element-plus'

const searchQuery = ref('')
const posts = ref([
    { id: 1, title: '帖子标题1', contentSnippet: '帖子内容摘要1...', author: '作者1', createdAt: '2024-01-01' },
    { id: 2, title: '帖子标题2', contentSnippet: '帖子内容摘要2...', author: '作者2', createdAt: '2024-01-02' },
    { id: 3, title: '帖子标题3', contentSnippet: '帖子内容摘要3...', author: '作者3', createdAt: '2024-01-02' },

    // 添加更多的帖子数据
])
const currentPage = ref(1)
const pageSize = ref(10)
const totalPosts = ref(100)

const popularTags = ref(['标签1', '标签2', '标签3'])
const recentPosts = ref([
    { id: 1, title: '最新帖子1' },
    { id: 2, title: '最新帖子2' },
    { id: 3, title: '最新帖子3' },
    { id: 4, title: '最新帖子4' },
    { id: 5, title: '最新帖子5' },
    { id: 6, title: '最新帖子6' },
    { id: 7, title: '最新帖子7' },
    { id: 8, title: '最新帖子8' },
    { id: 9, title: '最新帖子9' },
    { id: 10, title: '最新帖子10' },
    // 添加更多的最新帖子数据
])

const searchPosts = () => {
    // 搜索帖子逻辑
}

const fetchPosts = () => {
    // 获取帖子逻辑
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<template>
    <el-card class="page-container">
        <!-- 搜索框 -->
        <section class="search-bar">
            <input type="text" placeholder="搜索帖子..." v-model="searchQuery" @keyup.enter="searchPosts" />
            <button @click="searchPosts">搜索</button>
        </section>

        <!-- 主要内容区 -->
        <main class="main-content">
            <div class="posts-list">
                <!-- 帖子列表 -->
                <div v-for="post in posts" :key="post.id" class="post-item">
                    <h2>{{ post.title }}</h2>
                    <p>{{ post.contentSnippet }}</p>
                    <div class="post-meta">
                        <span>作者: {{ post.author }}</span>
                        <span>发布时间: {{ formatDate(post.createdAt) }}</span>
                    </div>
                </div>

                <!-- 分页组件 -->
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="totalPosts"
                    @current-change="fetchPosts" @size-change="fetchPosts" layout="prev, pager, next"
                    background></el-pagination>
            </div>

            <!-- 侧边栏 -->
            <aside class="sidebar">
                <div class="sidebar-section">
                    <h3>热门标签</h3>
                    <div class="tags">
                        <span v-for="tag in popularTags" :key="tag" class="tag">{{ tag }}</span>
                    </div>
                </div>
                <div class="sidebar-section">
                    <h3>最新帖子</h3>
                    <ul>
                        <li v-for="recentPost in recentPosts" :key="recentPost.id">
                            {{ recentPost.title }}
                        </li>
                    </ul>
                </div>
            </aside>
        </main>



    </el-card>
</template>



<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

.search-bar {
    display: flex;
    justify-content: center;
    padding: 1rem;
    background-color: #e9ecef;
    border-bottom: 1px solid #ced4da;
}

.search-bar input {
    width: 300px;
    padding: 0.5rem;
    margin-right: 1rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
}

.search-bar button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.search-bar button:hover {
    background-color: #0056b3;
}

.main-content {
    display: flex;
    flex: 1;
    padding: 1rem;
}

.posts-list {
    flex: 3;
    margin-right: 1rem;
}

.post-item {
    padding: 1.5rem;
    margin-bottom: 1rem;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-item h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #007bff;
}

.post-item p {
    margin: 0 0 1rem 0;
    color: #6c757d;
}

.post-meta {
    font-size: 0.875rem;
    color: #adb5bd;
}

.sidebar {
    flex: 1;
}

.sidebar-section {
    margin-bottom: 1.5rem;
    background-color: #fff;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-section h3 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    color: #343a40;
}

.tags .tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    margin: 0.25rem;
    background-color: #007bff;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
}

.tags .tag:hover {
    background-color: #0056b3;
}
</style>