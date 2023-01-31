const Post = require("../models/Posts");
const User = require("../models/User");

exports.addTofav = async (req, res) => {
  const { postId } = req.params;
  try {
    const findPost = await Post.findOne({ postId: postId });

    if (!findPost) {
      return res.status(404).status({ json: "item not found" });
    } else {
      const res = await User.findOneAndUpdate(
        { userId: req.user.userId },
        {
          $push: { favArticles: { postId } },
        },
        {
          new: true,
        }
      );
      console.log(res);
      return res.status(201).json({ message: "Added", userdata: res });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getUserData = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const findUser = await User.findOne({ userId });

    if (!findUser) {
      return res.status(400).json({ message: "User not found" });
    } else {
      return res.status(200).json({ userdata: findUser });
    }
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
