<script setup>
import { ref } from 'vue'
import { userUpdatePassword } from '@/api/user.js';
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTokenStore } from '@/stores/token.js'
import useUserInfoStore from '@/stores/userInfo.js'
import { useRouter } from 'vue-router'
const oldPwd = ref('');
const newPwd = ref('');
const rePwd = ref('');
const router = useRouter();
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

const updatePassword = async () => {
    try {
        // 调用 API 更新密码
        await userUpdatePassword({ old_pwd: oldPwd.value, new_pwd: newPwd.value, re_pwd: rePwd.value });
        // 成功后的处理，例如提示用户密码更新成功
        ElMessage.success('密码更新成功,请重新登录');

        // 清空输入框
        oldPwd.value = '';
        newPwd.value = '';
        rePwd.value = '';
        handleCommand();
    } catch (error) {
        // 处理更新失败的情况，例如提示用户密码更新失败
        ElMessage.error(errorMessage);
    }
};


const rules = {
    oldPwd: [
        { required: true, message: '请输入旧密码', trigger: 'blur' },
        {
            pattern: /^[0-9A-Za-z@#$%]{5,16}$/,
            message: '密码长度必须在5到16位之间,仅支持数字、英文大小写字母以及@#$%',
            trigger: 'blur'
        }
    ],
    newPwd: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        {
            pattern: /^[0-9A-Za-z@#$%]{5,16}$/,
            message: '密码长度必须在5到16位之间,仅支持数字、英文大小写字母以及@#$%',
            trigger: 'blur'
        }
    ],
    rePwd: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== rePwd.value) {
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
}



const handleCommand = () => {
    //退出登录
    ElMessageBox.confirm(
        '密码修改成功请重新登录!',
        '退出登录提醒',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            //退出登录
            //1.清空pinia中存储的token以及个人信息
            tokenStore.removeToken()
            userInfoStore.removeInfo()

            //2.跳转到登录页面
            router.push('/login')
            ElMessage({
                type: 'success',
                message: '退出登录成功',
            })

        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '用户取消了退出登录',
            })
        })
}



</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>修改密码</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-form :model="{ oldPwd, newPwd, rePwd }" :rules="rules" label-width="100px" size="large">
                    <el-form-item label="原密码" prop="oldPwd">
                        <el-input v-model="oldPwd" type="password"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPwd">
                        <el-input v-model="newPwd" type="password"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="rePwd">
                        <el-input v-model="rePwd" type="password"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updatePassword">提交修改</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </el-card>
</template>
