const Comment = require("./comments.model");
const { getOnePost } = require('../posts/posts.service')
const {userValidation} = require('../helper/helping_functions')


exports.getComment = async (commentId) => {
  const comment = await Comment.findById(commentId);
  if(!comment) {
    const error = new Error("Could not find Comment!");
    error.statusCode = 404;
    throw error;
  }
  return comment
};

exports.getCommentsForPost = async (postId) => {
  console.log(postId)
  await getOnePost(postId)
  return Comment.find({ post: postId });
};

exports.postComment = async (postId, userId, content) => {
  await getOnePost(postId)
  const comment = new Comment({
    content: content,
    post: postId,
    creator: userId,
    upVotes: 0,
    downVotes: 0,
  });
  return comment.save();
};

exports.updateComment = async (commentId, userId, content, upVote = false, downVote = false) => {
  const comment = await this.getComment(commentId)
  if (!upVote && !downVote){
    userValidation(userId, comment.creator)
  }
  comment.content = content;
  if (upVote) {
    comment.upVotes += 1;
  } else if (downVote) {
    comment.downVotes += 1;
  }
  comment.edited = true;
  return comment.save();
};

exports.deleteComment = async (commentId, userId) => {
  const comment = await this.getComment(commentId)
  userValidation(userId, comment.creator)
  return Comment.deleteOne({_id:commentId});
};

