const joi = require("joi");

const authSchema = joi.object({
  email: joi.string().email().lowercase().required(),
  password: joi.string().min(6).required(),
  name: joi.string(),
});

const postSchema = joi.object({
  title: joi.string().trim(),
  content: joi.string().trim().min(8),
  categoryId: joi.allow(),
  tagsId: joi.allow(),
  upVote: joi.allow(),
  downVote: joi.allow(),
});

const tagSchema = joi.object({
  content: joi.string().trim(),
  catrgoriesId: joi.allow(),
  removeCategoryId: joi.allow(),
  addCategoryId: joi.allow(),
  upVote: joi.allow(),
  downVote: joi.allow(),
});

module.exports = {
  authSchema,
  postSchema,
  tagSchema,
};
