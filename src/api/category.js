//导入request.js请求工具
import request from '@/utils/request.js'


//文章分类列表查询
export const articleCategoryListService = () => {
    return request.get('/category')
}

//查询所有文章分类
export const getAllCategory = () => {
    return request.get('/category/getAllCategoryNames')
}

//文章分类添加
export const articleCategoryAddService = (categoryData) => {
    return request.post('/category', categoryData)
}

//文章分类修改
export const articleCategoryUpdateService = (categoryData) => {
    return request.put('/category', categoryData)
}

//文章分类删除
export const articleCategoryDeleteService = (id) => {
    return request.delete('/category?id=' + id)
}