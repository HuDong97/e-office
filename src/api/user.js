//导入request.js请求工具
import request from '@/utils/request.js'

//提供调用注册接口的函数
export const userRegisterService = (registerData) => {
    //借助于UrlSearchParams完成传递
    const params = new URLSearchParams();
    for (let key in registerData) {
        params.append(key, registerData[key]);
    }
    return request.post('/user/register', params);
};

//提供调用登录接口的函数
export const userLoginService = (loginData) => {
    const params = new URLSearchParams();
    for (let key in loginData) {
        params.append(key, loginData[key]);
    }
    return request.post('/user/login', params);
}

//获取用户详细信息
export const userInfoService = () => {
    return request.get('/user/userInfo');
};

//修改个人信息
export const userNicknameUpdateService = (nickname) => {
    const params = new URLSearchParams();
    params.append('nickname', nickname);
    return request.patch('/user/updateNickname', params);
};

//修改头像
export const userAvatarUpdateService = (avatarUrl) => {
    const params = new URLSearchParams();
    params.append('avatarUrl', avatarUrl);
    return request.patch('/user/updateAvatar', params);
};



// 更新用户密码
export const userUpdatePassword = ({ old_pwd, new_pwd, re_pwd }) => {
    return request.patch('/user/updatePwd', { old_pwd, new_pwd, re_pwd });
};


// 更新用户邮箱
export const userUpdateEmail = ({ re_Email, new_Email }) => {
    return request.patch('/user/updateEmail', { re_Email, new_Email });
};


