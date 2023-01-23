const express = require("express");
const { body } = require("express-validator");
const {
  CreatePost,
  deletePost,
  editPost,
} = require("../controller/PostController");
const { isAuth } = require("../middleware/isAuth");
const Post = require("../models/Posts");

const route = express.Router();

route.get("/all", async (req, res, next) => {
  const allPosts = await Post.find({}).sort({ createdAt: 1 });
  return res.status(200).json({ data: allPosts });
});

route.post(
  "/create",
  isAuth,
  body("title")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Title must be 2 chracters long")
    .escape(),
  body("description").trim().escape(),
  body("visibilty").notEmpty().withMessage("this field must not be empty"),
  body("category").notEmpty().withMessage("this field is required"),
  body("imageUrl").notEmpty().withMessage("this field is required"),
  CreatePost
);

route.delete("/delete/:postId", isAuth, deletePost);

route.patch(
  "/edit/:postId",
  body("title")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be 5 chracters long")
    .escape(),
  body("description").trim().escape(),
  body("visibilty").notEmpty().withMessage("this field must not be empty"),
  body("category").notEmpty().withMessage("this field is required"),
  editPost
);

module.exports = route;
