const Post = require("./posts.model");
const Comment = require("../comments/comments.model");
const { query } = require("express");
const { getCategory } = require("../categories/categories.service");
const { getOneTag } = require("../tags/tags.service");
const Tag = require("../tags/tags.model");
const {userValidation} = require("../helper/helping_functions")

exports.getPosts = () => {
  // const searchableFields = ['field1', 'field2'];
  // const orOperation = [];
  // searchableFields.forEach(field => {
  //   orOperation.push({
  //     $regex: {
  //       value: query.search,
  //       options:'i'
  //     }
  //   })
  // });
  // add pagination, sort, search
  // return Post.find({ $or: orOperation});
  return Post.find();
};

exports.getOnePost = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error("Could not find Post!");
    error.statusCode = 404;
    throw error;
  }
  return post;
};

exports.addPosts = async (
  categoryId,
  tagsId,
  title,
  content,
  userId,
  loc = null,
  image = null
) => {
  await getCategory(categoryId);
  tagsId.forEach(async (tagId) => await getOneTag(tagId));
  const tags = await Tag.find({ _id: { $in: result.tagsId } });
  tags.forEach((tag) => {
    if (tag.categories.includes(result.categoryId) === false) {
      const error = new Error(
        tag.content + " cannot be used for this Category"
      );
      error.statusCode = 400;
      throw error;
    }
  });
  const post = new Post({
    category: categoryId,
    tags: tagsId,
    title: title,
    content: content,
    creator: userId,
    image: image,
    loc: loc,
    upVotes: 0,
    downVotes: 0,
  });
  return post.save();
};

exports.deletePost = async (postId, userId) => {
  const post = await this.getOnePost(postId);
  // userValidation(userId, post.creator)
  await Comment.deleteMany({ post: postId });
  await Post.deleteOne({ _id: postId });
};

exports.updatePost = async (
  postId,
  categoryId,
  tagsId,
  title,
  content,
  upVote = false,
  downVote = false
) => {
  const post = await this.getOnePost(postId);
  post.category = categoryId;
  post.tags = tagsId;
  post.title = title;
  post.content = content;
  if (upVote) {
    post.upVotes += 1;
  } else if (downVote) {
    post.downVotes += 1;
  }
  return post.save();
};
