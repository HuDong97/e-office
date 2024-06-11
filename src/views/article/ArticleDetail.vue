<script setup>
import {
    Star,
    View,
    Sugar,
    ChatDotRound,
    Back,
    Upload,
} from '@element-plus/icons-vue';

import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DOMPurify from 'dompurify';
import { ElDrawer, ElButton, ElInput, ElMessage } from 'element-plus';
import { articleDetailService } from '@/api/article.js';
import {
    userBehaviorService,
    allUserBehavior,
    likesAddService,
    commentsAddService,
    favoritesAddService,
    viewsAddService,
    likesDeleteService,
    commentsDeleteService,
    favoritesDeleteService,
} from '@/api/userBehavior.js';

const route = useRoute();
const router = useRouter();
const article = ref(null);

const userBehavior = reactive({
    likesCount: 0,
    favoritesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    liked: false,
    bookmarked: false,
});

const sanitizedContent = ref('');
const commentsVisible = ref(false);
const newComment = ref('');

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};



const likeUserBehavior = async () => {
    try {
        if (userBehavior.liked) {
            await likesDeleteService(route.query.id);
            userBehavior.likesCount--;
            userBehavior.liked = false;
        } else {
            await likesAddService(route.query.id);
            userBehavior.likesCount++;
            userBehavior.liked = true;
        }
    } catch (error) {
        ElMessage.error('点赞操作失败');
    }
};

const toggleBookmark = async () => {
    try {
        if (userBehavior.bookmarked) {
            await favoritesDeleteService(route.query.id);
            userBehavior.favoritesCount--;
            userBehavior.bookmarked = false;
        } else {
            await favoritesAddService(route.query.id);
            userBehavior.favoritesCount++;
            userBehavior.bookmarked = true;
        }
    } catch (error) {
        ElMessage.error('收藏操作失败');
    }
};

const toggleComments = () => {
    commentsVisible.value = !commentsVisible.value;
};

const submitComment = async () => {
    if (newComment.value.trim()) {
        try {
            await commentsAddService({ articleId: route.query.id, content: newComment.value });
            userBehavior.commentsCount++;
            newComment.value = '';
            ElMessage.success('评论添加成功');
        } catch (error) {
            ElMessage.error('评论添加失败');
        }
    } else {
        ElMessage.warning('评论内容不能为空');
    }
};

onMounted(async () => {
    //获取文章id
    const ArticleId = route.query.id;


    if (ArticleId) {
        try {
            const articleResponse = await articleDetailService(ArticleId);
            article.value = articleResponse.data;
            sanitizedContent.value = DOMPurify.sanitize(article.value.content);

            try {
                // 获取用户行为数据
                const behaviorResponse = await allUserBehavior(ArticleId);
                userBehavior.liked = behaviorResponse.data.liked === 1;
                userBehavior.bookmarked = behaviorResponse.data.bookmarked === 1;

                //先向后端传入浏览+1
                await viewsAddService(ArticleId);


                //最后加载浏览点赞收藏评论数
                const data = await userBehaviorService(ArticleId);
                userBehavior.likesCount = data.data.likesCount;
                userBehavior.commentsCount = data.data.commentsCount;
                userBehavior.viewsCount = data.data.viewsCount;
                userBehavior.favoritesCount = data.data.favoritesCount;

            } catch (userBehaviorError) {
                console.error('获取用户行为数据失败：', userBehaviorError);
            }
        } catch (error) {
            console.error('查看文章或获取用户行为数据失败', error);
            router.push('/404');
        }
    } else {
        console.error('查看文章失败');
        router.push('/404');
    }
});

const goBack = () => {
    router.back();
};
</script>

<template>
    <div v-if="article" class="article-container">
        <div class="article-header">
            <div class="title-and-back">
                <h1 class="article-title">{{ article.title }}</h1>
                <el-button type="primary" :icon="Back" @click="goBack" class="back-button">返回</el-button>
            </div>
            <p class="article-meta">
                <span>
                    <span class="article-date">发布时间：{{ formatDate(article.createTime) }}</span>
                    <span class="article-author">作者：{{ article.createUser }}</span>
                </span>
                <span class="article-icons">
                    <div style="font-size: 20px" title="浏览量">
                        <View style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ userBehavior.viewsCount }}</span>
                    </div>
                    <div style="font-size: 20px" title="点赞" @click="likeUserBehavior">
                        <Sugar
                            :style="{ width: '1em', height: '1em', marginRight: '2px', color: userBehavior.liked ? 'red' : '' }" />
                        <span>{{ userBehavior.likesCount }}</span>
                    </div>
                    <div style="font-size: 20px" title="收藏" @click="toggleBookmark">
                        <Star
                            :style="{ width: '1em', height: '1em', marginRight: '2px', color: userBehavior.bookmarked ? 'yellow' : '' }" />
                        <span>{{ userBehavior.favoritesCount }}</span>
                    </div>
                    <div style="font-size: 20px" title="评论" @click="toggleComments">
                        <ChatDotRound style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ userBehavior.commentsCount }}</span>
                    </div>
                </span>
            </p>
        </div>
        <div class="article-content" v-html="sanitizedContent"></div>
    </div>
    <div v-else class="loading-container">
        <el-loading-spinner size="120px"></el-loading-spinner>
    </div>
    <el-drawer v-model="commentsVisible" :title="'评论区'" direction="rtl" size="30%">
        <div class="comments-container">
            <div class="comments-section">
                <div class="comment">
                    <div class="comment-bubble">
                        <span class="comment-author">用户A：</span>
                        <span class="comment-content">这是评论内容的示例。</span>
                    </div>
                </div>
                <div class="comment">
                    <div class="comment-bubble">
                        <span class="comment-author">用户B：</span>
                        <span class="comment-content">这是一条评论。</span>
                    </div>
                </div>
                <div class="comment">
                    <div class="comment-bubble">
                        <span class="comment-author">用户C：</span>
                        <span class="comment-content">这是另2条评论。</span>
                    </div>
                </div>
                <div class="comment">
                    <div class="comment-bubble">
                        <span class="comment-author">用户D：</span>
                        <span class="comment-content">这是第3条评论。</span>
                    </div>
                </div>
                <div class="comment">
                    <div class="comment-bubble">
                        <span class="comment-author">用户E：</span>
                        <span class="comment-content">这是第4条评论。</span>
                    </div>
                </div>
                <div class="comment">
                    <div class="comment-bubble">
                        <span class="comment-author">用户F：</span>
                        <span class="comment-content">这是第5条评论。</span>
                    </div>
                </div>
                <div class="comment">
                    <div class="comment-bubble">
                        <span class="comment-author">用户G：</span>
                        <span class="comment-content">这是第6条评论。</span>
                    </div>
                </div>

                <div class="comment">
                    <div class="comment-bubble">
                        <span class="comment-author">用户G：</span>
                        <span class="comment-content">这是顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶第7条评论。</span>
                    </div>
                </div>
            </div>
            <div class="comment-input">
                <div class="input-container">
                    <el-input type="textarea" v-model="newComment" placeholder="请输入你的评论" rows="3"
                        class="input"></el-input>
                    <el-button type="primary" @click="submitComment" class="send-button">发送</el-button>
                </div>
            </div>
        </div>
    </el-drawer>

</template>

<style scoped>
.comment {
    margin-bottom: 10px;
}

.comment-bubble {
    background-color: #f0f0f0;
    padding: 10px;
    border-radius: 8px;
    display: inline-block;
}

.comment-author {
    font-weight: bold;
    margin-right: 5px;
}

.comment-content {
    display: block;
    word-wrap: break-word;
    max-width: 300px;
    /* 气泡框最大宽度 */
}

.comments-section {
    overflow-y: auto;
    max-height: 75vh;
}

.comment-input {
    margin-top: 20px;
}

.article-date {
    margin-right: 30px;
}

.article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.article-icons {
    display: flex;
    align-items: center;
}

.article-icons div {
    display: flex;
    align-items: center;
    margin-right: 20px;
}

.article-icons span {
    margin-left: 0px;
    font-size: 0.6em;
}

.article-container {
    max-width: 65%;
    height: 55vh;
    margin: 10vh auto;
    padding: 25px;
    font-family: 'Arial', sans-serif;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.article-header {
    padding-bottom: 20px;
    border-bottom: 1px solid #ebebeb;
}

.title-and-back {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.article-title {
    margin: 0;
    font-size: 24px;
    color: #333;
}

.back-button {
    margin-left: auto;
}

.article-meta {
    font-size: 14px;
    color: #666;
}

.comments-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.comments-section {
    padding: 20px;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
}

.comment-input {
    margin-top: auto;
}

.input-container {
    display: flex;
    align-items: flex-end;
}

.input {
    flex: 1;
    margin-right: 10px;
}

.send-button {
    height: auto;
}
</style>
