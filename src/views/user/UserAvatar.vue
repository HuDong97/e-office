<script setup>
import { Plus, Refresh, Upload } from '@element-plus/icons-vue'
import { ref } from 'vue'
import avatar from '@/assets/default.png'
const uploadRef = ref()

import { useTokenStore } from '@/stores/token.js'
const tokenStore = useTokenStore();

//导入 Element Plus 组件库中的消息提示组件
import { ElMessage } from 'element-plus'

import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();

//用户头像地址
const imgUrl = ref(userInfoStore.info.userPic)
//用户默认头像地址
const defaultImgUrl = avatar


//头像上传服务器成功的回调函数
const uploadSuccess = (result) => {
    if (result.code === 0) {
        imgUrl.value = result.data;
        console.log(result.data);
        // 上传成功后调用更新数据库头像的函数
        updateAvatar();
    } else {
        // 上传失败，检查错误信息并显示相应提示
        if (result.message && result.message.includes('Maximum upload size exceeded')) {
            ElMessage.error('上传失败,文件大小超过限制,最大允许为500KB');
        } else {
            ElMessage.error(result.message ? result.message : '上传失败');
        }
    }
}

import { userAvatarUpdateService } from '@/api/user.js'
//获取数据库头像链接进行头像修改

const updateAvatar = async () => {
    //调用接口
    let result = await userAvatarUpdateService(imgUrl.value);
    ElMessage.success(result.message ? result.message : '修改成功')
    //修改pinia中的数据
    userInfoStore.info.userPic = imgUrl.value

}

const handleChange = (file, fileList) => {
    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
        imgUrl.value = e.target.result;
    };
    reader.readAsDataURL(file.raw);
    // 清空上传队列
    uploadRef.value.clearFiles();
    // 手动将当前文件添加到队列
    uploadRef.value.handleStart(file.raw);
}

const selectImage = () => {
    uploadRef.value.$el.querySelector('input').click();
}

const submitUpload = () => {
    // 提交上传
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
                <el-button type="primary" icon="el-icon-plus" size="large" @click="selectImage">选择图片</el-button>
                <el-button type="success" icon="el-icon-upload" size="large" @click="submitUpload">确认上传</el-button>
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
