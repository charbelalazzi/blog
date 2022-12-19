const Joi  = require("joi");

const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string(),
});

const postSchema = Joi.object({
  title: Joi.string().trim(),
  content: Joi.string().trim().min(8),
  categoryId: Joi.allow(),
  tagsId: Joi.array().unique().allow(),
  loc: Joi.allow(),
  upVote: Joi.allow(),
  downVote: Joi.allow(),
});

const tagSchema = Joi.object({
  content: Joi.string().trim(),
  categoriesId: Joi.array().unique().allow(),
  removeCategoryId: Joi.array().unique().allow(),
  addCategoryId: Joi.array().unique().allow(),
  upVote: Joi.allow(),
  downVote: Joi.allow(),
});

module.exports = {
  authSchema,
  postSchema,
  tagSchema,
};
