<script setup>
import { Edit, Delete } from "@element-plus/icons-vue";
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  articleCategoryListService,
  articleCategoryAddService,
  articleCategoryUpdateService,
  articleCategoryDeleteService,
} from "@/api/category.js";

const categorys = ref([
  {
    id: "",
    categoryName: "",
    categoryCount: "",
    createTime: "",
    updateTime: "",
  },
]);

// 获取所有分类
const articleCategoryList = async () => {
  let result = await articleCategoryListService();
  categorys.value = result.data;
};

// 调用获取所有分类的函数
articleCategoryList();

// 控制添加分类弹窗
const dialogVisible = ref(false);

// 添加分类数据模型
const categoryModel = ref({
  categoryName: "",
  categoryCount: "",
});

// 添加分类表单校验
const rules = {
  categoryName: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
  ],
  categoryCount: [
    { required: true, message: "请输入分类别名", trigger: "blur" },
  ],
};

// 添加分类
const addCategory = async () => {
  const numberRegex = /^\d+$/;
  if (!numberRegex.test(categoryModel.value.categoryCount)) {
    ElMessage.error("请输入数字作为使用次数");
    return;
  }

  let result = await articleCategoryAddService(categoryModel.value);
  ElMessage.success("添加成功");

  // 重新获取分类数据
  articleCategoryList();
  dialogVisible.value = false;
};

// 编辑分类
const updateCategory = async () => {
  const numberRegex = /^\d+$/;
  if (!numberRegex.test(categoryModel.value.categoryCount)) {
    ElMessage.error("请输入数字作为使用次数");
    return;
  }

  let result = await articleCategoryUpdateService(categoryModel.value);
  ElMessage.success("修改成功");

  // 重新获取分类数据
  articleCategoryList();
  dialogVisible.value = false;
};

// 清空模型的数据
const clearData = () => {
  categoryModel.value.categoryName = "";
  categoryModel.value.categoryCount = "";
};

// 显示编辑弹窗
const showDialog = (row) => {
  dialogVisible.value = true;
  title.value = "编辑分类";
  categoryModel.value.categoryName = row.categoryName;
  categoryModel.value.categoryCount = row.categoryCount;
  categoryModel.value.id = row.id;
};

// 删除分类
const deleteCategory = (row) => {
  ElMessageBox.confirm("你确认要删除该分类信息吗?", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let result = await articleCategoryDeleteService(row.id);
      ElMessage.success("删除成功");
      articleCategoryList();
    })
    .catch(() => {
      ElMessage.info("用户取消了删除");
    });
};

// 控制标题的展示
const title = ref("");
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>文章分类</span>
        <div class="extra">
          <el-button
            type="primary"
            @click="
              dialogVisible = true;
              title = '添加分类';
              clearData();
            "
            >添加分类</el-button
          >
        </div>
      </div>
    </template>

    <el-table :data="categorys" style="width: 100%">
      <el-table-column label="序号" width="100" type="index"></el-table-column>
      <el-table-column label="分类名称" prop="categoryName"></el-table-column>
      <el-table-column label="使用次数" prop="categoryCount"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="showDialog(row)"
            title="编辑分类"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deleteCategory(row)"
            title="删除分类"
          ></el-button>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>

    <!-- 添加分类弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="title"
      width="30%"
      :style="{ borderRadius: '15px' }"
    >
      <el-form
        :model="categoryModel"
        :rules="rules"
        label-width="100px"
        style="padding-right: 30px"
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input
            v-model="categoryModel.categoryName"
            minlength="1"
            maxlength="10"
          ></el-input>
        </el-form-item>
        <el-form-item label="使用次数" prop="categoryCount">
          <el-input
            v-model="categoryModel.categoryCount"
            minlength="1"
            maxlength="15"
          ></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="title === '添加分类' ? addCategory() : updateCategory()"
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px;
  padding: 2rem;
  box-sizing: border-box;
  background-color: #fff;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 15px;
    padding: 10px;
  }

  .el-table {
    border-radius: 15px;
    overflow: hidden;
  }

  .el-table th,
  .el-table td {
    border-radius: 10px;
  }

  .el-button {
    border-radius: 50px;
  }

  .el-dialog {
    border-radius: 15px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    .el-button {
      border-radius: 50px;
    }
  }

  .el-input {
    border-radius: 8px;
  }

  .el-form-item {
    margin-bottom: 15px;
  }
}
</style>
