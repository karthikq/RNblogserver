const Post = require("../models/Posts");
const moment = require("moment");
const { v4: nanoid } = require("uuid");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { notification, sendtomany } = require("./NotificationController");

exports.CreatePost = async (req, res, next) => {
  const {
    title,
    description,
    visibility,
    imageUrl,
    category,
    resizeMode,
    despImage,
    youtubeId,
  } = req.body;
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
    despImage: despImage ? despImage : "",
    youtubeId: youtubeId ? youtubeId : "",
    category: {
      val: category,
      date: new Date().toISOString(),
      user: req.user._id,
    },

    resizeMode: resizeMode ? resizeMode : "cover",
  });
  try {
    const createdPost = await newPost.save();
    const allFollowers = await User.findOne({ _id: req.user._id }).populate(
      "followers.user"
    );

    const deviceTokenArr = allFollowers.followers.map(
      (user) => user.user.deviceToken
    );
    console.log(deviceTokenArr, "as");

    if (deviceTokenArr.length > 0) {
      const messageTitle = req.user.username + " created a new Post";
      const messageBody = title;
      const deviceToken = deviceTokenArr;

      if (deviceToken) {
        await sendtomany(
          messageTitle,
          messageBody,
          imageUrl,
          deviceToken,
          "newpost",
          createdPost.postId
        );
      }
    }
    const currentnotificationDetails = {
      message: req.user.username + " created a new Post",
      date: new Date().toISOString(),
      user: req.user._id,
      notitype: "newpost",
      notiid: createdPost.postId,
    };

    const updatecurrentUser = await User.updateMany(
      { "following.user": req.user._id },
      {
        $push: {
          notifications: currentnotificationDetails,
        },
      },
      { new: true }
    )
      .populate("favArticles.postId")
      .populate("followers.user")
      .populate("following.user")
      .populate("notifications.user")
      .exec();

    return res
      .status(200)
      .json({ createdPost, message: "Post created", updatecurrentUser });
  } catch (error) {
    console.log(error);
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
        const checkinUsercoll = req.user.favArticles.find(
          (el) => el.postId.toString() === findPost._id.toString()
        );

        const allUser = await User.find({
          "favArticles.postId": findPost._id,
        });

        if (allUser.length > 0) {
          const updatedres = await User.updateMany(
            {},
            { $pull: { favArticles: { postId: findPost._id } } }
          );
        }

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
        if (req.body.category !== findPost.category.val) {
          req.body.category = {
            ...findPost.category,
            val: req.body.category,
            date: new Date().toISOString(),
          };
        } else {
          req.body.category = {
            ...findPost.category,
            val: req.body.category,
          };
        }
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
