import { createRouter, createWebHistory } from 'vue-router'
import LoginVue from '@/views/Login.vue'
import LayoutVue from '@/views/Layout.vue'
import ArticleCategoryVue from '@/views/category/ArticleCategory.vue'
import ArticleManageVue from '@/views/article/ArticleManage.vue'
import UserAvatarVue from '@/views/user/UserAvatar.vue'
import UserInfoVue from '@/views/user/UserInfo.vue'
import UserResetEmailVue from '@/views/user/UserResetEmail.vue'
import UserResetPasswordVue from '@/views/user/UserResetPassword.vue'
import HomeVue from '@/views/home/Home.vue'
import ToolsVue from '@/views/tools/Tools.vue'
import NotFound from '@/views/404/NotFound.vue'


// 定义路由关系
const routes = [
    { path: '/login', component: LoginVue },
    {
        path: '/', component: LayoutVue, redirect: '/home', children: [
            { path: '/tools', component: ToolsVue },
            { path: '/home', component: HomeVue },
            { path: '/category', component: ArticleCategoryVue },
            { path: '/article/manage', component: ArticleManageVue },
            { path: '/user/info', component: UserInfoVue },
            { path: '/user/avatar', component: UserAvatarVue },
            { path: '/user/resetEmail', component: UserResetEmailVue },
            { path: '/user/resetPassword', component: UserResetPasswordVue },
            { path: '/404', component: NotFound },
        ]
    },

    { path: '/:pathMatch(.*)*', redirect: '/404' }
];

// 创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes
});



// 导出路由
export default router;
