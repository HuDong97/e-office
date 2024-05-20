<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { User } from '@element-plus/icons-vue';

// 热榜和关注更新动态的数据
const hotList = ref([]);
const followUpdates = ref([]);

// 模拟获取数据
const fetchHotList = () => {
    hotList.value = [
        { title: '热帖1', link: '#' },
        { title: '热帖2', link: '#' },
        { title: '热帖3', link: '#' },
    ];
};

const fetchFollowUpdates = () => {
    followUpdates.value = [
        { title: '关注更新1', link: '#' },
        { title: '关注更新2', link: '#' },
        { title: '关注更新3', link: '#' },
    ];
};

// 用户信息
const user = ref({
    username: '用户名',
});

// 页面加载时获取数据
onMounted(() => {
    fetchHotList();
    fetchFollowUpdates();
});

// 消息提示示例
const showNotification = () => {
    ElNotification({
        title: '通知',
        message: '这是一个消息通知',
        type: 'info',
    });
};

</script>

<template>
    <div class="forum-home">
        <header class="header">
            <div class="logo">论坛</div>
            <div class="user-center">
                <el-avatar icon="User" />
                <span>{{ user.username }}</span>
            </div>
        </header>

        <main class="main-content">
            <section class="hot-list">
                <h2>热榜</h2>
                <ul>
                    <li v-for="item in hotList" :key="item.title">
                        <a :href="item.link">{{ item.title }}</a>
                    </li>
                </ul>
            </section>

            <section class="follow-updates">
                <h2>关注更新</h2>
                <ul>
                    <li v-for="item in followUpdates" :key="item.title">
                        <a :href="item.link">{{ item.title }}</a>
                    </li>
                </ul>
            </section>
        </main>
    </div>
</template>

<style scoped>
.forum-home {
    font-family: Arial, sans-serif;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
}

.logo {
    font-size: 24px;
    font-weight: bold;
}

.user-center {
    display: flex;
    align-items: center;
}

.user-center el-avatar {
    margin-right: 10px;
}

.main-content {
    display: flex;
    justify-content: space-around;
    padding: 20px;
}

.hot-list,
.follow-updates {
    width: 45%;
}

h2 {
    border-bottom: 2px solid #007bff;
    padding-bottom: 5px;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    padding: 5px 0;
}

a {
    text-decoration: none;
    color: #007bff;
}

a:hover {
    text-decoration: underline;
}
</style>
