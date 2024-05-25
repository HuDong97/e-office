import axios from 'axios';

// chatgpt3.5调用
export const chatAi = (msg) => {
    return axios.get('/chat/invokeChat3', { params: { msg } });
};
