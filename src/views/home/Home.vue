<template>
    <div class="home">
        <el-container>

            <el-main>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <div class="post-list">
                            <h2>最新帖子</h2>
                            <ul>
                                <li v-for="post in latestPosts" :key="post.id">
                                    <router-link :to="'/post/' + post.id">{{ post.title }}</router-link>
                                </li>
                            </ul>
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <div class="sidebar">
                            <h2>热门话题</h2>
                            <ul>
                                <li v-for="topic in popularTopics" :key="topic.id">
                                    <router-link :to="'/topic/' + topic.id">{{ topic.title }}</router-link>
                                </li>
                            </ul>
                        </div>
                    </el-col>
                </el-row>
            </el-main>

        </el-container>
    </div>
</template>

<script>
import { ref } from 'vue';

export default {
    name: 'Home',
    setup() {
        // 模拟最新帖子数据
        const latestPosts = ref([
            { id: 1, title: '第一篇帖子' },
            { id: 2, title: '第二篇帖子' },
            { id: 3, title: '第三篇帖子' },
        ]);

        // 模拟热门话题数据
        const popularTopics = ref([
            { id: 1, title: '话题一' },
            { id: 2, title: '话题二' },
            { id: 3, title: '话题三' },
        ]);

        return {
            latestPosts,
            popularTopics,
        };
    },
};
</script>

<style scoped>
.home {
    padding: 20px;
}

.post-list,
.sidebar {
    background-color: #f0f2f5;
    padding: 20px;
    border-radius: 5px;
}

.post-list h2,
.sidebar h2 {
    margin-bottom: 10px;
}

.post-list ul,
.sidebar ul {
    padding: 0;
    list-style-type: none;
}

.post-list li,
.sidebar li {
    margin-bottom: 10px;
}
</style>
