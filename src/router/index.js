import { createRouter, createWebHistory } from "vue-router";
import LoginVue from "@/views/Login.vue";
import LayoutVue from "@/views/Layout.vue";
import ArticleCategoryVue from "@/views/category/ArticleCategory.vue";
import ArticleManageVue from "@/views/article/ArticleManage.vue";
import ArticleDetail from "@/views/article/ArticleDetail.vue";
import UserAvatarVue from "@/views/user/UserAvatar.vue";
import UserInfoVue from "@/views/user/UserInfo.vue";
import UserResetEmailVue from "@/views/user/UserResetEmail.vue";
import UserResetPasswordVue from "@/views/user/UserResetPassword.vue";
import HomeVue from "@/views/Home.vue";
import Search from "@/views/SearchArticle.vue";
import ChatVue from "@/views/tools/Chat.vue";
import NotFound from "@/views/404/NotFound.vue";

import useUserInfoStore from "@/stores/userInfo.js";

// 定义路由关系
const routes = [
  { path: "/login", component: LoginVue },
  { path: "/home", component: HomeVue },
  { path: "/search", component: Search },
  {
    path: "/",
    component: LayoutVue,
    redirect: "/home",
    children: [
      { path: "/chat", component: ChatVue },
      { path: "/category", component: ArticleCategoryVue },
      { path: "/article/manage", component: ArticleManageVue },
      { path: "/article/detail", component: ArticleDetail },
      { path: "/user/info", component: UserInfoVue },
      { path: "/user/avatar", component: UserAvatarVue },
      { path: "/user/resetEmail", component: UserResetEmailVue },
      { path: "/user/resetPassword", component: UserResetPasswordVue },
      { path: "/404", component: NotFound },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/404" },
];

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const userInfoStore = useUserInfoStore();
  if (to.path === "/category" && userInfoStore.info.permissions !== "admin") {
    next("/404"); // 重定向到404
  } else {
    next(); // 允许访问
  }
});

// 导出路由
export default router;
