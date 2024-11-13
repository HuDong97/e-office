<script setup>
import { ref } from "vue";
import useUserInfoStore from "@/stores/userInfo.js";
const userInfoStore = useUserInfoStore();

const userInfo = ref({ ...userInfoStore.info });
const rules = {
  nickname: [
    { required: true, message: "请输入用户昵称", trigger: "blur" },
    {
      pattern: /^\S{2,10}$/,
      message: "昵称必须是2-10位的非空字符串",
      trigger: "blur",
    },
  ],
};

//修改个人信息昵称
import { userNicknameUpdateService } from "@/api/user.js";
import { ElMessage } from "element-plus";

const updateNickname = async () => {
  try {
    let result = await userNicknameUpdateService(userInfo.value.nickname);
    ElMessage.success(result.message);

    // 修改pinia中的个人信息
    userInfoStore.setInfo({
      ...userInfoStore.info,
      nickname: userInfo.value.nickname,
    });
  } catch (error) {
    ElMessage.error(errorMessage);
  }
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>基本资料</span>
      </div>
    </template>
    <el-row>
      <el-col :span="12">
        <el-form
          :model="userInfo"
          :rules="rules"
          label-width="100px"
          size="large"
        >
          <el-form-item label="用户名">
            <el-input v-model="userInfo.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="userInfo.nickname"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateNickname"
              >提交修改</el-button
            >
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px;
  padding: 2rem;
  box-sizing: border-box;
}
</style>
