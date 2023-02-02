const express = require("express");
const { body } = require("express-validator");
const {
  CreatePost,
  deletePost,
  editPost,
  getPost,
} = require("../controller/PostController");
const { isAuth } = require("../middleware/isAuth");
const Post = require("../models/Posts");

const route = express.Router();

route.get("/all", async (req, res, next) => {
  const allPosts = await Post.find({}).populate("user").exec();

  return res.status(200).json({ data: allPosts });
});

route.post(
  "/create",
  isAuth,
  body("title")
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Title must have 5 & less than 50 char's")
    .escape(),
  body("description").trim().escape().notEmpty(),
  body("visibility").notEmpty().withMessage("this field must not be empty"),
  body("category")
    .trim()
    .isLength({ min: 2, max: 20 })
    .toLowerCase()
    .withMessage("Category must have 2 & less than 20 char's")
    .notEmpty()
    .withMessage("this field is required"),
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
route.get("/:postId", getPost);

module.exports = route;
