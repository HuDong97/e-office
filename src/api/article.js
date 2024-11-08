import request from '@/utils/request.js'




//文章列表查询
export const articleListService = (params) => {
    return request.get('/article', { params: params });
};

// 文章添加
export const articleAddService = (articleData, coverImg) => {
    // 创建 FormData 对象，将文章数据和封面图添加进去
    const formData = new FormData();

    // 遍历 articleData 对象，将每个属性添加到 formData 中
    for (const key in articleData) {
        if (articleData.hasOwnProperty(key)) {
            formData.append(key, articleData[key]);
        }
    }

    // 添加封面图片文件
    formData.append('file', coverImg);

    // 使用 post 请求发送 formData
    return request.post('/article', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};



// 文章修改
export const articleUpdateService = (articleData, coverImg) => {
    // 创建 FormData 对象，将文章数据和封面图添加进去
    const formData = new FormData();

    // 遍历 articleData 对象，将每个属性添加到 formData 中
    for (const key in articleData) {
        if (articleData.hasOwnProperty(key)) {
            formData.append(key, articleData[key]);
        }
    }

    // 仅在 coverImg 存在时才添加封面图片文件
    if (coverImg) {
        formData.append('file', coverImg);
    }

    // 使用 put 请求发送 formData
    return request.put('/article', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

//文章删除
export const articleDeleteService = (id) => {
    return request.delete('/article?id=' + id);
};

// 获取文章详情
export const articleDetailService = (id) => {
    return request.get('/article/detail', { params: { id } });
};

