const Post = require("../models/posts");
const User = require("../models/users");
const Comment = require("../models/comments");
const Category = require("../models/categories");
const Tag = require("../models/tags");
const { findByIdAndDelete, deleteMany, find } = require("../models/posts");
const { postSchema, tagSchema } = require("../helper/validation_schema");

// Posts CRUD

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find();
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

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find Post!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched.", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addPosts = async (req, res, next) => {
  const userId = req.userId;
  try {
    const result = await postSchema.validateAsync(req.body);
    const tags = await Tag.find({ _id: { $in: result.tagsId } });
    tags.forEach((tag) => {
      if (tag.categories.includes(result.categoryId) === false) {
        const error = new Error(
          tag.content + "cannot be used for this Category"
        );
        error.statusCode = 400;
        throw error;
      }
    });
    const post = new Post({
      category: result.categoryId,
      tags: result.tagsId,
      title: result.title,
      content: result.content,
      creator: userId,
      upVotes: 0,
      downVotes: 0,
    });
    if (req.file) {
      post.image = req.file;
    }
    await post.save();
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

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;
  try {
    const post = await Post.findById(postId);
    if (userId != post.creator) {
      const error = new Error("This user cannot deleete this post");
      error.statusCode = 422;
      throw error;
    }
    if (!post) {
      const error = new Error("Could not find Post!");
      error.statusCode = 404;
      throw error;
    }
    const commentsIds = [...post.comments];
    await Comment.deleteMany({ _id: { $in: commentsIds } });
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post Deleted." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;
  try {
    const post = await Post.findById(postId);
    if (userId != post.creator) {
      const error = new Error("This user cannot edit this post");
      error.statusCode = 422;
      throw error;
    }
    const result = await postSchema.validateAsync(req.body);
    if (!post) {
      const error = new Error("Could not find Post!");
      error.statusCode = 404;
      throw error;
    }
    post.category = result.categoryId;
    post.tags = result.tagsId;
    post.title = result.title;
    post.content = result.content;
    if (req.body.upVote) {
      post.upVotes += 1;
    } else if (req.body.downVote) {
      post.downVotes += 1;
    }
    await post.save();
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

// Comment CRUD

exports.getComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
    const comment = await Comment.findById(commentId);
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

exports.getComments = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    const comments = await Comment.find({ _id: { $in: post.comments } });
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

exports.postComment = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;
  try {
    const result = await tagSchema.validateAsync(req.body);
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find Post!");
      error.statusCode = 404;
      throw error;
    }
    const comment = new Comment({
      content: result.content,
      post: postId,
      creator: userId,
      upVotes: 0,
      downVotes: 0,
    });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json({
      message: "Comment posted successfully",
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

exports.updateComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const userId = req.userId;
  try {
    const result = await tagSchema.validateAsync(req.body);
    const comment = await Comment.findById(commentId);
    if (userId != comment.creator) {
      const error = new Error("This user cannot edit this comment");
      error.statusCode = 422;
      throw error;
    }
    if (!comment) {
      const error = new Error("Could not find comment!");
      error.statusCode = 404;
      throw error;
    }
    comment.content = result.content;
    if (req.body.upVote) {
      comment.upVotes += 1;
    } else if (req.body.downVote) {
      comment.downVotes += 1;
    }
    comment.edited = true;
    await comment.save();
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

exports.deleteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const userId = req.userId;
  try {
    const comment = await Comment.findById(commentId);
    if (userId != comment.creator) {
      const error = new Error("This user cannot delete this comment");
      error.statusCode = 422;
      throw error;
    }
    if (!comment) {
      const error = new Error("Could not find comment!");
      error.statusCode = 404;
      throw error;
    }
    const postId = comment.post;
    await Post.updateOne(
      { _id: postId },
      { $pull: { comments: { $in: commentId } } }
    );
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment Deleted." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Reply Crud

exports.postReply = async (req, res, next) => {
  const errors = validationResult(req);

  const commentId = req.params.commentId;
  const content = req.body.content;
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }
    const comment = await Comment.findById(commentId);
    const reply = new Comment({
      content: content,
      replyTo: commentId,
      post: comment.post,
      upVotes: 0,
      downVotes: 0,
    });
    await reply.save();
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

// Category CRUD

exports.getCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    const category = await Category.findById(categoryId);
    res.status(200).json({
      message: "fetched category successfully.",
      category: category,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      message: "fetched categories successfully.",
      categories: categories,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postCategory = async (req, res, next) => {
  try {
    const result = await tagSchema.validateAsync(req.body);
    const category = new Category({
      content: result.content,
    });
    await category.save();
    res.status(201).json({
      message: "Category Created",
      category: category,
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

exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    await Category.findByIdAndDelete(categoryId);
    await Tag.updateMany({}, { $pull: { categories: { $in: categoryId } } });
    await Post.updateMany(
      { category: categoryId },
      { $unset: { category: 1 } }
    );
    res.status(200).json({
      message: "Category deleted.",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Tag CRUD

exports.getTag = async (req, res, next) => {
  const tagId = req.params.tagId;
  try {
    const tag = await Tag.findById(tagId);
    res.status(200).json({
      message: "fetched tag successfull.",
      tag: tag,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find();
    res.status(200).json({
      message: "fetched tags successfull.",
      tags: tags,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postTag = async (req, res, next) => {
  try {
    const result = await tagSchema.validateAsync(req.body);
    const tag = new Tag({
      content: result.content,
      categories: result.categoriesIds,
    });
    await tag.save();
    res.status(201).json({
      message: "Tag Created.",
      tag: tag,
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

exports.updateTag = async (req, res, next) => {
  const tagId = req.params.tagId;
  try {
    const result = await tagSchema.validateAsync(req.body);
    if (result.removeCategoryId) {
      await Tag.updateOne(
        { _id: tagId },
        { $pull: { categories: { $in: result.removeCategoryId } } }
      );
    }
    if (result.addCategoryId) {
      await Tag.updateOne(
        { _id: tagId },
        { $push: { categories: result.addCategoryId } }
      );
    }
    const tag = await Tag.findById(tagId);
    res.status(200).json({
      message: "Tag updated.",
      tag: tag,
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

exports.deleteTag = async (req, res, next) => {
  const tagId = req.params.tagId;
  try {
    await Tag.findByIdAndDelete(tagId);
    res.status(200).json({
      message: "Tag deleted.",
    });
    await Post.updateMany({}, { $pull: { tags: { $in: tagId } } });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
