import request from "@/utils/request.js";

// 获取文章行为统计数据
export const userBehaviorService = (articleId, state) => {
  return request.get("/userBehavior/counts", { params: { articleId, state } });
};

// 获取用户是否点赞收藏
export const allUserBehavior = (articleId) => {
  return request.get("/userBehavior/ArticleBehavior", {
    params: { articleId },
  });
};

//点赞点击
export const likesAddService = (articleId) => {
  const formData = new URLSearchParams();
  formData.append("articleId", articleId);
  return request.post("/userBehavior/setLike", formData);
};

//收藏点击
export const favoritesAddService = (articleId) => {
  const formData = new URLSearchParams();
  formData.append("articleId", articleId);
  return request.post("/userBehavior/setFavorite", formData);
};

//浏览添加
export const viewsAddService = (articleId) => {
  const formData = new URLSearchParams();
  formData.append("articleId", articleId);
  return request.post("/userBehavior/setView", formData);
};

//评论添加  commentData里面只需要传回文章id和评论内容
export const commentsAddService = (commentData) => {
  return request.post("/userBehavior/setComment", commentData);
};

//评论显示
export const getArticleComments = (articleId) => {
  return request.get("/userBehavior/commentDetail", { params: { articleId } });
};

//点赞删除
export const likesDeleteService = (articleId) => {
  return request.delete("/userBehavior/deleteLike", { params: { articleId } });
};

//收藏删除
export const favoritesDeleteService = (articleId) => {
  return request.delete("/userBehavior/deleteFavorite", {
    params: { articleId },
  });
};

// 评论删除
export const commentsDeleteService = (commentId, userId, articleId) => {
  return request.delete("/userBehavior/deleteComment", {
    params: { id: commentId, userId: userId, articleId: articleId },
  });
};

// 评论点赞
export const setCommentLikeService = (articleId, commentId) => {
  return request.post("/userBehavior/setCommentLike", null, {
    params: { articleId, commentId },
  });
};

// 取消评论点赞
export const cancelCommentLikeService = (articleId, commentId) => {
  return request.delete("/userBehavior/cancelCommentLike", {
    params: { articleId, commentId },
  });
};

//获取后续10条评论  articleId文章id  commentId评论id
export const subsequentCommentsService = (articleId, commentId) => {
  return request.get("/userBehavior/subsequentComments", {
    params: { articleId, commentId },
  });
};

//评论回复显示
export const getArticleCommentsReply = (articleId, commentId) => {
  return request.get("/userBehavior/replyDetail", {
    params: { articleId, commentId },
  });
};

// 评论回复点赞
export const setCommentReplyLikeService = (replyId, articleId, commentId) => {
  return request.post("/userBehavior/setCommentReplyLike", null, {
    params: { replyId, articleId, commentId },
  });
};

// 取消回复评论点赞
export const cancelCommenReplytLikeService = (
  articleId,
  commentId,
  replyId
) => {
  return request.delete("/userBehavior/cancelCommentReplyLike", {
    params: { articleId, commentId, replyId },
  });
};
