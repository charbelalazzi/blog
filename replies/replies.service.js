const Post = require("../posts/posts.model");
const Comment = require("../comments/comments.model");
const { getComment } = require("../comments/comments.service");

exports.getReply = async (replyId) => {
  const reply = await Comment.findById(replyId);
  if (!reply) {
    const error = new Error("Could not find reply!");
    error.statusCode = 404;
    throw error;
  }
  return reply;
};

exports.getRepliesForComment = async (commentId) => {
  await getComment(commentId);
  return Comment.find({ comment: commentId });
  // add pagenation
};

exports.postReply = async (commentId, userId, content) => {
  const comment =  await getComment(commentId);
  if (comment.replyTo) {
    const error = new Error('Cannot reply to a reply')
    error.statusCode = 422;
    throw error
  }
  const reply = new Comment({
    content: content,
    replyTo: commentId,
    creator: userId,
    upVotes: 0,
    downVotes: 0,
  });
  return reply.save();
};

exports.updateReply = async (
  replyId,
  userId,
  content,
  upVote = false,
  downVote = false
) => {
  const reply = await this.getReply(replyId);
  // add user validation

  reply.content = content;
  if (upVote) {
    reply.upVotes += 1;
  } else if (downVote) {
    reply.downVotes += 1;
  }
  reply.edited = true;
  return reply.save();
};

exports.deleteReply = async (replyId) => {
  await this.getReply(replyId);
  // add user verification
  return Comment.deleteOne({ _id: replyId });
};
