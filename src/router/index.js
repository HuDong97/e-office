import { createRouter, createWebHistory } from 'vue-router'
import LoginVue from '@/views/Login.vue'
import LayoutVue from '@/views/Layout.vue'
import ArticleCategoryVue from '@/views/category/ArticleCategory.vue'
import ArticleManageVue from '@/views/article/ArticleManage.vue'
import UserAvatarVue from '@/views/user/UserAvatar.vue'
import UserInfoVue from '@/views/user/UserInfo.vue'
import UserResetEmailVue from '@/views/user/UserResetEmail.vue'
import UserResetPasswordVue from '@/views/user/UserResetPassword.vue'



// 定义路由关系
const routes = [
    { path: '/login', component: LoginVue },

    {
        path: '/', component: LayoutVue, redirect: '/article/manage', children: [

            { path: '/category', component: ArticleCategoryVue },
            { path: '/article/manage', component: ArticleManageVue },
            { path: '/user/info', component: UserInfoVue },
            { path: '/user/avatar', component: UserAvatarVue },
            { path: '/user/resetEmail', component: UserResetEmailVue },
            { path: '/user/resetPassword', component: UserResetPasswordVue }
        ]
    }
];

// 创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes
});

// 导出路由
export default router;
