<script setup>
import {
    Management,
    Tools,
    House,
    Promotion,
    UserFilled,
    User,
    Crop,
    EditPen,
    SwitchButton,
    CaretBottom,
    Message,
    Menu as MenuIcon
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'

import { ref, computed } from 'vue'
import { useTokenStore } from '@/stores/token.js'
import { userInfoService, userLogoutService } from '@/api/user.js'
import useUserInfoStore from '@/stores/userInfo.js'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
const router = useRouter();

const isSidebarVisible = ref(true)

// 计算侧边栏宽度
const sidebarWidth = computed(() => isSidebarVisible.value ? '200px' : '0')

const toggleSidebar = () => {
    isSidebarVisible.value = !isSidebarVisible.value
};

// 获取用户信息，并根据权限控制路由跳转
const getUserInfo = async () => {
    let result = await userInfoService();
    userInfoStore.setInfo(result.data);
};
getUserInfo();

const handleLogout = async () => {
    try {
        await ElMessageBox.confirm(
            '您确认要退出吗?',
            '温馨提示',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        const currentToken = tokenStore.getToken(); // 获取当前的token
        await userLogoutService(currentToken); // 调用后端的注销接口删除redis里面的token缓存
        console.log('向后端传递信息完毕', currentToken);
        tokenStore.removeToken();
        userInfoStore.removeInfo();
        router.push('/login');
        ElMessage({
            type: 'success',
            message: '退出登录成功',
        });
    } catch (error) {
        ElMessage({
            type: 'info',
            message: '用户取消了退出登录',
        });
    }
}

const handleCommand = (command) => {
    if (command === 'logout') {
        handleLogout();
    } else {
        router.push('/user/' + command);
    }
}
</script>

<template>
    <el-container class="layout-container">
        <el-aside width="200px" class="sidebar-transition" :style="{ width: sidebarWidth }">

            <div>
                <el-button @click="toggleSidebar" plain class="toggle-sidebar-button1">
                    <el-icon class="toggle-sidebar-menu1" style="font-size: 25px;">
                        <MenuIcon />
                    </el-icon>
                </el-button>
                <a class="sidebar-logo">Eoffice</a>

            </div>
            <el-menu active-text-color=" #ffd04b" background-color="#232323" text-color="#fff" router>
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
                        <Tools />
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
        <el-button v-show="!isSidebarVisible" @click="toggleSidebar" plain class="toggle-sidebar-button">
            <el-icon class="toggle-sidebar-menu" style="font-size: 25px;">
                <MenuIcon />
            </el-icon>
        </el-button>
        <el-container>
            <el-header class="el-header1">
                <div>当前用户：<strong>{{ userInfoStore.info.nickname }}</strong></div>
                <el-dropdown placement="bottom-end" @command="handleCommand">
                    <span class="el-dropdown__box">
                        <el-avatar :src="userInfoStore.info.userPic ? userInfoStore.info.userPic : avatar" />
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="info" :icon="User">基本资料</el-dropdown-item>
                            <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
                            <el-dropdown-item command="resetPassword" :icon="EditPen">重置密码</el-dropdown-item>
                            <el-dropdown-item command="resetEmail" :icon="Message">更换邮箱</el-dropdown-item>
                            <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <el-main>
                <router-view></router-view>
            </el-main>
            <el-footer>
                <img src="@/assets/logodong.png" alt="Eoffice Logo" style="height: 16px; margin-right: 2px;">
                Eoffice ©2024 Created by 行东
            </el-footer>
        </el-container>
    </el-container>
</template>

<style lang="scss" scoped>
.el-header1 {
    border-radius: 10px;
}

.sidebar-logo {
    position: absolute;
    /* 使用绝对定位 */
    top: 1px;
    left: 50px;
    font-size: 24px;
    color: #ffffff;
}


.toggle-sidebar-button1 {
    width: 50px;
    background-color: transparent;
    border: 1px solid transparent;
    padding: 0;

}

.toggle-sidebar-button {
    width: 50px;
    background-color: transparent;
    border: 1px solid transparent;
    padding: 0;

}

.toggle-sidebar-menu1 {
    color: #ffffff;

}

.toggle-sidebar-menu {
    color: #000000;

}



.layout-container {
    height: 100vh;
    overflow: hidden;

    .el-aside {
        background-color: #232323;
        transition: width 0.3s;

        .el-menu {
            border-right: none;
        }
    }

    .el-header {
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .el-dropdown__box {
            display: flex;
            align-items: center;

            .el-icon {
                color: #999;
                margin-left: 10px;
            }

            &:active,
            &:focus {
                outline: none;
            }
        }
    }

    .el-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #666;
    }


    .sidebar-transition {
        width: 200px;
        transition: width 0.3s;
    }
}
</style>
