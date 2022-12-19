require('dotenv').config()
const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./categories/categories.controller");
const commentsRoutes = require("./comments/comments.controller");
const postsRoutes = require("./posts/posts.controller");
const tagsRoutes = require("./tags/tags.controller");
const repliesRoutes = require ("./replies/replies.controller")
const config = require("./config");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imagesDir = path.join(__dirname, "/images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
    }
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("myImage")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-type, Authorization");
  next();
});

app.use("/auth", authRoutes);
app.use("/feed", tagsRoutes);
app.use("/feed", categoriesRoutes,);
app.use("/feed", commentsRoutes);
app.use("/feed", postsRoutes);
app.use("/feed", repliesRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(`mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.name}`)
  .then((result) => {
    app.listen(config.app.port);
    console.log("Connected!");
  })
  .catch((err) => {
    const server = console.log(err);
  });
