<script setup>
import { ref } from "vue";
import { onMounted } from "vue";
import { Edit, Delete, Reading, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import {
  articleListService,
  articleAddService,
  articleDeleteService,
  articleUpdateService,
} from "@/api/article.js";
import { articleCategoryListService } from "@/api/category.js";
//条目被点击后,调用的函数
import { useRouter } from "vue-router";
const router = useRouter();

// 数据模型
const categorys = ref([]);
const categoryId = ref("");
const state = ref("");
const articles = ref([]);
const pageNum = ref(1);
const total = ref(20);
const pageSize = ref(8);
const visibleDrawer = ref(false);
const drewerTitle = ref("");
const articleModel = ref({
  title: "",
  id: "",
  categoryId: "",
  coverImg: "",
  content: "",
  state: "",
  createTime: "",
});

const avatarFile = ref(null); // 保存用户选择的文件

const handleChange = (file) => {
  avatarFile.value = file.raw; // 保存文件用于后续上传
  const reader = new FileReader();
  reader.onload = (e) => {
    articleModel.value.coverImg = e.target.result; // 本地预览图片
  };
  reader.readAsDataURL(file.raw);
};

const validateImageSize = (file) => {
  if (file && file.size / 1024 >= 500) {
    ElMessage.error("图片大小不能超过 500KB");
    return false; // 验证失败
  }
  return true; // 验证通过
};

// 分页处理函数
const onSizeChange = (size) => {
  pageSize.value = size;
  articleList();
};
const onCurrentChange = (num) => {
  pageNum.value = num;
  articleList();
};

// 获取文章分类列表
const articleCategoryList = async () => {
  try {
    let result = await articleCategoryListService();
    categorys.value = result.data;
    articleList();
  } catch (error) {
    ElMessage.error("获取分类列表失败，请稍后重试");
    console.error(error);
  }
};

// 获取文章列表数据
const articleList = async () => {
  let params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    categoryId: categoryId.value || null,
    state: state.value || null,
  };
  let result = await articleListService(params);
  total.value = result.data.total;
  articles.value = result.data.items;

  // 处理数据，扩展分类名称和格式化创建时间
  articles.value.forEach((article) => {
    // 获取分类名称
    const category = categorys.value.find(
      (cat) => cat.id === article.categoryId
    );
    if (category) article.categoryName = category.categoryName;

    // 格式化创建时间
    if (article.createTime) {
      article.createTime = formatDate(article.createTime);
    }
  });
};

// 添加文章
const addArticle = async (clickState) => {
  // 检查封面是否为空
  if (!articleModel.value.coverImg) {
    ElMessage.error("请上传文章封面");
    return; // 如果没有封面，直接返回
  }
  // 检查图片大小
  if (avatarFile.value && !validateImageSize(avatarFile.value)) {
    return; // 图片大小不符合要求，阻止提交
  }
  articleModel.value.state = clickState;
  let result = await articleAddService(articleModel.value, avatarFile.value);
  if (result.code === 1) {
    // 判断 code 是否为 1
    ElMessage.success("添加成功");
    visibleDrawer.value = false;
    articleList();
  } else {
    ElMessage.error("添加失败: " + result.message);
  }
};
//查看文章详情
const viewArticleDetails = (clickState) => {
  // 获取要查看的文章ID
  const articleId = clickState.id;

  // 使用路由器导航到目标页面
  router.push({ path: "/article/detail", query: { id: articleId } });
};

// 修改文章
const updateArticle = async (clickState) => {
  if (!articleModel.value.coverImg) {
    ElMessage.error("请上传文章封面");
    return;
  }

  // 检查图片大小
  if (avatarFile.value && !validateImageSize(avatarFile.value)) {
    return; // 图片大小不符合要求，阻止提交
  }
  articleModel.value.state = clickState;

  // 只发送所需的数据到后端
  const dataToSend = {
    title: articleModel.value.title,
    content: articleModel.value.content,
    categoryId: articleModel.value.categoryId,
    id: articleModel.value.id,
    coverImg: articleModel.value.coverImg,
    state: articleModel.value.state,
    createTime: articleModel.value.createTime.toString(), // 确保是字符串
  };

  const result = await articleUpdateService(dataToSend, avatarFile.value);

  if (result.code === 1) {
    ElMessage.success("修改成功");
    visibleDrawer.value = false;
    articleList();
  } else {
    ElMessage.error("修改失败: " + result.message);
  }
};
// 删除文章
const deleteArticle = (row) => {
  ElMessageBox.confirm("你确认要删除该文章吗?", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let result = await articleDeleteService(row.id);
      ElMessage.success("删除成功");
      articleList();
    })
    .catch(() => {
      ElMessage.info("用户取消了删除");
    });
};

// 展示编辑抽屉
const showDrewer = (row) => {
  visibleDrawer.value = true;
  drewerTitle.value = "修改文章";
  Object.assign(articleModel.value, row);
};

// 清空模型的数据
const clearData = () => {
  Object.keys(articleModel.value).forEach((key) => {
    if (key !== "content") {
      articleModel.value[key] = "";
    } else {
      articleModel.value[key] = "\n"; // 清空 content 属性
    }
  });
};

// 查看文章详细信息

// 设置时间格式
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  articleCategoryList();
});
articleList();

const resetAndSearch = () => {
  categoryId.value = "";
  state.value = "";
  articleList(); // 重置后调用 articleList 重新加载数据
};
</script>

<template>
  <div>
    <el-card class="page-container">
      <template #header>
        <div class="header">
          <span>文章管理</span>
          <div class="extra">
            <el-button
              type="primary"
              @click="
                visibleDrawer = true;
                drewerTitle = '添加文章';
                clearData();
              "
              >添加文章</el-button
            >
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form inline>
        <el-form-item label="文章分类：">
          <el-select
            placeholder="请选择"
            v-model="categoryId"
            style="width: 200px"
          >
            <el-option
              v-for="c in categorys"
              :key="c.id"
              :label="c.categoryName"
              :value="c.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发布状态：">
          <el-select placeholder="请选择" v-model="state" style="width: 200px">
            <el-option label="已发布" value="已发布"></el-option>
            <el-option label="草稿" value="草稿"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="articleList">搜索</el-button>
          <el-button @click="resetAndSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 文章列表 -->
      <el-table :data="articles" style="width: 100%">
        <el-table-column
          label="文章标题"
          width="400"
          prop="title"
        ></el-table-column>
        <el-table-column label="分类" prop="categoryName"></el-table-column>
        <el-table-column label="发表时间" prop="createTime">
          <template #default="{ row }">
            <span>{{ formatDate(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="state"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-tooltip content="查看文章" popper-class="custom-tooltip">
              <el-button
                :icon="Reading"
                circle
                plain
                type="success"
                @click="viewArticleDetails(row)"
              ></el-button>
            </el-tooltip>

            <el-tooltip content="修改文章" popper-class="custom-tooltip">
              <el-button
                :icon="Edit"
                circle
                plain
                type="primary"
                @click="showDrewer(row)"
              ></el-button>
            </el-tooltip>

            <el-tooltip content="删除文章" popper-class="custom-tooltip">
              <el-button
                :icon="Delete"
                circle
                plain
                type="danger"
                @click="deleteArticle(row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="没有数据" />
        </template>
      </el-table>

      <!-- 分页条 -->
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[8, 15, 30]"
        layout="jumper, total, sizes, prev, pager, next"
        background
        :total="total"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />

      <!-- 抽屉 -->
      <el-drawer
        v-model="visibleDrawer"
        :title="drewerTitle"
        direction="rtl"
        size="50%"
      >
        <el-form :model="articleModel" label-width="100px">
          <el-form-item label="文章标题">
            <el-input
              v-model="articleModel.title"
              placeholder="请输入标题"
            ></el-input>
          </el-form-item>
          <el-form-item label="文章分类">
            <el-select placeholder="请选择" v-model="articleModel.categoryId">
              <el-option
                v-for="c in categorys"
                :key="c.id"
                :label="c.categoryName"
                :value="c.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="文章封面">
            <el-upload
              class="avatar-uploader"
              :auto-upload="false"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-change="handleChange"
              name="file"
            >
              <img
                v-if="articleModel.coverImg"
                :src="articleModel.coverImg"
                class="avatar"
              />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="文章内容">
            <div class="editor">
              <QuillEditor
                theme="snow"
                v-model:content="articleModel.content"
                contentType="html"
                name="quillEditor"
                :toolbar="[
                  [{ header: 1 }, { header: 2 }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ script: 'sub' }, { script: 'super' }],
                  [{ color: [] }, { background: [] }],
                ]"
                :style="{ height: '260px' }"
              >
              </QuillEditor>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="
                drewerTitle == '添加文章'
                  ? addArticle('已发布')
                  : updateArticle('已发布')
              "
              >发布</el-button
            >
            <el-button
              type="info"
              @click="
                drewerTitle == '添加文章'
                  ? addArticle('草稿')
                  : updateArticle('草稿')
              "
              >草稿</el-button
            >
          </el-form-item>
        </el-form>
      </el-drawer>
    </el-card>
  </div>
</template>

<style lang="scss">
.page-container {
  min-height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px;
  padding: 2rem;
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.el-button {
  border-radius: 20px;
}

.el-message-box {
  border-radius: 20px;
}

.el-form,
.el-input,
.el-select,
.el-upload {
  border-radius: 10px;
}

.el-drawer,
.el-dialog {
  border-radius: 20px;
}

.el-dialog__footer .el-button {
  border-radius: 20px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader {
  :deep() {
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
  }
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;

  border: 1px dashed #a9aaac;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.editor {
  width: 100%;

  :deep(.ql-editor) {
    min-height: 260px;
  }
}
</style>
