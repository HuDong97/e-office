<script setup>
import { ref } from 'vue'
import { userUpdateEmail } from '@/api/user.js';
import { ElMessage } from 'element-plus';
import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();



const reEmail = ref('');
const newEmail = ref('');


const updateEmail = async () => {
    try {
        // 调用 API 更新邮箱
        await userUpdateEmail({ re_Email: reEmail.value, new_Email: newEmail.value });
        // 成功后的处理，例如提示用户邮箱更新成功
        ElMessage.success('邮箱更新成功');
        // 清空输入框
        reEmail.value = '';
        newEmail.value = '';
    } catch (error) {
        // 处理更新失败的情况，例如提示用户邮箱更新失败
        ElMessage.error(error.message || '邮箱更新失败');
    }
};


// 获取邮箱地址
const email = userInfoStore.info.email;
// 分割邮箱地址，@前部分存储在username,@后部分存储在domain
const [username, domain] = email.split('@');
// 获取首位字符
const firstChar = username.charAt(0);
// 构建新的邮箱地址
const maskedEmail = firstChar + '****' + '@' + domain;



const rules = {

    newEmail: [
        { required: true, message: '请输入新邮箱', trigger: 'blur' },
        {
            pattern: /[A-Za-z0-9@.]+@(163\.com|qq\.com|gmail\.com|hotmail\.com)$/,
            message: '仅支持@163.com,@qq.com,@gmail.com,@hotmail.com',
            trigger: 'blur'
        }
    ],
    reEmail: [
        { required: true, message: '请输入当前邮箱', trigger: 'blur' },
        {
            pattern: /[A-Za-z0-9@.]+@(163\.com|qq\.com|gmail\.com|hotmail\.com)$/,
            message: '仅支持@163.com,@qq.com,@gmail.com,@hotmail.com',
            trigger: 'blur'
        }
    ]
}

</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>更换邮箱</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-form :model="{ reEmail, newEmail }" :rules="rules" label-width="100px" size="large">
                    <el-form-item label="当前邮箱" prop="reEmail">
                        <el-input v-model="maskedEmail" type="text" disabled></el-input>
                    </el-form-item>

                    <el-form-item label="确认邮箱" prop="reEmail">
                        <el-input v-model="reEmail" type="email"></el-input>
                    </el-form-item>
                    <el-form-item label="新邮箱" prop="newEmail">
                        <el-input v-model="newEmail" type="email"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="updateEmail">提交修改</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </el-card>
</template>