const express = require("express");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const tagsService = require("./tags.service");
const {tagSchema} = require("../helper/validation_schema");
const Joi = require("joi");

const param = "/tag";

const getOneTag = async (req, res, next) => {
  const tagId = req.params.tagId;
  try {
    const tag = await tagsService.getOneTag(tagId);
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

const getTags = async (req, res, next) => {
  try {
    const tags = await tagsService.getTags();
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

const postTag = async (req, res, next) => {
  try {
    const result = await tagSchema.validateAsync(req.body);
    const { content, categoriesId } = result;
    const tag = await tagsService.postTag(content, categoriesId);
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

const updateTag = async (req, res, next) => {
  const tagId = req.params.tagId;
  try {
    let removeCategoryId,
      addCategoryId = null;
    const result = await tagSchema.validateAsync(req.body);
    removeCategoryId = result.removeCategoryId;
    addCategoryId = result.addCategoryId;
    const tag = await tagsService.updateTag(tagId, removeCategoryId, addCategoryId);
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

const deleteTag = async (req, res, next) => {
    const tagId = req.params.tagId;
    try {
      await tagsService.deleteTag(tagId)
      
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

router.get(`${param}/:tagId`, getOneTag);

router.get(`${param}`, getTags);

router.post(`${param}`, isAuth, postTag);

router.put(`${param}/:tagId`, updateTag);

router.delete(`${param}/:tagId`, deleteTag);

module.exports = router;
