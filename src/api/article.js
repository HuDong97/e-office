import request from '@/utils/request.js'




//文章列表查询
export const articleListService = (params) => {
    return request.get('/article', { params: params });
};

//文章添加
export const articleAddService = (articleData) => {
    return request.post('/article', articleData);

};

//文章修改
export const articleUpdateService = (articleData) => {
    return request.put('/article', articleData);
};
//文章删除
export const articleDeleteService = (id) => {
    return request.delete('/article?id=' + id);
};

// 获取文章详情
export const articleDetailService = (id) => {
    return request.get('/article/detail', { params: { id } });
};


