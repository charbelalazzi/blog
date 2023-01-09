const Post = require("./posts.model");
const Comment = require("../comments/comments.model");
const { query } = require("express");
const { getCategory } = require("../categories/categories.service");
const { getOneTag } = require("../tags/tags.service");
const Tag = require("../tags/tags.model");
const {
  userValidation,
  prepareSearch,
} = require("../helper/helping_functions");

exports.getPosts = (search, page = 1) => {
  const postsToSkip = 10 * (parseInt(page) - 1);
  const searchFields = ["title"];
  const aggregate = Post.aggregate([
    {
      $match: prepareSearch(search, searchFields),
    },
    {
      $sort: { upVotes: -1 },
    },
    {
      $skip: postsToSkip,
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "comments",
      },
    },
    {
      $unwind: { path: "$comments", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "comments",
        localField: "comments._id",
        foreignField: "replyTo",
        as: "comments.replies",
      },
    },
    {
      $group: {
        _id: "$_id",
        title: { $first: "$title" },
        content: { $first: "$content" },
        upVotes: { $first: "$upVotes" },
        downVotes: { $first: "$downVotes" },
        creator: { $first: "$creator" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        comments: { $push: "$comments" },
      },
    },
  ]);
  return aggregate;
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
  userValidation(userId, post.creator);
  await Comment.deleteMany({ post: postId });
  await Post.deleteOne({ _id: postId });
};

exports.updatePost = async (
  postId,
  categoryId,
  tagsId,
  title,
  content,
  userId
) => {
  const post = await this.getOnePost(postId);
  console.log(userId, post.creator);
  userValidation(userId, post.creator);
  post.category = categoryId;
  post.tags = tagsId;
  post.title = title;
  post.content = content;
  return post.save();
};

exports.votePost = async (postId, upVote = false, downVote = false) => {
  const post = await this.getOnePost(postId);
  if ((!upVote && !downVote) || (upVote && downVote)) {
    return;
  }
  if (upVote) {
    post.upVotes += 1;
  }
  if (downVote) {
    post.downVotes += 1;
  }
  return post.save();
};
