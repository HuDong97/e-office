<script setup>
import { Star, View, Sugar, ChatDotRound, Back } from "@element-plus/icons-vue";

import { ref, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import DOMPurify from "dompurify";
import { ElMessage, ElMessageBox } from "element-plus";
import { articleDetailService } from "@/api/article.js";
import {
  userBehaviorService,
  allUserBehavior,
  likesAddService,
  commentsAddService,
  favoritesAddService,
  viewsAddService,
  likesDeleteService,
  commentsDeleteService,
  favoritesDeleteService,
  getArticleComments,
  setCommentLikeService,
  cancelCommentLikeService,
  subsequentCommentsService,
} from "@/api/userBehavior.js";
import useUserInfoStore from "@/stores/userInfo.js";

const userInfoStore = useUserInfoStore();

const formatTimeUnit = (unit) => (unit < 10 ? `0${unit}` : unit);

const formatCommentDate = (dateString) => {
  const now = new Date();
  const commentDate = new Date(dateString);
  const diffInMs = now - commentDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else if (diffInDays < 7) {
    const hours = commentDate.getHours();
    const minutes = formatTimeUnit(commentDate.getMinutes());
    return `${diffInDays}天前 ${hours}:${minutes}`;
  } else if (now.getFullYear() === commentDate.getFullYear()) {
    return `${commentDate.getMonth() + 1}月${commentDate.getDate()}日`;
  } else {
    return `${commentDate.getFullYear()}年${
      commentDate.getMonth() + 1
    }月${commentDate.getDate()}日`;
  }
};

const route = useRoute();
const router = useRouter();
const article = reactive({
  id: null,
  title: "",
  content: "",
  coverImg: "",
  state: "",
  categoryId: null,
  createUser: null,
  createTime: "",
  updateTime: "",
});
const nickName = ref("");
const avatar = ref("");

const userBehavior = reactive({
  likesCount: 0,
  favoritesCount: 0,
  commentsCount: 0,
  viewsCount: 0,
  liked: false,
  bookmarked: false,
});

const sanitizedContent = ref("");
const commentsVisible = ref(false);
const newComment = ref("");
const comments = ref([]); // 新增评论数组

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const likeUserBehavior = async () => {
  try {
    if (userBehavior.liked) {
      await likesDeleteService(route.query.id);
      userBehavior.likesCount--;
      userBehavior.liked = false;
    } else {
      await likesAddService(route.query.id);
      userBehavior.likesCount++;
      userBehavior.liked = true;
    }
  } catch (error) {
    ElMessage.error("点赞操作失败");
  }
};

const toggleBookmark = async () => {
  try {
    if (userBehavior.bookmarked) {
      await favoritesDeleteService(route.query.id);
      userBehavior.favoritesCount--;
      userBehavior.bookmarked = false;
    } else {
      await favoritesAddService(route.query.id);
      userBehavior.favoritesCount++;
      userBehavior.bookmarked = true;
    }
  } catch (error) {
    ElMessage.error("收藏操作失败");
  }
};

const toggleComments = async () => {
  commentsVisible.value = !commentsVisible.value;
  if (commentsVisible.value) {
    await loadComments(); // 切换到评论区时加载评论数据
  }
};

const loadComments = async () => {
  try {
    const response = await getArticleComments(route.query.id); // 调用获取评论的方法
    comments.value = response.data; // 将获取到的评论数据赋值给 comments 数组
  } catch (error) {
    console.error("获取评论失败：", error);
  }
};

const submitComment = async () => {
  if (newComment.value.trim()) {
    try {
      await commentsAddService({
        articleId: route.query.id,
        content: newComment.value,
      });
      userBehavior.commentsCount++;
      newComment.value = "";
      ElMessage.success("评论成功");
      await loadComments(); // 添加评论成功后重新加载评论数据
    } catch (error) {
      ElMessage.error("评论失败");
    }
  } else {
    ElMessage.warning("评论内容不能为空");
  }
};

const deleteComment = async (commentId, userId) => {
  try {
    // 获取文章id
    const articleId = route.query.id;
    await commentsDeleteService(commentId, userId, articleId); // 发送删除评论的请求
    ElMessage.success("评论删除成功");
    userBehavior.commentsCount--; // 更新评论数
    await loadComments(); // 重新加载评论列表
  } catch (error) {
    ElMessage.error("评论删除失败");
  }
};

const confirmDelete = (commentId, userId) => {
  ElMessageBox.confirm("确定删除这条评论吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      deleteComment(commentId, userId);
    })
    .catch(() => {
      ElMessage.info("取消删除");
    });
};

onMounted(async () => {
  // 获取文章id
  const ArticleId = route.query.id;

  if (ArticleId) {
    try {
      const articleResponse = await articleDetailService(ArticleId);
      article.value = articleResponse.data;
      Object.assign(article, articleResponse.data.article); // 设置文章数据
      nickName.value = articleResponse.data.nickName; // 设置作者昵称
      avatar.value = articleResponse.data.avatar; // 设置作者头像

      sanitizedContent.value = DOMPurify.sanitize(article.content);

      const state = articleResponse.data.article.state;

      try {
        // 获取用户行为数据
        const behaviorResponse = await allUserBehavior(ArticleId);
        userBehavior.liked = behaviorResponse.data.liked === 1;
        userBehavior.bookmarked = behaviorResponse.data.bookmarked === 1;

        // 先向后端传入浏览+1
        await viewsAddService(ArticleId);

        // 最后加载浏览点赞收藏评论数
        const data = await userBehaviorService(ArticleId, state);
        userBehavior.likesCount = data.data.likesCount;
        userBehavior.commentsCount = data.data.commentsCount;
        userBehavior.viewsCount = data.data.viewsCount;
        userBehavior.favoritesCount = data.data.favoritesCount;

        // 加载评论数据
        await loadComments(); // 加载评论数据
      } catch (userBehaviorError) {
        console.error("获取用户行为数据失败：", userBehaviorError);
      }
    } catch (error) {
      console.error("查看文章或获取用户行为数据失败", error);
      router.push("/404");
    }
  } else {
    console.error("查看文章失败");
    router.push("/404");
  }
});

const goBack = () => {
  // 判断历史记录是否为空
  if (window.history.length > 1) {
    // 如果有历史记录，执行返回上一级操作
    router.back();
  } else {
    // 如果没有历史记录，关闭当前页面
    window.close();
  }
};

const handleKeydown = (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // 防止换行
    submitComment(); // 调用发送评论的方法
  }
};

const likeComment = async (comment) => {
  try {
    // 如果当前评论已经点赞
    if (comment.isLiked === 1) {
      // 取消点赞
      await cancelCommentLikeService(route.query.id, comment.id);
      comment.isLiked = 0; // 更新本地数据为未点赞
      comment.likeCount--; // 点赞数减一
    } else {
      // 点赞评论
      await setCommentLikeService(route.query.id, comment.id);
      comment.isLiked = 1; // 更新本地数据为已点赞
      comment.likeCount++; // 点赞数加一
    }
  } catch (error) {
    ElMessage.error("点赞操作失败");
  }
};
// 定义状态变量
let hasMore = true; // 是否还有更多数据
let isLoading = false; // 是否正在加载数据
// 滚动事件处理器
// 滚动事件处理器
const handleScroll = async (event) => {
  const target = event.target;
  const scrollTop = target.scrollTop; // 滚动条距离顶部的高度
  const clientHeight = target.clientHeight; // 可视区域高度
  const scrollHeight = target.scrollHeight; // 内容总高度

  // 判断是否接近底部（小于100像素）
  if (scrollTop + clientHeight > scrollHeight - 100) {
    // 防止重复加载
    if (isLoading || !hasMore) return;

    isLoading = true; // 设置为加载中

    try {
      const lastCommentId =
        comments.value[comments.value.length - 1]?.id || null; // 获取最后一条评论的ID
      console.log("参数", route.query.id, lastCommentId);

      const response = await subsequentCommentsService(
        route.query.id,
        lastCommentId
      );
      console.log("response", response);

      if (response.data.length > 0) {
        comments.value.push(...response.data); // 将新评论添加到现有评论数组
      } else {
        if (hasMore) {
          ElMessage.warning("没有更多评论了"); // 只提示一次
        }
        hasMore = false; // 设置没有更多数据
      }
    } catch (error) {
      console.error("加载更多评论失败：", error);
      ElMessage.error("加载更多评论失败");
    } finally {
      isLoading = false; // 重置加载状态
    }
  }
};
</script>

<template>
  <div v-if="article" class="article-container">
    <div class="article-header">
      <div class="title-and-back">
        <h1 class="article-title">{{ article.title }}</h1>
        <el-button
          type="primary"
          :icon="Back"
          @click="goBack"
          class="back-button"
          >返回</el-button
        >
      </div>
      <p
        class="article-meta"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >
        <span style="display: flex; align-items: center">
          <span class="article-date" style="margin-right: 10px"
            >发布时间：{{ formatDate(article.createTime) }}</span
          >
          <div style="margin-right: 10px">
            <img
              :src="
                avatar && avatar !== '' ? avatar : '/src/assets/default.png'
              "
              alt="作者头像"
              style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                object-fit: cover;
              "
            />
          </div>

          <span class="article-author" style="margin-right: 10px">{{
            nickName
          }}</span>
        </span>
        <span class="article-icons" style="display: flex; align-items: center">
          <el-tooltip content="浏览量" popper-class="custom-tooltip">
            <div style="font-size: 20px; margin-right: 15px">
              <View style="width: 1em; height: 1em; margin-right: 2px" />
              <span>{{ userBehavior.viewsCount }}</span>
            </div>
          </el-tooltip>

          <el-tooltip content="点赞" popper-class="custom-tooltip">
            <div
              style="font-size: 20px; margin-right: 15px"
              @click="likeUserBehavior"
              class="icon-heartbeat"
            >
              <Sugar
                :style="{
                  width: '1em',
                  height: '1em',
                  marginRight: '2px',
                  color: userBehavior.liked ? 'red' : '',
                }"
              />
              <span>{{ userBehavior.likesCount }}</span>
            </div>
          </el-tooltip>

          <el-tooltip content="收藏" popper-class="custom-tooltip">
            <div
              style="font-size: 20px; margin-right: 15px"
              @click="toggleBookmark"
              class="icon-heartbeat"
            >
              <Star
                :style="{
                  width: '1em',
                  height: '1em',
                  marginRight: '2px',
                  color: userBehavior.bookmarked ? '#FFC107' : '',
                }"
              />
              <span>{{ userBehavior.favoritesCount }}</span>
            </div>
          </el-tooltip>

          <el-tooltip content="评论" popper-class="custom-tooltip"
            ><div
              style="font-size: 20px"
              @click="toggleComments"
              class="icon-heartbeat"
            >
              <ChatDotRound
                style="width: 1em; height: 1em; margin-right: 2px"
              />
              <span>{{ userBehavior.commentsCount }}</span>
            </div></el-tooltip
          >
        </span>
      </p>
    </div>
    <div class="article-content" v-html="sanitizedContent"></div>
  </div>
  <div v-else class="loading-container">
    <el-loading-spinner size="120px"></el-loading-spinner>
  </div>
  <el-drawer
    v-model="commentsVisible"
    title="评论区"
    direction="rtl"
    size="30%"
  >
    <div class="comments-container">
      <!-- 评论内容区域 -->
      <div ref="commentsList" class="comments-list" @scroll="handleScroll">
        <div v-for="comment in comments" :key="comment.id" class="comment">
          <img
            :src="
              comment.avatar && comment.avatar !== ''
                ? comment.avatar
                : '/src/assets/default.png'
            "
            class="comment-avatar"
            alt="用户头像"
          />
          <div class="comment-content">
            <span class="comment-header">{{ comment.nickname }}</span>
            <div class="comment-bubble">
              <p class="comment-body">{{ comment.content }}</p>
            </div>
            <span class="comment-actions">
              <span class="comment-timestamp">{{
                formatCommentDate(comment.createdTime)
              }}</span>
              <div
                style="font-size: 15px; margin-left: auto"
                title="点赞"
                @click="likeComment(comment)"
              >
                <Sugar
                  :style="{
                    width: '1em',
                    height: '1em',
                    marginRight: '5px',
                    color: comment.isLiked === 1 ? 'red' : '',
                  }"
                />
                <span style="margin-right: 0px">{{ comment.likeCount }}</span>
              </div>
              <el-button
                v-if="comment.userId === userInfoStore.info.id"
                type="text"
                @click="confirmDelete(comment.id, comment.userId)"
                style="color: inherit; font-size: inherit; margin-left: 10px"
              >
                删除
              </el-button>
            </span>
          </div>
        </div>
      </div>

      <!-- 评论输入框 -->
      <div class="comment-input" style="margin-top: auto">
        <div class="input-container">
          <el-input
            type="textarea"
            v-model="newComment"
            placeholder="请输入你的评论"
            rows="1"
            :autosize="{ minRows: 1, maxRows: 6 }"
            class="input"
            @keydown="handleKeydown"
            style="max-height: 100px; overflow-y: auto"
          >
          </el-input>
          <el-button type="primary" @click="submitComment" class="send-button"
            >发送</el-button
          >
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
.comment {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}
.comments-list {
  overflow-y: auto;
  flex-grow: 1;
}

.comment-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-content {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.comment-header {
  font-weight: bold;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.comment-body {
  margin: 0;
  padding: 5;
  font-size: 0.85em;
  line-height: 1.4;
  color: #333;
  margin-bottom: 5px;
  word-wrap: break-word;
}

.comment-timestamp {
  font-size: 1.2em;
  color: #999;
}

.comment-bubble {
  background-color: #e6f7ff;
  padding: 10px;
  border-radius: 10px;
  display: inline-block;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 0.75em;
  color: #999;
}

.comment-actions span {
  margin-right: 10px;
}

.comment-actions .delete-button {
  color: #409eff;
  font-size: 0.8em;
}

.comment-actions .like-button {
  font-size: 0.8em;
}

.comment-author {
  font-weight: bold;
  margin-right: 5px;
}

.comments-section {
  overflow-y: auto;
  max-height: 75vh;
}

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
  width: 100%;
  max-width: 1200px;
  height: auto;
  min-height: 700px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Arial", sans-serif;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.article-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #ebebeb;
}

.title-and-back {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-title {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.back-button {
  margin-left: auto;
  border-radius: 20px;
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

.icon-heartbeat {
  display: inline-block;
  transition: transform 0.2s ease-in-out;
}

.icon-heartbeat :hover {
  animation: heartbeat 0.3s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.custom-tooltip {
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
