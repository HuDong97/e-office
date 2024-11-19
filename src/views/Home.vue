<script setup>
import {
  Management,
  MagicStick,
  House,
  Promotion,
  UserFilled,
  User,
  Crop,
  EditPen,
  SwitchButton,
  Message,
  Menu as MenuIcon,
} from "@element-plus/icons-vue";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { getLatestArticlesService } from "@/api/article.js";
import { useRouter } from "vue-router";

import { throttle } from "lodash";

import avatar from "@/assets/default.png";

import { useTokenStore } from "@/stores/token.js";
import { userInfoService, userLogoutService } from "@/api/user.js";
import useUserInfoStore from "@/stores/userInfo.js";

import { ElMessage, ElMessageBox } from "element-plus";

// 计算顶部导航栏的宽度，减去侧边栏宽度
const headerWidth = computed(() => {
  return isSidebarVisible.value
    ? `calc(100vw - ${sidebarWidth.value})`
    : `calc(100vw - 55px)`;
});

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

const isSidebarVisible = ref(true);

// 计算侧边栏宽度
const sidebarWidth = computed(() => (isSidebarVisible.value ? "200px" : "0"));

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

// 获取用户信息，并根据权限控制路由跳转.
const getUserInfo = async () => {
  let result = await userInfoService();
  userInfoStore.setInfo(result.data);
};
getUserInfo();

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm("您确认要退出吗?", "温馨提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });

    const currentToken = tokenStore.getToken(); // 获取当前的token
    await userLogoutService(currentToken); // 调用后端的注销接口删除redis里面的token缓存
    tokenStore.removeToken();
    userInfoStore.removeInfo();
    router.push("/login");
    ElMessage({
      type: "success",
      message: "退出登录成功",
    });
  } catch (error) {
    ElMessage({
      type: "info",
      message: "用户取消了退出登录",
    });
  }
};

const handleCommand = (command) => {
  if (command === "logout") {
    handleLogout();
  } else {
    router.push("/user/" + command);
  }
};

// 存储最新文章数据
const posts = ref([]);
// 存储热门文章模拟数据
const popularPosts = ref([
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
// 控制返回顶部按钮的显示与隐藏

const showBackToTop = ref(false);

let scrollCount = 0; // 滚动次数

// 获取最新文章列表并更新 posts
onMounted(async () => {
  try {
    const response = await getLatestArticlesService(); // 获取最新文章接口
    if (response.data && response.data.length > 0) {
      posts.value = response.data;
    }
  } catch (error) {
    console.error("获取最新文章失败:", error);
  }
});

// 切换选项的逻辑
const selectedTab = ref("latest"); // 默认显示最新文章

// 格式化日期
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("zh-CN"); // 使用本地日期格式
};

// 计算属性，返回当前选中的文章数据
const sortedPosts = computed(() => {
  return selectedTab.value === "latest" ? posts.value : popularPosts.value;
});

// 截取文章内容并加上省略号
const truncateContent = (content, limit = 10) => {
  if (content && content.length > limit) {
    return content.slice(0, limit) + "...";
  }
  return content;
};

// 使用 vue-router 的路由推送进行页面跳转
const router = useRouter();
const goToArticleDetail = (id) => {
  router.push({ path: "/article/detail", query: { id: id } });
};

// 加载更多数据的逻辑
let currentPostIndex = 0;

// 滚动事件控制显示弹窗和加载更多数据
const handleScroll = throttle((event) => {
  event.preventDefault(); // 阻止默认滚动行为
  // 判断滚动方向，只有向下滚动才加载文章

  if (event.deltaY <= 0) return; // 向上滚动时不执行任何操作

  // 记录滚动次数

  scrollCount++;

  // 当滚动偏移量超出可视窗口高度时显示返回顶部按钮
  showBackToTop.value = window.scrollY > window.innerHeight;

  // 获取所有 el-card 元素的总高度
  const cards = document.querySelectorAll(".el-card .post-item");
  const totalHeight = Array.from(cards).reduce(
    (acc, card) => acc + card.offsetHeight,
    0
  );

  // 页面内容区的滚动偏移量+可视窗口高度
  const scrollPosition = window.scrollY + window.innerHeight;

  // 判断是否滚动到 `el-card` 元素的总高度，加载更多文章
  if (
    scrollPosition >= totalHeight - 50 &&
    currentPostIndex < posts.value.length
  ) {
    const nextPost = posts.value[currentPostIndex];
    sortedPosts.value.push(nextPost); // 添加新的文章到列表
    currentPostIndex++; // 更新索引

    ElMessage({
      message: `加载新文章...`,
      type: "info",
    });

    // 手动让页面滚动到底部
  }
}, 200); // 设置为 200 毫秒触发一次

// 绑定滚动事件
onMounted(() => {
  window.addEventListener("wheel", handleScroll, { passive: false }); // passive: false 确保可以调用 preventDefault
  window.addEventListener("scroll", handleScroll, { passive: true }); // 添加 scroll 事件
});

// 移除滚动事件
onBeforeUnmount(() => {
  window.removeEventListener("wheel", handleScroll);
  window.removeEventListener("scroll", handleScroll); // 移除 scroll 事件
});

const scrollToTop = () => {
  // 触发滚动到 topAnchor 锚点的位置
  const topAnchor = document.getElementById("topAnchor");
  if (topAnchor) {
    topAnchor.scrollIntoView({ behavior: "smooth" }); // 平滑滚动到 topAnchor 元素位置
  }

  // 隐藏返回顶部按钮
  showBackToTop.value = false;

  // 清空滚动次数
  scrollCount = 0;

  // 重置加载更多数据的索引
  currentPostIndex = 0;
};
</script>
<template>
  <div id="topAnchor" ref="faultTree" class="wrap">
    <a
      id="TOPUp"
      href="#topAnchor"
      v-if="showBackToTop"
      @click.prevent="scrollToTop"
    >
      <img
        style="width: 100%; height: 100%"
        src="/src/assets/top.png"
        alt="返回顶部"
      />
    </a>
  </div>

  <div>
    <el-header :style="{ width: headerWidth }">
      <div>
        当前用户：<strong>{{ userInfoStore.info.nickname }}</strong>
      </div>
      <el-dropdown placement="bottom-end" @command="handleCommand">
        <span class="el-dropdown__box">
          <el-avatar
            :src="
              userInfoStore.info.userPic ? userInfoStore.info.userPic : avatar
            "
          />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="info" :icon="User"
              >基本资料</el-dropdown-item
            >
            <el-dropdown-item command="avatar" :icon="Crop"
              >更换头像</el-dropdown-item
            >
            <el-dropdown-item command="resetPassword" :icon="EditPen"
              >重置密码</el-dropdown-item
            >
            <el-dropdown-item command="resetEmail" :icon="Message"
              >更换邮箱</el-dropdown-item
            >
            <el-dropdown-item command="logout" :icon="SwitchButton"
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <el-aside
      :class="{
        'sidebar-hidden': !isSidebarVisible,
        'disable-scroll': isSidebarVisible,
      }"
      class="sidebar-transition"
      :style="{ width: sidebarWidth }"
    >
      <div>
        <el-button class="toggle-sidebar-button1">
          <el-icon
            @click="toggleSidebar"
            plain
            class="toggle-sidebar-menu1"
            style="font-size: 25px"
          >
            <MenuIcon />
          </el-icon>
        </el-button>
      </div>
      <el-menu
        active-text-color=" #ffd04b"
        background-color="#232323"
        text-color="#fff"
        router
      >
        <a class="sidebar-logo" @click="router.push('/home')">Eoffice</a>
        <el-menu-item index="/home">
          <el-icon>
            <House />
          </el-icon>
          <span>论坛首页</span>
        </el-menu-item>
        <template v-if="userInfoStore.info.permissions === 'admin'">
          <el-menu-item index="/category">
            <el-icon>
              <Management />
            </el-icon>
            <span>文章分类</span>
          </el-menu-item>
        </template>
        <el-menu-item index="/article/manage">
          <el-icon>
            <Promotion />
          </el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/chat">
          <el-icon>
            <MagicStick />
          </el-icon>
          <span>Ai助手</span>
        </el-menu-item>

        <el-sub-menu>
          <template #title>
            <el-icon>
              <UserFilled />
            </el-icon>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/user/info">
            <el-icon>
              <User />
            </el-icon>
            <span>基本资料</span>
          </el-menu-item>
          <el-menu-item index="/user/avatar">
            <el-icon>
              <Crop />
            </el-icon>
            <span>更换头像</span>
          </el-menu-item>
          <el-menu-item index="/user/resetPassword">
            <el-icon>
              <EditPen />
            </el-icon>
            <span>重置密码</span>
          </el-menu-item>
          <el-menu-item index="/user/resetEmail">
            <el-icon>
              <Message />
            </el-icon>
            <span>更换邮箱</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-button
      v-show="!isSidebarVisible"
      @click="toggleSidebar"
      plain
      class="toggle-sidebar-button"
    >
      <el-icon class="toggle-sidebar-menu" style="font-size: 25px">
        <MenuIcon />
      </el-icon>
    </el-button>
  </div>

  <el-card class="page-container">
    <!-- 切换按钮 -->
    <div class="button-group">
      <el-button
        :type="selectedTab === 'popular' ? 'primary' : 'default'"
        class="half-width-button no-border"
        @click="selectedTab = 'popular'"
        :style="{
          backgroundColor: selectedTab === 'popular' ? '#E67762' : '',
        }"
      >
        热门文章
      </el-button>
      <el-button
        :type="selectedTab === 'latest' ? 'primary' : 'default'"
        class="half-width-button no-border"
        @click="selectedTab = 'latest'"
        :style="{
          backgroundColor: selectedTab === 'latest' ? '#07c160' : '',
        }"
      >
        最新文章
      </el-button>
    </div>

    <!-- 主要内容区 -->
    <main class="main-content">
      <div class="posts-list">
        <!-- 帖子列表 -->
        <div
          v-for="post in sortedPosts"
          :key="post.id"
          class="post-item"
          @click="goToArticleDetail(post.id)"
        >
          <div class="cover-box">
            <img
              :src="post.coverImg || '/src/assets/default.png'"
              alt="封面"
              class="cover-image"
            />
          </div>
          <div class="post-content">
            <h2>{{ post.title }}</h2>

            <!-- 使用 truncateContent 来截取文章内容 -->
            <div
              v-html="truncateContent(post.contentSnippet || post.content)"
            ></div>
            <div class="post-meta">
              <span
                >发布时间:
                {{ formatDate(post.createTime || post.createdAt) }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </main>
  </el-card>
</template>

<style lang="scss" scoped>
.el-header {
  position: fixed;
  z-index: 0;
  top: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100vw - 200px);
  padding: 10px;
  .el-dropdown__box {
    display: flex;
    align-items: center;

    .el-icon {
      color: #fff;
      margin-left: 10px;
    }

    &:active,
    &:focus {
      outline: none;
    }
  }
}
.el-header > div {
  margin-left: 10px;
}
.el-avatar {
  margin-right: 10px;
}

.el-aside {
  background-color: #232323;
  transition: width 0.3s;

  .el-menu {
    border-right: none;
  }
}

#topAnchor {
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

#TOPUp {
  position: fixed;
  right: 45px;
  bottom: 100px;
  width: 40px;
  height: 40px;
  z-index: 999;
  box-shadow: 0px 0px 4px 4px #ecefef;
  border-radius: 600px;
}

.page-container {
  margin: 0 auto;
  border-radius: 20px;
  padding: 0;
  z-index: 10;
  box-sizing: border-box;
  margin-top: 100px;
}

.el-card {
  border-radius: 20px;
}

.button-group {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.half-width-button,
.no-border {
  border: none;
  padding: 0;
  width: 50%;
}

.button-group .half-width-button {
  margin: 0;
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
  transition: background-color 0.3s ease;
}

.post-item:hover {
  background-color: #f7f7f7;
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

.sidebar-hidden,
.disable-scroll {
  overflow: hidden;
}

.sidebar-logo {
  position: absolute;
  top: -29px;
  left: 52px;

  font-family: Arial, sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #ffffff;
  text-transform: none;
  letter-spacing: normal;
  line-height: normal;
}

.toggle-sidebar-button1 {
  width: 50px;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 0;
}

.toggle-sidebar-button {
  position: fixed;
  width: 50px;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 0;
  top: 1px;
  left: 1px;
}

.toggle-sidebar-menu1 {
  color: #ffffff;
}

.toggle-sidebar-menu {
  color: #000000;
}

.sidebar-transition {
  width: 200px;
  transition: width 0.3s;
  position: fixed;
  z-index: 10;
  top: 0px;
  left: 0;
  height: 100vh;
  background-color: #232323;
}

.layout-container {
  height: 100vh;
  overflow: hidden;
}
</style>
