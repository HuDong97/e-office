<script setup>
import { ref } from "vue";
import { Plus, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import avatar from "@/assets/default.png";

import useUserInfoStore from "@/stores/userInfo.js";
import { userAvatarUpdateService } from "@/api/user.js";

const userInfoStore = useUserInfoStore();

const imgUrl = ref(userInfoStore.info.userPic);
const defaultImgUrl = avatar;
const uploadRef = ref();
const avatarFile = ref(null); // 保存用户选择的文件

const handleError = (message) => {
  ElMessage.error(message);
};

const uploadSuccess = (result) => {
  if (result.code === 1) {
    // 判断 code 是否为 1
    imgUrl.value = result.data;
    userInfoStore.info.userPic = imgUrl.value;
    ElMessage.success("头像修改成功"); // 成功提示
  } else {
    const errorMessage =
      result.message && result.message.includes("Maximum upload size exceeded")
        ? "上传失败,文件大小超过限制,最大允许为500KB"
        : result.message || "上传失败";
    handleError(errorMessage);
  }
};

const handleChange = (file) => {
  avatarFile.value = file.raw; // 保存文件用于后续上传
  const reader = new FileReader();
  reader.onload = (e) => {
    imgUrl.value = e.target.result; // 本地预览图片
  };
  reader.readAsDataURL(file.raw);

  uploadRef.value.clearFiles(); // 清除文件列表
};

const selectImage = () => {
  uploadRef.value.$el.querySelector("input").click();
};

const submitUpload = async () => {
  if (!avatarFile.value) {
    return handleError("请先选择头像文件");
  }

  // 创建 FormData 并上传文件
  const formData = new FormData();
  formData.append("file", avatarFile.value);

  try {
    const result = await userAvatarUpdateService(formData);
    if (result.code === 1) {
      // 使用 code === 1 判断成功状态
      uploadSuccess(result); // 调用上传成功逻辑
    } else {
      handleError(result.message || "上传失败");
    }
  } catch (error) {
    handleError(error.message || "上传失败");
  }
};
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
        <el-upload
          ref="uploadRef"
          class="avatar-uploader"
          :show-file-list="false"
          :auto-upload="false"
          name="file"
          :on-change="handleChange"
        >
          <img v-if="imgUrl" :src="imgUrl" class="avatar" />
          <img v-else :src="defaultImgUrl" width="278" />
        </el-upload>
        <br />
        <el-button type="primary" :icon="Plus" size="large" @click="selectImage"
          >选择图片</el-button
        >
        <el-button
          type="success"
          :icon="Upload"
          size="large"
          @click="submitUpload"
          >确认上传</el-button
        >
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
