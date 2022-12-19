const express = require("express");
const isAuth = require("../middleware/is-auth");
const replyService = require("./replies.service");
const { tagSchema } = require("../helper/validation_schema");
const router = express.Router();

const param = "/replies";

const getReply = async (req, res, next) => {
  const replyId = req.params.replyId;
  try {
    const reply = await replyService.getReply(replyId);
    res.status(200).json({
      message: "Reply fetched",
      reply: reply,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const getRepliesForComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
    const replies = await replyService.getRepliesForComment(commentId);
    res.status(200).json({
      message: "Replies for comment fetched",
      comments: replies,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const postReply = async (req, res, next) => {
  const commentId = req.params.commentId;
  const userId = req.userId;
  try {
    const result = await tagSchema.validateAsync(req.body);
    const reply = await replyService.postReply(
      commentId,
      userId,
      result.content
    );
    res.status(201).json({
      message: "Reply posted successfully",
      comment: reply,
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

const updateReply = async (req, res, next) => {
  const replyId = req.params.replyId;
  const userId = req.userId;

  try {
    const result = await tagSchema.validateAsync(req.body);
    const { content, upVote, downVote } = result;
    const reply = await replyService.updateReply(
      replyId,
      userId,
      content,
      upVote,
      downVote
    );
    res.status(200).json({
      message: "Reply Updated",
      comment: reply,
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

const deleteReply = async (req, res, next) => {
  const replyId = req.params.replyId;
  const userId = req.userId;
  try {
    await replyService.deleteReply(replyId, userId);
    res.status(200).json({ message: "Reply Deleted." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

router.get(`${param}/:replyId`, getReply);

router.get(`${param}ForComment/:commentId`, getRepliesForComment);

router.post(`${param}/:commentId`, isAuth, postReply);

router.put(`${param}/:replyId`, updateReply);

router.delete(`${param}/:replyId`, deleteReply);

module.exports = router;
