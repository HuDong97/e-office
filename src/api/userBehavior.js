import request from '@/utils/request.js'

// 获取文章行为统计数据
export const userBehaviorService = (articleId) => {
    return request.get('/userBehavior/counts', { params: { articleId } });
};

// 获取用户是否点赞收藏
export const userBehavior = (articleId) => {
    return request.get('/userBehavior/ArticleBehavior', { params: { articleId } });
};

//点赞添加 
export const likesAddService = (articleId) => {
    return request.post('/userBehavior/setLike', { params: { articleId } });

};

//收藏添加 
export const favoritesAddService = (articleId) => {
    return request.post('/userBehavior/setFavorite', { params: { articleId } });

};

//浏览添加  
export const viewsAddService = (articleId) => {
    return request.post('/userBehavior/setView', { params: { articleId } });

};

//评论添加 #todo commentData里面只需要传回文章id和评论内容
export const commentsAddService = (commentData) => {
    return request.post('/userBehavior/setComment', commentData);

};

//点赞删除
export const likesDeleteService = (articleId) => {
    return request.delete('/userBehavior?id=', { params: { articleId } });
};

//收藏删除
export const favoritesDeleteService = (articleId) => {
    return request.delete('/userBehavior?id=', { params: { articleId } });
};

//评论删除
export const commentsDeleteService = (articleId) => {
    return request.delete('/userBehavior?id=', { params: { articleId } });
};




