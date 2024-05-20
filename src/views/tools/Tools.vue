<template>
    <div class="tools">
        <el-container>
            <el-header>
                <h1>实用工具</h1>
            </el-header>
            <el-main>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <div class="tool-card">
                            <h2>工具一</h2>
                            <p>这里是工具一的描述。</p>
                            <el-button type="primary" @click="handleToolOneClick">使用工具一</el-button>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="tool-card">
                            <h2>工具二</h2>
                            <p>这里是工具二的描述。</p>
                            <el-button type="primary" @click="handleToolTwoClick">使用工具二</el-button>
                        </div>
                    </el-col>
                </el-row>
            </el-main>

        </el-container>
    </div>
</template>

<script>
export default {
    name: 'Tools',
    methods: {
        handleToolOneClick() {
            // 处理工具一的点击事件
            console.log('点击了工具一');
        },
        handleToolTwoClick() {
            // 处理工具二的点击事件
            console.log('点击了工具二');
        },
    },
};
</script>

<style scoped>
.tools {
    padding: 20px;
}

.tool-card {
    background-color: #f0f2f5;
    padding: 20px;
    border-radius: 5px;
}

.tool-card h2 {
    margin-bottom: 10px;
}

.tool-card p {
    margin-bottom: 20px;
}
</style>
