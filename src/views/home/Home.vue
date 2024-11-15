<script setup>
import { ref, computed } from "vue";

const posts = ref([
  {
    id: 1,
    title: "帖子标题1",
    contentSnippet: "帖子内容摘要1...",
    author: "作者1",
    createdAt: "2024-01-01",
    views: 100,
  },
  {
    id: 2,
    title: "帖子标题2",
    contentSnippet: "帖子内容摘要2...",
    author: "作者2",
    createdAt: "2024-01-02",
    views: 150,
  },
  {
    id: 3,
    title: "帖子标题3",
    contentSnippet: "帖子内容摘要3...",
    author: "作者3",
    createdAt: "2024-01-02",
    views: 200,
  },
  {
    id: 4,
    title: "帖子标题4",
    contentSnippet: "帖子内容摘要4...",
    author: "作者4",
    createdAt: "2024-01-02",
    views: 50,
  },
]);

const selectedTab = ref("popular"); // 默认显示热门文章

const sortedPosts = computed(() => {
  if (selectedTab.value === "latest") {
    return [...posts.value].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else {
    return [...posts.value].sort((a, b) => b.views - a.views);
  }
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};
</script>

<template>
  <el-card class="page-container">
    <!-- 切换按钮 -->
    <div class="button-group">
      <el-button
        :type="selectedTab === 'popular' ? 'primary' : 'default'"
        class="half-width-button no-border"
        @click="selectedTab = 'popular'"
        :style="{ backgroundColor: selectedTab === 'popular' ? '#E67762' : '' }"
      >
        热门文章
      </el-button>
      <el-button
        :type="selectedTab === 'latest' ? 'primary' : 'default'"
        class="half-width-button no-border"
        @click="selectedTab = 'latest'"
        :style="{ backgroundColor: selectedTab === 'latest' ? '#07c160' : '' }"
      >
        最新文章
      </el-button>
    </div>

    <!-- 主要内容区 -->
    <main class="main-content">
      <div class="posts-list">
        <!-- 帖子列表 -->
        <div v-for="post in sortedPosts" :key="post.id" class="post-item">
          <div class="cover-box">
            <img src="/src/assets/default.png" alt="封面" class="cover-image" />
          </div>
          <div class="post-content">
            <h2>{{ post.title }}</h2>
            <p>{{ post.contentSnippet }}</p>
            <div class="post-meta">
              <span>发布时间: {{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px;
  padding: 0;
  box-sizing: border-box;
}

.el-card {
  border-radius: 20px;
}

/* 按钮区域样式 */
.button-group {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.half-width-button {
  width: 50%;
  margin-left: 0;
  margin-right: 0;
  border: none;
  padding: 0;
}

.no-border {
  border: none;
}

.main-content {
  display: flex;
  flex: 1;
  padding: 0;
}

.posts-list {
  flex: 3;
  margin-right: 0;
}

.post-item {
  display: flex;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cover-box {
  width: 88px;
  height: 88px;
  margin-right: 1rem;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f0f0f0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  flex: 1;
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
  display: flex;
  gap: 1rem;
}
</style>
