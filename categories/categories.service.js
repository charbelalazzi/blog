const Category = require("./categories.model");
const Tag = require("../tags/tags.model")
const Post = require ("../posts/posts.model")

exports.getCategory = async (categoryId) => {
  const category =  await Category.findById(categoryId);
  if(!category) {
    const error = new Error("Could not find Category!");
    error.statusCode = 404;
    throw error;
  }
  return category
};

exports.getCategories = () => {
  return Category.find();
};

exports.postCategory = (content) => {
  const category = new Category({
    content: content,
  });
  return category.save();
};

exports.deleteCategory = async (categoryId) => {
  await this.getCategory(categoryId)
  await Category.deleteOne({_id:categoryId});
  await Tag.updateMany({}, { $pull: { categories: { $in: categoryId } } });
  return Post.updateMany({ category: categoryId }, { $unset: { category: 1 } });
};
