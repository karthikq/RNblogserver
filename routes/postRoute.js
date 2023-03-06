const express = require("express");
const { body } = require("express-validator");
const {
  CreatePost,
  deletePost,
  editPost,
  getPost,
  addLike,
} = require("../controller/PostController");
const { isAuth } = require("../middleware/isAuth");
const Post = require("../models/Posts");

const route = express.Router();

route.get("/all", async (req, res, next) => {
  const allPosts = await Post.find({})
    .populate("user")
    .populate("likes.user")
    .exec();

  return res.status(200).json({ data: allPosts });
});

route.post(
  "/create",
  isAuth,
  body("title")
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Title must have 5 & less than 50 char's"),
  body("description").trim().notEmpty(),
  body("visibility").notEmpty().withMessage("this field must not be empty"),
  body("category")
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Category must have 2 & less than 20 char's")
    .notEmpty()
    .withMessage("this field is required"),
  body("imageUrl").notEmpty().withMessage("this field is required"),
  body("despImage").isString(),
  body("keywords").isArray(),
  body("youtubeId").isString(),
  body("resizeMode"),
  CreatePost
);

route.delete("/delete/:postId", isAuth, deletePost);

route.patch(
  "/edit/:postId",
  body("title")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be 5 chracters long"),
  body("description").trim(),
  body("visibilty").notEmpty().withMessage("this field must not be empty"),
  body("category").notEmpty().withMessage("this field is required"),
  isAuth,
  editPost
);
route.get("/:postId", getPost);
route.patch("/addlike/:postId", isAuth, addLike);

module.exports = route;
