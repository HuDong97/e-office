<script setup>
import {
    Edit,
    Delete,
    Reading,
    Back
} from '@element-plus/icons-vue'

import { ref } from 'vue'

//文章分类数据模型
const categorys = ref([
    {
        "id": 3,
        "categoryName": "",
        "categoryAlias": "",
        "createTime": "",
        "updateTime": ""
    },

])

//用户搜索时选中的分类id
const categoryId = ref('')

//用户搜索时选中的发布状态
const state = ref('')

//文章列表数据模型
const articles = ref([
    {
        'id': '',
        'title': '',
        'content': '',
        'coverImg': '',
        'state': '',
        'categoryId': '',
        'createTime': '',
        'updateTime': ''
    },
]);


//分页条数据模型
const pageNum = ref(1)//当前页
const total = ref(20)//总条数
const pageSize = ref(10)//每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
    pageSize.value = size
    articleList()
}
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
    pageNum.value = num
    articleList()
}


//回显文章
import { articleListService, articleAddService, articleDeleteService, articleUpdateService, articleDetailService } from '@/api/article.js'
//回显文章分类
import { articleCategoryListService } from '@/api/category.js'



const articleCategoryList = async () => {
    let result = await articleCategoryListService();

    categorys.value = result.data;
}

//获取文章列表数据
const articleList = async () => {
    let params = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        categoryId: categoryId.value ? categoryId.value : null,
        state: state.value ? state.value : null
    }
    let result = await articleListService(params);

    //渲染视图
    total.value = result.data.total;
    articles.value = result.data.items;

    //处理数据,给数据模型扩展一个属性categoryName,分类名称
    for (let i = 0; i < articles.value.length; i++) {
        let article = articles.value[i];
        for (let j = 0; j < categorys.value.length; j++) {
            if (article.categoryId == categorys.value[j].id) {
                article.categoryName = categorys.value[j].categoryName;
            }
        }
    }
}


articleCategoryList()
articleList();

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { Plus } from '@element-plus/icons-vue'

//控制抽屉是否显示
const visibleDrawer = ref(false)
const visibleArticleDrawer = ref(false)
//添加表单数据模型
const articleModel = ref({
    title: '',
    id: '',
    categoryId: '',
    coverImg: '',
    content: '',
    state: '',
    createTime: '',
})


//导入token
import { useTokenStore } from '@/stores/token.js';
const tokenStore = useTokenStore();

//上传成功的回调函数
const uploadSuccess = (result) => {
    articleModel.value.coverImg = result.data;
    console.log(result.data);
}

//添加文章
import { ElMessage } from 'element-plus'
const addArticle = async (clickState) => {
    //把发布状态赋值给数据模型
    articleModel.value.state = clickState;

    //调用接口
    let result = await articleAddService(articleModel.value);

    ElMessage.success(result.message ? result.message : '添加成功');

    //让抽屉消失
    visibleDrawer.value = false;

    //刷新当前列表
    articleList()
}

//修改文章
const updateArticle = async (clickState) => {
    //把发布状态赋值给数据模型
    articleModel.value.state = clickState;

    //调用接口
    let result = await articleUpdateService(articleModel.value);

    ElMessage.success(result.message ? result.message : '添加成功');

    //让抽屉消失
    visibleDrawer.value = false;

    //刷新当前列表
    articleList()
}

//删除文章
import { ElMessageBox } from 'element-plus'
const deleteArticle = (row) => {
    //提示用户确认框

    ElMessageBox.confirm(
        '你确认要删除该文章吗?',
        '温馨提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            //调用接口
            let result = await articleDeleteService(row.id);
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
            //刷新列表
            articleList();
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '用户取消了删除',
            })
        })
}

//定义变量,控制抽屉标题的展示
const drewerTitle = ref('');
//展示编辑抽屉

const showDrewer = function (row) {
    visibleDrawer.value = true;
    drewerTitle.value = '修改文章'
    //数据拷贝
    articleModel.value.title = row.title;
    articleModel.value.categoryId = row.categoryId;
    articleModel.value.coverImg = row.coverImg;
    articleModel.value.content = row.content;
    articleModel.value.state = row.state;
    //扩展id属性,将来需要传递给后台
    articleModel.value.id = row.id;

}

//清空模型的数据
const clearData = () => {
    articleModel.value.title = '';
    articleModel.value.categoryId = '';
    articleModel.value.coverImg = '';
    articleModel.value.content = "\n";
    articleModel.value.state = '';
    //扩展id属性,将来需要传递给后台
    articleModel.value.id = '';

}

//添加文章数据
const articleModel1 = ref({
    title: '',
    id: '',
    categoryId: '',
    coverImg: '',
    content: '',
    state: '',
    createTime: '',
})


//查看文章详细信息
const getArticleDetail = async (row) => {

    try {
        const result = await articleDetailService(row.id);

        // 添加安全性检查
        if (result && result.data) {
            // 将获取的数据赋值给articleModel1
            articleModel1.value = result.data;

        } else {
            ElMessage.error(result.message ? result.message : '获取文章详情失败：数据不完整');
        }
    } catch (error) {
        ElMessage.error(result.message ? result.message : '获取文章详情失败');
    }
};





</script>
<template>
    <div>
        <el-card class="page-container">
            <template #header>
                <div class="header">
                    <span>文章管理</span>
                    <div class="extra">
                        <el-button type="primary"
                            @click="visibleDrawer = true; drewerTitle = '添加文章'; clearData()">添加文章</el-button>


                    </div>
                </div>
            </template>
            <!-- 搜索表单 -->
            <el-form inline>
                <el-form-item label="文章分类：">
                    <el-select placeholder="请选择" v-model="categoryId" style="width: 200px;">
                        <el-option v-for=" c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="发布状态：">
                    <el-select placeholder="请选择" v-model="state" style="width: 200px;">
                        <el-option label="已发布" value="已发布"></el-option>
                        <el-option label="草稿" value="草稿"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="articleList">搜索</el-button>
                    <el-button @click="categoryId = ''; state = ''">重置</el-button>
                </el-form-item>
            </el-form>
            <!-- 文章列表 -->
            <el-table :data="articles" style="width: 100%">
                <el-table-column label="文章标题" width="400" prop="title"></el-table-column>
                <el-table-column label="分类" prop="categoryName"></el-table-column>
                <el-table-column label="发表时间" prop="createTime"> </el-table-column>
                <el-table-column label="状态" prop="state"></el-table-column>
                <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                        <el-button :icon="Reading" circle plain type="success"
                            @click="visibleArticleDrawer = true; getArticleDetail(row)" title="查看文章"></el-button>
                        <el-button :icon="Edit" circle plain type="primary" @click="showDrewer(row)"
                            title="编辑文章"></el-button>
                        <el-button :icon="Delete" circle plain type="danger" @click="deleteArticle(row)"
                            title="删除文章"></el-button>



                    </template>
                </el-table-column>

                <template #empty>
                    <el-empty description="没有数据" />
                </template>
            </el-table>
            <!-- 分页条 -->
            <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5, 10, 15]"
                layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
                @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" />

            <!-- 抽屉 -->
            <el-drawer v-model="visibleDrawer" :title="drewerTitle" direction="rtl" size="50%">
                <!-- 添加文章表单 -->
                <el-form :model="articleModel" label-width="100px">
                    <el-form-item label="文章标题">
                        <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
                    </el-form-item>
                    <el-form-item label="文章分类">
                        <el-select placeholder="请选择" v-model="articleModel.categoryId">
                            <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 上传文章封面 -->
                    <el-form-item label="文章封面">
                        <!-- 
                        auto-upload:设置是否自动上传
                        action:设置服务器接口路径
                        name:设置上传的文件字段名
                        headers:设置上传的请求头
                        on-success:设置上传成功的回调函数
                     -->

                        <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false"
                            action="/api/upload" name="file" :headers="{ 'Authorization': tokenStore.token }"
                            :on-success="uploadSuccess">
                            <img v-if="articleModel.coverImg" :src="articleModel.coverImg" class="avatar" />
                            <el-icon v-else class="avatar-uploader-icon">
                                <Plus />
                            </el-icon>
                        </el-upload>
                    </el-form-item>


                    <el-form-item label="文章内容">
                        <div class="editor">
                            <!-- 工具栏选项essential、minimal、full -->
                            <QuillEditor theme="snow" v-model:content="articleModel.content" contentType="html"
                                name="quillEditor" :toolbar="[
                                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    [{ 'script': 'sub' }, { 'script': 'super' }],
                                    [{ 'color': [] }, { 'background': [] }],
                                    ['clean'],]">
                            </QuillEditor>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary"
                            @click="drewerTitle == '添加文章' ? addArticle('已发布') : updateArticle('已发布')">发布</el-button>
                        <el-button type="info"
                            @click="drewerTitle == '添加文章' ? addArticle('草稿') : updateArticle('草稿')">草稿</el-button>
                    </el-form-item>
                </el-form>
            </el-drawer>
        </el-card>

        <!-- 文章详情页 -->

        <el-drawer v-model="visibleArticleDrawer" :title="文章详情" direction="rtl" size="50%">
            <!-- 添加文章表单 -->
            <el-form :model="articleModel1">

                <!-- 发布时间 -->
                <div class="article-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h1 class="el-title">{{ articleModel1.title ? articleModel1.title : 'No Title' }}</h1>
                    <div class="create-time" style="font-size: 14px;">
                        发布时间: {{ articleModel1.createTime }}
                    </div>
                </div>

                <!-- 分割线 -->
                <el-divider></el-divider>

                <!-- 文章内容 -->
                <div v-html="articleModel1.content" class="el-content"></div>

                <!-- 其他文章详情信息的展示 -->

            </el-form>
        </el-drawer>




    </div>


</template>
<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

/* 抽屉样式 */
.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}

.editor {
    width: 100%;

    :deep(.ql-editor) {
        min-height: 200px;
    }
}
</style>