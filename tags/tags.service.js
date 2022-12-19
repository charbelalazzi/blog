const Tag = require("./tags.model");
const Post = require("../posts/posts.model");
const { getCategory } = require("../categories/categories.service");

exports.getOneTag = async (tagId) => {
  const tag = await Tag.findById(tagId);
  if (!tag) {
    const error = new Error("Could not find tag!");
    error.statusCode = 404;
    throw error;
  }
  return tag;
};

exports.getTags = () => {
  return Tag.find();
};

exports.postTag = (content, categoriesIds) => {
  const tag = new Tag({
    content: content,
    categories: categoriesIds,
  });
  return tag.save();
};

exports.updateTag = async (tagId, removeCategoryId, addCategoryId) => {

  await this.getOneTag(tagId);
  if (removeCategoryId) {
    await Tag.updateOne(
      { _id: tagId },
      { $pull: { categories: { $in: removeCategoryId } } }
    );
  }
  if (addCategoryId) {
    await addCategoryId.forEach( async (cat) => {
      await getCategory(cat);
    }); //crashes after sending an error
    await Tag.updateOne(
      { _id: tagId },
      { $push: { categories: addCategoryId } }
    );
  }
  return Tag.findById(tagId);
};

exports.deleteTag = async (tagId) => {
  await this.getOneTag(tagId);
  await Post.updateMany({}, { $pull: { tags: { $in: tagId } } });
  return Tag.deleteOne({ _id: tagId });
};
