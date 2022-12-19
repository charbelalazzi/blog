const express = require("express");
const { tagSchema } = require("../helper/validation_schema");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const categoriesService = require("./categories.service");


const path = "/category";

const getCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    const category = await categoriesService.getCategory(categoryId);
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

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoriesService.getCategories();
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

const postCategory = async (req, res, next) => {
  try {
    const result = await tagSchema.validateAsync(req.body)
    const category = await categoriesService.postCategory(result.content);
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

const deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    await categoriesService.deleteCategory(categoryId);
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

router.get(`${path}/:categoryId`, getCategory);

router.get(`${path}`, getCategories);

router.post(`${path}`, isAuth, postCategory);

router.delete(`${path}/:categoryId`, deleteCategory);

module.exports = router;
