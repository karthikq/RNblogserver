const Post = require("../models/Posts");
const moment = require("moment");
const { v4: nanoid } = require("uuid");
const { validationResult } = require("express-validator");
exports.CreatePost = async (req, res, next) => {
  const { title, description, visibility, imageUrl, category } = req.body;
  const errors = validationResult(req);

  console.log(req.body, "sdds");
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (!title || !description || !visibility || !imageUrl || !category) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    next(error);
  }
  const postcreated_at = new Date().toISOString();
  const postId = nanoid();
  const date = moment().format("MMM Do YY");

  const newPost = new Post({
    title,
    description,
    postcreated_at,
    date,
    postId,
    user: req.user,
    visibility,
    imageUrl,
    category,
  });
  try {
    const createdPost = await newPost.save();
    return res.status(200).json({ createdPost, message: "Post created" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const findPost = await Post.findOne({ postId });
    if (findPost) {
      await Post.deleteOne({ postId });
      return res.status(200).json({ message: "Post deleted", deleted: true });
    } else {
      const error = new Error("Password doesn't match");
      error.statusCode = 401;
      next(error);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.editPost = async (req, res, next) => {
  const { postId } = req.body;
  try {
    const findPost = await Post.findOne({ postId });
    if (findPost) {
      Object.assign(findPost, req.body);
      await Post.findOneAndUpdate({ postId }, findPost, {
        new: true,
        upsert: true,
      });
    } else {
      const error = new Error("Password doesn't match");
      error.statusCode = 401;
      next(error);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
