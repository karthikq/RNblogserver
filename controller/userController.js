const Post = require("../models/Posts");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const Mailer = require("../mail/Mailer");

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
          )
            .populate("favArticles.postId")
            .exec();

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
      )
        .populate("favArticles.postId")
        .exec();

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
    const findUser = await User.findOne({ userId })
      .populate("favArticles.postId")
      .exec();
    console.log(findUser);
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

exports.generateOpt = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error("User is not valid");
      error.statusCode = 400;
      throw error;
    }

    const FindUser = await User.findOne({ email });

    if (!FindUser) {
      const error = new Error("User not found");
      error.statusCode = 400;
      throw error;
    }

    const token = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    await Mailer(email, token);

    FindUser.resetToken = token;
    FindUser.resetTokenExpirationDate = new Date() + 360000;
    FindUser.save();

    return res.status(200).json({ message: "OTP is " + token });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.checkToken = async (req, res, next) => {
  try {
    const { usertoken, email } = req.body;
    if (!usertoken || !email || usertoken.length < 6) {
      const error = new Error("User and OTP is not valid");
      error.statusCode = 400;
      throw error;
    }

    if (usertoken) {
      const checkTokenValidity = await User.findOne({
        resetToken: usertoken,
        email,
        resetTokenExpirationDate: {
          $gt: Date.now(),
        },
      });

      if (!checkTokenValidity) {
        const error = new Error("Token not valid or it's expired");
        error.statusCode = 400;
        throw error;
      }
      checkTokenValidity.resetToken = "";
      checkTokenValidity.resetTokenExpirationDate = "";
      return res.status(200).json({ message: "User Token is valid" });
    }
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.resetPassoword = async (req, res, next) => {
  try {
    const { password, confirmpassword, email } = req.body;
    if (
      !password ||
      !confirmpassword ||
      password !== confirmpassword ||
      password.length < 5
    ) {
      const error = new Error("Password is not valid");
      error.statusCode = 400;
      throw error;
    }
    console.log(req.body);
    const findUser = await User.findOne({ email });
    if (!findUser) {
      const error = new Error("User not found");
      error.statusCode = 400;
      throw error;
    }
    findUser.password = password;
    findUser.save();

    return res.status(200).json({ message: "password saved" });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  const userId = req.body.userId;
  console.log(req.body, "asdsd");
  const { username, phone, userImage, gender } = req.body;
  try {
    const findUser = await User.findOne({ userId });
    if (!findUser) {
      const error = new Error("User not found");
      error.statusCode = 400;
      throw error;
    }

    const updateUser = await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          username,
          gender,
          phone,
          userImage,
        },
      },
      {
        new: true,
      }
    );
    console.log(updateUser);
    return res
      .status(201)
      .json({ message: "user updated", userdata: updateUser });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
