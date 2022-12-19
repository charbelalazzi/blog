const express = require("express");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const postsService = require("./posts.service");
const Post = require("./posts.model");


const { postSchema } = require("../helper/validation_schema");

const param = "/posts";

const getPosts = async (req, res, next) => {
  try {
    const posts = await postsService.getPosts();
    res.status(200).json({
      message: "Fetched posts successfully.",
      posts: posts,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const getOnePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await postsService.getOnePost(postId);
    res.status(200).json({ message: "Post fetched.", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const addPost = async (req, res, next) => {
  const userId = req.userId;
  console.log(req.body.myImage)
  let image;
  try {
    const result = await postSchema.validateAsync(req.body);
    if (req.myImage) {
      image = req.myImage;
    }
    const { categoryId, tagsId, title, content, loc } = result;
    const post = await postsService.addPosts(
      categoryId,
      tagsId,
      title,
      content,
      userId,
      loc,
      image
    );

    res.status(201).json({
      message: "Post created successfully",
      post: post,
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

const deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;
  try {
    await postsService.deletePost(postId, userId);
    res.status(200).json({ message: "Post Deleted." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;
  console.log(req.userId);
  try {
    // add user verification
    const result = await postSchema.validateAsync(req.body);

    const { categoryId, tagsId, title, content, upVote, downVote } = result;
    const post = await postsService.updatePost(
      postId,
      categoryId,
      tagsId,
      title,
      content,
      upVote,
      downVote
    );
    res.status(200).json({
      message: "Post Updated",
      post: post,
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

router.get(`${param}`, getPosts);

router.get(`${param}/:postId`, getOnePost);

router.post(`${param}`, isAuth, addPost);

router.delete(`${param}/:postId`, deletePost);

router.put(`${param}/:postId`, updatePost);

module.exports = router;
