<script setup>
import { User, Lock, Message } from "@element-plus/icons-vue";
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  userRegisterService,
  userLoginService,
  getResetCodeService,
  resetPasswordService,
} from "@/api/user.js";
import { useTokenStore } from "@/stores/token.js";
import { useRouter } from "vue-router";

const isRegister = ref(false); // 注册表格状态
const forgotPassword = ref(false); // 忘记密码状态
const timer = ref(0); // 倒计时
const isButtonDisabled = ref(false); // 按钮状态

const registerData = ref({
  username: "",
  password: "",
  email: "",
  rePassword: "",
  captcha: "",
});

// 提交忘记密码重置请求时的逻辑
const submitForgotPassword = async () => {
  if (registerData.value.password !== registerData.value.rePassword) {
    ElMessage.error("两次输入的密码不一致，请重新输入");
    return;
  }
  try {
    // 调用接口，发送邮箱、验证码和新密码
    await resetPasswordService({
      email: registerData.value.email,
      code: registerData.value.captcha,
      newPassword: registerData.value.password,
    });
    ElMessage.success("密码重置成功");
    forgotPassword.value = false; // 重置成功后返回登录界面
    clearRegisterData();
  } catch (error) {
    ElMessage.error("密码重置失败");
  }
};

// 获取验证码
const getCaptcha = async () => {
  if (isButtonDisabled.value) return; // 按钮禁用时不执行操作
  startTimer(); // 开始倒计时

  try {
    // 调用接口发送验证码请求
    await getResetCodeService(registerData.value.email);
    ElMessage.success("验证码已发送，请查收");
  } catch (error) {
    ElMessage.error("获取验证码失败");
  }
};

// 验证码倒计时函数
const startTimer = () => {
  timer.value = 60; // 设置倒计时时间为60秒
  isButtonDisabled.value = true; // 禁用按钮

  const countdown = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearInterval(countdown); // 停止倒计时
      isButtonDisabled.value = false; // 启用按钮
    }
  }, 1000); // 每秒更新一次
};

// 确认两次密码是否一致,仅提醒
const checkRePassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次确认密码"));
  } else if (value !== registerData.value.password) {
    callback(new Error("请确保两次输入的密码一样"));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: "请输入用户名/邮箱", trigger: "blur" },
    { min: 4, max: 30, message: "长度为4~30位非空字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      min: 5,
      max: 16,
      message: "密码长度必须在5到16位之间,仅支持数字、英文大小写字母以及@#$%",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    {
      min: 5,
      max: 16,
      message: "仅支持@163.com,@qq.com,@gmail.com,@hotmail.com",
      trigger: "blur",
    },
  ],
  rePassword: [{ validator: checkRePassword, trigger: "blur" }],
};

const register = async () => {
  if (registerData.value.password !== registerData.value.rePassword) {
    ElMessage.error("两次输入的密码不一致，请重新输入");
    return;
  }

  try {
    await userRegisterService({
      username: registerData.value.username,
      password: registerData.value.password,
      email: registerData.value.email,
      code: registerData.value.captcha,
    });
    ElMessage.success("注册成功");
    isRegister.value = false; // 注册成功后跳转到登录表单
    clearRegisterData(); // 清空注册表单数据
  } catch (error) {
    ElMessage.error(result.message ? result.message : "注册失败");
  }
};

const tokenStore = useTokenStore();
const router = useRouter();

const rememberPassword = ref(false); //记住密码框状态

onMounted(() => {
  const savedUsername = localStorage.getItem("savedUsername");
  const savedPassword = localStorage.getItem("savedPassword");
  if (savedUsername && savedPassword) {
    registerData.value.username = savedUsername;
    registerData.value.password = savedPassword;
    rememberPassword.value = true;
  }
});

const login = async () => {
  try {
    let result = await userLoginService(registerData.value);
    ElMessage.success("登录成功");
    tokenStore.setToken(result.data);
    if (rememberPassword.value) {
      localStorage.setItem("savedUsername", registerData.value.username);
      localStorage.setItem("savedPassword", registerData.value.password);
    } else {
      localStorage.removeItem("savedUsername");
      localStorage.removeItem("savedPassword");
    }
    router.push("/");
  } catch (error) {
    ElMessage.error(
      result.message ? result.message : "登录失败，请检查账号或密码"
    );
  }
};
const clearRegisterData = () => {
  registerData.value = {
    username: "",
    password: "",
    rePassword: "",
    email: "",
    captcha: "",
  };
};
</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 忘记密码表单 -->
      <el-form
        ref="form"
        size="large"
        autocomplete="off"
        v-if="forgotPassword"
        :model="registerData"
        :rules="rules"
      >
        <el-form-item>
          <h1>忘记密码</h1>

          <!-- 添加注册邮箱框 -->
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            :prefix-icon="Message"
            type="email"
            placeholder="请输入您的注册邮箱"
            v-model="registerData.email"
          ></el-input>
        </el-form-item>

        <!-- 添加新密码输入框 -->
        <el-form-item prop="password">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入新密码"
            v-model="registerData.password"
          ></el-input>
        </el-form-item>

        <!-- 添加确认新密码输入框 -->
        <el-form-item prop="rePassword">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请确认新密码"
            v-model="registerData.rePassword"
          ></el-input>
        </el-form-item>
        <!-- 添加验证码框和获取验证码按钮 -->
        <el-form-item prop="captcha" class="captcha-container">
          <el-input
            class="captcha-input"
            placeholder="请输入验证码"
            v-model="registerData.captcha"
          ></el-input>
          <el-button
            class="captcha-button"
            :disabled="isButtonDisabled"
            @click="getCaptcha"
          >
            {{ isButtonDisabled ? `${timer}s 后重试` : "获取验证码" }}
          </el-button>
        </el-form-item>

        <!-- 提交重置密码请求按钮 -->
        <el-form-item>
          <el-button
            class="button"
            type="primary"
            auto-insert-space
            @click="submitForgotPassword"
            >提交</el-button
          >
        </el-form-item>

        <!-- 返回登录按钮 -->
        <el-form-item class="flex">
          <el-link
            type="info"
            :underline="false"
            @click="
              forgotPassword = false;
              clearRegisterData();
            "
            >← 返回登录</el-link
          >
        </el-form-item>
      </el-form>

      <!-- 注册表单 -->
      <el-form
        ref="form"
        size="large"
        autocomplete="off"
        v-if="isRegister && !forgotPassword"
        :model="registerData"
        :rules="rules"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            :prefix-icon="User"
            placeholder="请输入用户名"
            v-model="registerData.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            :prefix-icon="Message"
            type="email"
            placeholder="请输入邮箱"
            v-model="registerData.email"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            v-model="registerData.password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="rePassword">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入再次密码"
            v-model="registerData.rePassword"
          ></el-input>
        </el-form-item>

        <el-form-item prop="captcha" class="captcha-container">
          <el-input
            class="captcha-input"
            placeholder="请输入验证码"
            v-model="registerData.captcha"
          ></el-input>
          <el-button
            class="captcha-button"
            :disabled="isButtonDisabled"
            @click="getCaptcha"
          >
            {{ isButtonDisabled ? `${timer}s 后重试` : "获取验证码" }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            class="button"
            type="primary"
            auto-insert-space
            @click="register"
            >注册</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link
            type="info"
            :underline="false"
            @click="
              isRegister = false;
              clearRegisterData();
            "
            >← 返回登录</el-link
          >
        </el-form-item>
      </el-form>

      <!-- 登录表单 -->
      <el-form
        ref="form"
        size="large"
        autocomplete="off"
        v-else-if="!isRegister && !forgotPassword"
        :model="registerData"
        :rules="rules"
        @keydown.enter="login"
      >
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            :prefix-icon="User"
            placeholder="用户名/邮箱"
            v-model="registerData.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            v-model="registerData.password"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
            <el-link
              type="primary"
              :underline="false"
              @click="
                forgotPassword = true;
                clearRegisterData();
              "
              >忘记密码？</el-link
            >
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            class="button"
            type="primary"
            auto-insert-space
            @click="login"
            >登录</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link
            type="info"
            :underline="false"
            @click="
              isRegister = true;
              clearRegisterData();
            "
            >注册 →</el-link
          >
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background: url("@/assets/logo2.png") no-repeat 50% 15% / 500px auto,
      url("@/assets/login_bg.jpg") no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .title {
      margin: 0 auto;
    }

    .button {
      width: 100%;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }

    /* 新增验证码框样式 */
    .captcha-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .captcha-input {
      width: calc(100% - 110px);
      /* 调整输入框宽度 */
    }

    .captcha-button {
      margin-left: 10px;
      width: 100px;
      /* 固定按钮宽度 */
    }
  }
}
</style>
