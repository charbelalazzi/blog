const Post = require("../models/posts");
const User = require("../models/users");
const Comment = require("../models/comments");
const Category = require("../models/categories");
const Tag = require("../models/tags");
const { findByIdAndDelete, deleteMany, find } = require("../models/posts");

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
      const error = newError("Could not find Post!");
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

exports.postPosts = async (req, res, next) => {
  const categorieId = req.body.categorie;
  const tagsId = req.body.tags;
  const title = req.body.title;
  const content = req.body.content;
  const upVotes = 0;
  const downVotes = 0;
  try {
    const tags = await Tag.find({ _id: { $in: [...tagsId] } });
    tags.forEach((tag) => {
      if (tag.categories.includes(categorieId) === false) {
        const error = newError(tag.content + "cannot be used for this Categorie");
        error.statusCode = 400;
        throw error;
      }
    });
    const post = new Post({
      categorie: categorieId,
      tags: tagsId,
      title: title,
      content: content,
      upVotes: upVotes,
      downVotes: downVotes,
    });
    await post.save();
    res.status(201).json({
      message: "Post created successfully",
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = newError("Could not find Post!");
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
  const updatedCategorie = req.body.categorie;
  const updatedTags = req.body.tags;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = newError("Could not find Post!");
      error.statusCode = 404;
      throw error;
    }
    post.categorie = updatedCategorie;
    post.tags = updatedTags;
    post.title = updatedTitle;
    post.content = updatedContent;
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
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  const content = req.body.content;
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = newError("Could not find Post!");
      error.statusCode = 404;
      throw error;
    }
    const comment = new Comment({
      content: content,
      post: postId,
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
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
    const comment = await Comment.findById(commentId);
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

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      message: "fetched categories successfull.",
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
  const content = req.body.content;
  try {
    const category = new Category({
      content: content,
    });
    await category.save();
    res.status(201).json({
      message: "Category Created",
      category: category,
    });
  } catch (err) {
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
  const content = req.body.content;
  const categoriesIds = [...req.body.categories];
  try {
    const tag = new Tag({
      content: content,
      categories: categoriesIds,
    });
    await tag.save();
    res.status(201).json({
      message: "Tag Created.",
      tag: tag,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateTag = async (req, res, next) => {
  const tagId = req.params.tagId;
  const removeCategoryId = req.body.removeCategory;
  const addCategoryId = req.body.addCategory;
  try {
    if (removeCategoryId) {
      await Tag.updateOne(
        { _id: tagId },
        { $pull: { categories: { $in: removeCategoryId } } }
      );
    }
    if (addCategoryId) {
      await Tag.updateOne(
        { _id: tagId },
        { $push: { categories: addCategoryId } }
      );
    }
    const tag = await Tag.findById(tagId);
    res.status(200).json({
      message: "Tag updated.",
      tag: tag,
    });
  } catch (err) {
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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
