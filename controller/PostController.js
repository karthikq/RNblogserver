const Post = require("../models/Posts");
const moment = require("moment");
const { v4: nanoid } = require("uuid");
const { validationResult } = require("express-validator");
const User = require("../models/User");

exports.CreatePost = async (req, res, next) => {
  const { title, description, visibility, imageUrl, category, resizeMode } =
    req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (!title || !description || !visibility || !imageUrl || !category) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
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
    resizeMode: resizeMode ? resizeMode : "cover",
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
  const loggedUser = req.user._id;
  try {
    const findPost = await Post.findOne({ postId });

    if (findPost.user.toString() === loggedUser.toString()) {
      if (findPost) {
        await Post.deleteOne({ postId });
        return res.status(200).json({ message: "Post deleted", deleted: true });
      } else {
        const error = new Error("Post not found");
        error.statusCode = 401;
        throw error;
      }
    } else {
      const error = new Error("User not allowed");
      error.statusCode = 401;
      throw error;
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
  const loggedUser = req.user.userId;

  try {
    const findPost = await Post.findOne({ postId }).populate("user").exec();
    if (findPost.user.userId === loggedUser) {
      if (findPost) {
        Object.assign(findPost, req.body);
        const newupdatedPost = await Post.findOneAndUpdate(
          { postId },
          findPost,
          {
            new: true,
            upsert: true,
          }
        )
          .populate("user")
          .exec();

        return res
          .status(200)
          .json({ message: "Post updated", postdata: newupdatedPost });
      } else {
        const error = new Error("Post not found");
        error.statusCode = 401;
        throw error;
      }
    } else {
      const error = new Error("User not allowed");
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.getPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const findPost = await Post.findOne({ postId: postId })
      .populate("user")
      .exec();

    if (!findPost) {
      return res.status(404).status({ message: "item not found" });
    } else {
      return res.status(200).json(findPost);
    }
  } catch (error) {
    console.log(error);
  }
};
