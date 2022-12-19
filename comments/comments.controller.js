const express = require("express");
const isAuth = require("../middleware/is-auth");
const commentService = require("./comments.service");
const Post = require('../posts/posts.model')
const {tagSchema} = require('../helper/validation_schema')
const router = express.Router();

const param = "/comment";

const getComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
    const comment = commentService.getComment(commentId);
    res.status(200).json({
      message: "Comment fetched",
      comments: comment,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const getCommentsForPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const comments = await commentService.getCommentsForPost(postId);
    res.status(200).json({
      message: "Comments for post fetched",
      comments: comments,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const postComment = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;
  console.log(req.body)
  try {
    await tagSchema.validateAsync(req.body);
    const comment = await commentService.postComment(postId, userId, req.body.content);
    res.status(201).json({
      message: "Comment posted successfully",
      comment: comment,
    });
  } catch (err) {
    if (err.isJoi === true) {
      err.statusCode = 422;
    }
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const updateComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const userId = req.userId;

  try {
    const result = await tagSchema.validateAsync(req.body);
    const {content, upVote, downVote} = result
    const comment = await commentService.updateComment(commentId, userId, content, upVote, downVote);
    res.status(200).json({
      message: "Comment Updated",
      comment: comment,
    });
  } catch (err) {
    if (err.isJoi === true) {
      err.statusCode = 422;
    }
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const userId = req.userId;
  try {
    commentService.deleteComment(commentId, userId);
    res.status(200).json({ message: "Comment Deleted." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const postReply =  async (req, res, next) => {
  const commentId = req.params.commentId;
  const content = req.body.content;
  try {
    const result = await tagSchema.validateAsync(req.body);
    const reply = await commentService.postReply()
    res.status(201).json({
      message: "Reply added.",
      reply: reply,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

router.get(`${param}/:commentId`, getComment);

router.get(`${param}ForPost/:postId`, getCommentsForPost);

router.post(`${param}/:postId`, isAuth, postComment);

router.put(`${param}/:commentId`, updateComment);

router.delete(`${param}/:commentId`, deleteComment);


module.exports = router;
