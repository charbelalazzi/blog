const express = require("express");

const postsController = require("../controllers/posts");

const isAuth = require("../middleware/is-auth");

const router = express.Router();




// Reply Routes
router.post("/reply/:commentId", isAuth, postsController.postReply);


