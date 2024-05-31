import request from '@/utils/request.js'



// 获取文章行为统计数据
export const getArticleBehaviorCounts = (articleId) => {
    return request.get(`/userBehavior/counts/${articleId}`);
};
