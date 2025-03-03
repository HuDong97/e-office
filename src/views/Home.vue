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
  Search,
  Menu as MenuIcon,
} from "@element-plus/icons-vue";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import {
  getLatestArticlesService,
  getNextArticlesService,
  getHotArticlesService,
} from "@/api/article.js";
import { useRouter } from "vue-router";

import { throttle } from "lodash";

import avatar from "@/assets/default.png";

import { useTokenStore } from "@/stores/token.js";
import { userInfoService, userLogoutService } from "@/api/user.js";
import useUserInfoStore from "@/stores/userInfo.js";

import { ElMessage, ElMessageBox } from "element-plus";

const keyword = ref(""); // 用于绑定搜索框内容

const handleSearch = () => {
  if (keyword.value) {
    // 跳转到 /search 页面并携带搜索关键词作为查询参数
    router.push({ path: "/search", query: { keyword: keyword.value } });
  } else {
    console.log("请输入搜索关键词");
  }
};

const noMoreArticles = ref(false); // 用来标记是否已经没有更多文章

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

// 存储热门文章数据
const popularPosts = ref([]);
// 控制返回顶部按钮的显示与隐藏

const showBackToTop = ref(false);

// 获取最新文章列表和热门文章列表并更新 posts和popularPosts
onMounted(async () => {
  try {
    // 调用获取热门文章的接口
    const response = await getHotArticlesService();
    if (response.data && response.data.length > 0) {
      popularPosts.value = response.data;
    } else {
      ElMessage.warning("网络波动,请刷新");
    }
  } catch (error) {
    console.error("获取热门文章失败:", error);
  }

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
const selectedTab = ref("popular"); // 默认显示热点文章

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
  // 直接在新标签页打开文章详情页
  window.open(`/article/detail?id=${id}`, "_blank");
};

// 滚动事件控制显示弹窗和加载更多数据
const handleScroll = throttle(async (event) => {
  event.preventDefault(); // 阻止默认滚动行为

  // 获取当前滚动位置（即：页面的垂直偏移量）
  const scrollPosition = window.scrollY + window.innerHeight;

  // 获取页面的总高度
  const documentHeight = document.documentElement.scrollHeight;

  // 当滚动偏移量超出可视窗口高度时显示返回顶部按钮
  showBackToTop.value = window.scrollY > window.innerHeight;

  // 向下滑动时，则隐藏侧边栏
  if (window.scrollY > 10) {
    isSidebarVisible.value = false;
  }

  // 判断当页面滚动到顶部时，显示侧边栏
  if (window.scrollY < 10) {
    isSidebarVisible.value = true;
  }

  if (event.deltaY <= 0) return; // 向上滚动时不执行任何操作

  function displayArticle() {}

  // 根据 Tab 类型控制加载逻辑
  if (selectedTab.value === "latest") {
    // 判断是否滚动到底部，给一个容差值，比如300px
    if (documentHeight - scrollPosition <= 400 && !noMoreArticles.value) {
      const lastArticle = posts.value[posts.value.length - 1];
      const lastArticleId = lastArticle ? lastArticle.id : null;

      try {
        // 调用后续文章的接口，接口返回4篇文章
        const response = await getNextArticlesService(lastArticleId);

        if (response.data && response.data.length > 0) {
          // 将返回的4篇文章追加到列表中
          posts.value.push(...response.data);

          // 启动逐条显示的逻辑
          let currentIndex = posts.value.length - 4; // 设定当前显示文章的起始索引
          const interval = setInterval(() => {
            if (currentIndex < posts.value.length) {
              // 在前端逐条显示文章
              displayArticle(posts.value[currentIndex]);
              currentIndex++;
            } else {
              clearInterval(interval); // 所有文章显示完后清除定时器
            }
          }, 500); // 每隔500ms显示一篇文章
        } else {
          // 当页面滚动到底部时显示没有更多文章
          noMoreArticles.value = true; // 没有更多文章
          ElMessage({
            message: `没有更多文章了`,
            type: "warning",
          });
        }
      } catch (error) {
        console.error("获取后续文章失败:", error);
        noMoreArticles.value = true;
      }
    }
  }
}, 300); // 设置为 300 毫秒触发一次

// 监听滚动事件
window.addEventListener("scroll", handleScroll);

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
};

const handleLogoClick = () => {
  scrollToTop(); // 返回顶部
  router.push("/home"); // 跳转到首页
};

const handleForumClick = () => {
  scrollToTop(); // 返回顶部
  router.push("/home"); // 跳转到论坛首页
};
</script>

<template>
  <div id="topAnchor" ref="faultTree" class="wrap">
    <a
      id="TOPUp"
      v-if="showBackToTop"
      @click.prevent="scrollToTop"
      style="cursor: pointer"
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

      <!-- 搜索框和按钮 -->
      <div>
        <el-input
          v-model="keyword"
          placeholder="搜索文章"
          class="search-input"
          clearable
          @keydown.enter="handleSearch"
        ></el-input>
        <el-button
          @click="handleSearch"
          class="search-button"
          :icon="Search"
          type="primary"
        >
          搜索
        </el-button>
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
        <a class="sidebar-logo" @click.prevent="handleLogoClick">Eoffice</a>
        <el-menu-item index="/home" @click.native="handleForumClick">
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
          backgroundColor: selectedTab === 'popular' ? '#e9464d' : '',
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
  .search-input {
    margin-left: -250px;
    width: 350px;
  }
}

.search-button {
  margin-left: 20px;
  justify-content: center;
}

.el-header > div {
  margin-left: 25px;
}
.el-avatar {
  margin-right: -5px;
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
  min-height: 1750px;
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
