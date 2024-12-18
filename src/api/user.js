// 导入request.js请求工具
import request from "@/utils/request.js";

// 提供调用注册接口的函数
export const userRegisterService = ({ username, password, email, code }) => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  params.append("email", email);
  params.append("code", code);
  return request.post("/user/register", params);
};

// 提供调用登录接口的函数
export const userLoginService = (loginData) => {
  const params = new URLSearchParams();
  for (let key in loginData) {
    params.append(key, loginData[key]);
  }
  return request.post("/user/login", params);
};

// 获取用户详细信息
export const userInfoService = () => {
  return request.get("/user/userInfo");
};

// 修改个人信息
export const userNicknameUpdateService = (nickname) => {
  const params = new URLSearchParams();
  params.append("nickname", nickname);
  return request.patch("/user/updateNickname", params);
};

// 修改用户头像
export const userAvatarUpdateService = (formData) => {
  return request.patch("/user/updateAvatar", formData);
};

// 更新用户密码
export const userUpdatePassword = ({ old_pwd, new_pwd, re_pwd }) => {
  return request.patch("/user/updatePwd", { old_pwd, new_pwd, re_pwd });
};

// 更新用户邮箱
export const userUpdateEmail = ({ re_Email, new_Email }) => {
  return request.patch("/user/updateEmail", { re_Email, new_Email });
};

// 提供调用退出登录接口的函数
export const userLogoutService = (token) => {
  return request.post("/user/logout", { token });
};

// 获取验证码
export const getResetCodeService = (email) => {
  const params = new URLSearchParams();
  params.append("email", email);
  return request.post("/user/getResetCode", params);
};

// 重置密码
export const resetPasswordService = ({ email, code, newPassword }) => {
  const params = new URLSearchParams();
  params.append("email", email);
  params.append("code", code);
  params.append("newPassword", newPassword);
  return request.post("/user/resetPassword", params);
};
