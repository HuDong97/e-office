<script setup>
import {
    Star,
    View,
    Sugar,
    ChatDotRound,
    Back,
} from '@element-plus/icons-vue';

import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DOMPurify from 'dompurify';
import { ElMessage, ElMessageBox } from 'element-plus'; // 引入 ElMessageBox 用于确认删除评论
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
    getArticleComments,
    setCommentLikeService,
    cancelCommentLikeService
} from '@/api/userBehavior.js';
import useUserInfoStore from '@/stores/userInfo.js'

const userInfoStore = useUserInfoStore();

const formatTimeUnit = (unit) => (unit < 10 ? `0${unit}` : unit);

const formatCommentDate = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMs = now - commentDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`;
    } else if (diffInHours < 24) {
        return `${diffInHours}小时前`;
    } else if (diffInDays < 7) {
        const hours = commentDate.getHours();
        const minutes = formatTimeUnit(commentDate.getMinutes());
        return `${diffInDays}天前 ${hours}:${minutes}`;
    } else if (now.getFullYear() === commentDate.getFullYear()) {
        return `${commentDate.getMonth() + 1}月${commentDate.getDate()}日`;
    } else {
        return `${commentDate.getFullYear()}年${commentDate.getMonth() + 1}月${commentDate.getDate()}日`;
    }
};

const route = useRoute();
const router = useRouter();
const article = reactive({
    id: null,
    title: '',
    content: '',
    coverImg: '',
    state: '',
    categoryId: null,
    createUser: null,
    createTime: '',
    updateTime: '',
});
const nickName = ref('');
const avatar = ref('');

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
const comments = ref([]); // 新增评论数组

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

const toggleComments = async () => {
    commentsVisible.value = !commentsVisible.value;
    if (commentsVisible.value) {
        await loadComments(); // 切换到评论区时加载评论数据
    }
};

const loadComments = async () => {
    try {
        const response = await getArticleComments(route.query.id); // 调用获取评论的方法
        comments.value = response.data; // 将获取到的评论数据赋值给 comments 数组
    } catch (error) {
        console.error('获取评论失败：', error);
    }
};

const submitComment = async () => {
    if (newComment.value.trim()) {
        try {
            await commentsAddService({ articleId: route.query.id, content: newComment.value });
            userBehavior.commentsCount++;
            newComment.value = '';
            ElMessage.success('评论成功');
            await loadComments(); // 添加评论成功后重新加载评论数据
        } catch (error) {
            ElMessage.error('评论失败');
        }
    } else {
        ElMessage.warning('评论内容不能为空');
    }
};

const deleteComment = async (commentId, userId) => {
    try {
        await commentsDeleteService(commentId, userId); // 发送删除评论的请求
        ElMessage.success('评论删除成功');
        userBehavior.commentsCount--; // 更新评论数
        await loadComments(); // 重新加载评论列表
    } catch (error) {
        ElMessage.error('评论删除失败');
    }
};

const confirmDelete = (commentId, userId) => {
    ElMessageBox.confirm('确定删除这条评论吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        deleteComment(commentId, userId);
    }).catch(() => {
        ElMessage.info('取消删除');
    });
};


onMounted(async () => {
    // 获取文章id
    const ArticleId = route.query.id;

    if (ArticleId) {
        try {
            const articleResponse = await articleDetailService(ArticleId);
            article.value = articleResponse.data;
            Object.assign(article, articleResponse.data.article); // 设置文章数据
            nickName.value = articleResponse.data.nickName; // 设置作者昵称
            avatar.value = articleResponse.data.avatar; // 设置作者头像


            sanitizedContent.value = DOMPurify.sanitize(article.content);

            try {
                // 获取用户行为数据
                const behaviorResponse = await allUserBehavior(ArticleId);
                userBehavior.liked = behaviorResponse.data.liked === 1;
                userBehavior.bookmarked = behaviorResponse.data.bookmarked === 1;

                // 先向后端传入浏览+1
                await viewsAddService(ArticleId);

                // 最后加载浏览点赞收藏评论数
                const data = await userBehaviorService(ArticleId);
                userBehavior.likesCount = data.data.likesCount;
                userBehavior.commentsCount = data.data.commentsCount;
                userBehavior.viewsCount = data.data.viewsCount;
                userBehavior.favoritesCount = data.data.favoritesCount;

                // 加载评论数据
                await loadComments(); // 加载评论数据
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

const handleKeydown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 防止换行
        submitComment(); // 调用发送评论的方法
    }
};

const likeComment = async (comment) => {
    try {

        // 如果当前评论已经点赞
        if (comment.isLiked === 1) {
            // 取消点赞
            await cancelCommentLikeService(route.query.id, comment.id);
            comment.isLiked = 0;  // 更新本地数据为未点赞
            comment.likeCount--;   // 点赞数减一
        } else {
            // 点赞评论
            await setCommentLikeService(route.query.id, comment.id);
            comment.isLiked = 1;   // 更新本地数据为已点赞
            comment.likeCount++;   // 点赞数加一
        }
    } catch (error) {
        ElMessage.error('点赞操作失败');
    }
};



</script>

<template>
    <div v-if="article" class="article-container">
        <div class="article-header">
            <div class="title-and-back">
                <h1 class="article-title">{{ article.title }}</h1>
                <el-button type="primary" :icon="Back" @click="goBack" class="back-button">返回</el-button>
            </div>
            <p class="article-meta" style="display: flex; align-items: center; justify-content: space-between;">
                <span style="display: flex; align-items: center;">
                    <span class="article-date" style="margin-right: 10px;">发布时间：{{ formatDate(article.createTime)
                        }}</span>
                    <div style="margin-right: 10px;">
                        <img :src="avatar" alt="作者头像" v-if="avatar"
                            style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" />
                        <strong v-else>{{ avatar }}</strong> <!-- 如果没有头像，则显示链接 -->
                    </div>
                    <span class="article-author" style="margin-right: 10px;">{{ nickName }}</span>
                </span>
                <span class="article-icons" style="display: flex; align-items: center;">
                    <div style="font-size: 20px; margin-right: 15px;" title="浏览量">
                        <View style="width: 1em; height: 1em; margin-right: 2px" />
                        <span>{{ userBehavior.viewsCount }}</span>
                    </div>
                    <div style="font-size: 20px; margin-right: 15px;" title="点赞" @click="likeUserBehavior">
                        <Sugar
                            :style="{ width: '1em', height: '1em', marginRight: '2px', color: userBehavior.liked ? 'red' : '' }" />
                        <span>{{ userBehavior.likesCount }}</span>
                    </div>
                    <div style="font-size: 20px; margin-right: 15px;" title="收藏" @click="toggleBookmark">
                        <Star
                            :style="{ width: '1em', height: '1em', marginRight: '2px', color: userBehavior.bookmarked ? 'yellow' : '' }" />
                        <span>{{ userBehavior.favoritesCount }}</span>
                    </div>
                    <div style="font-size: 20px;" title="评论" @click="toggleComments">
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
    <el-drawer v-model="commentsVisible" title="评论区" direction="rtl" size="30%">
        <div class="comments-container">
            <div v-for="comment in comments" :key="comment.id" class="comment">
                <img :src="comment.avatar" class="comment-avatar" alt="用户头像" />
                <div class="comment-content">
                    <span class="comment-header">{{ comment.nickname }}</span>
                    <div class="comment-bubble">
                        <p class="comment-body">{{ comment.content }}</p>
                    </div>
                    <span class="comment-actions">
                        <span class="comment-timestamp">{{ formatCommentDate(comment.createdTime) }}</span>

                        <div style="font-size: 15px; margin-right: 15px;" title="点赞" @click="likeComment(comment)">
                            <Sugar :style="{
                                width: '1em',
                                height: '1em',
                                marginRight: '2px',
                                color: comment.isLiked === 1 ? 'red' : ''
                            }" />
                            <span>{{ comment.likeCount }}</span>
                        </div>

                        <el-button v-if="comment.userId === userInfoStore.info.id" type="text"
                            @click="confirmDelete(comment.id, comment.userId)"
                            style="color: inherit; font-size: inherit; margin-left: 10px;">
                            删除
                        </el-button>
                    </span>
                </div>
            </div>


            <div class="comment-input">
                <div class="input-container">
                    <el-input type="textarea" v-model="newComment" placeholder="请输入你的评论" rows="3" class="input"
                        @keydown="handleKeydown">
                    </el-input>
                    <el-button type="primary" @click="submitComment" class="send-button">发送</el-button>
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<style scoped>
.comment {
    display: flex;
    align-items: flex-start;
    margin-bottom: 15px;
}

.comment-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 10px;
}

.comment-content {
    display: flex;
    flex-direction: column;
    max-width: 75%;
}

.comment-header {
    font-weight: bold;
    font-size: 0.9em;
    margin-bottom: 5px;
}

.comment-body {
    margin: 0;
    padding: 5;
    font-size: 0.85em;
    line-height: 1.4;
    color: #333;
    margin-bottom: 5px;
    word-wrap: break-word;
}

.comment-timestamp {
    font-size: 1.2em;
    color: #999;

}

.comment-bubble {
    background-color: #e6f7ff;
    padding: 10px;
    border-radius: 10px;
    display: inline-block;
}



.comment-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 0.75em;
    color: #999;
}

.comment-actions span {
    margin-right: 10px;
}


.comment-actions .delete-button {
    color: #409EFF;
    /* 删除按钮颜色 */
    font-size: 0.8em;

}

.comment-actions .like-button {
    font-size: 0.8em;
}

.comment-author {
    font-weight: bold;
    margin-right: 5px;
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
