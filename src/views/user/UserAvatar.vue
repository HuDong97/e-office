<script setup>
import { ref } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import avatar from '@/assets/default.png'

import { useTokenStore } from '@/stores/token.js'
import useUserInfoStore from '@/stores/userInfo.js'
import { userAvatarUpdateService } from '@/api/user.js'

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

// 用户头像地址
const imgUrl = ref(userInfoStore.info.userPic)
const defaultImgUrl = avatar

const uploadRef = ref()
const isPreviewing = ref(false)

// 头像上传服务器成功的回调函数
const uploadSuccess = (result) => {
    if (result.code === 0) {
        imgUrl.value = result.data;
        updateAvatar();
    } else {
        if (result.message && result.message.includes('Maximum upload size exceeded')) {
            ElMessage.error('上传失败,文件大小超过限制,最大允许为500KB');
        } else {
            ElMessage.error(result.message ? result.message : '上传失败');
        }
    }
}

// 更新用户头像
const updateAvatar = async () => {
    let result = await userAvatarUpdateService(imgUrl.value);
    ElMessage.success(result.message ? result.message : '修改成功')
    userInfoStore.info.userPic = imgUrl.value
}

// 处理图片上传变化
const handleChange = (file) => {
    if (isPreviewing.value) {
        isPreviewing.value = false;
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imgUrl.value = e.target.result;
    };
    reader.readAsDataURL(file.raw);

    isPreviewing.value = true;
    uploadRef.value.clearFiles();
    uploadRef.value.handleStart(file.raw);
}

// 选择图片
const selectImage = () => {
    uploadRef.value.$el.querySelector('input').click();
}

// 提交上传
const submitUpload = () => {
    uploadRef.value.submit();
}
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>更换头像</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-upload ref="uploadRef" class="avatar-uploader" :show-file-list="false" :auto-upload="false"
                    action="/api/uploadFile/uploadPicture" name="file" :headers="{ 'Authorization': tokenStore.token }"
                    :on-change="handleChange" :on-success="uploadSuccess">
                    <img v-if="imgUrl" :src="imgUrl" class="avatar" />
                    <img v-else :src="defaultImgUrl" width="278" />
                </el-upload>
                <br />
                <el-button type="primary" :icon="Plus" size="large" @click="selectImage">选择图片</el-button>
                <el-button type="success" :icon="Upload" size="large" @click="submitUpload">确认上传</el-button>
            </el-col>
        </el-row>
    </el-card>
</template>

<style lang="scss" scoped>
.avatar-uploader {
    :deep() {
        .avatar {
            width: 278px;
            height: 278px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 278px;
            height: 278px;
            text-align: center;
        }
    }
}
</style>
