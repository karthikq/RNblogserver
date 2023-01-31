const Post = require("../models/Posts");
const User = require("../models/User");

exports.addTofav = async (req, res, next) => {
  const { postId } = req.params;
  console.log(postId, req.user.userId);
  try {
    const findPost = await Post.findOne({ _id: postId });

    if (!findPost) {
      return res.status(404).status({ json: "item not found" });
    } else {
      if (req.user?.favArticles.length > 0) {
        const checkUserAlreadyadded = req.user.favArticles.find(
          (el) => el.postId.toString() === postId
        );
        if (checkUserAlreadyadded) {
          const removeUser = await User.findOneAndUpdate(
            { userId: req.user.userId },
            {
              $pull: { favArticles: { postId } },
            },
            {
              new: true,
            }
          );

          return res
            .status(201)
            .json({ message: "removed", userdata: removeUser });
        }
      }
      const result = await User.findOneAndUpdate(
        { userId: req.user.userId },
        {
          $push: { favArticles: { postId } },
        },
        {
          new: true,
        }
      );

      return res.status(201).json({ message: "Added", userdata: result });
    }
  } catch (error) {
    console.log(error);
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
