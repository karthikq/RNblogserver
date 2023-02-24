const Post = require("../models/Posts");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const Mailer = require("../mail/Mailer");
const { notification } = require("./NotificationController");

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
            .populate("followers.user")
            .populate("following.user")
            .populate("notifications.user")
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
        .populate("followers.user")
        .populate("following.user")
        .populate("notifications.user")
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
      .populate("followers.user")
      .populate("following.user")
      .populate("notifications.user")
      .exec();
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

  const { username, phone, userImage, gender, userCountry } = req.body;

  try {
    if (username.length > 15) {
      const error = new Error("Username must bee less than 15 char's");
      error.statusCode = 402;
      error.type = "username";
      throw error;
    }
    const findUser = await User.findOne({ userId });
    if (!findUser) {
      const error = new Error("User not found");
      error.statusCode = 400;
      error.type = "username";
      throw error;
    }
    const checkUserName = await User.findOne({ username });
    if (checkUserName) {
      if (checkUserName.userId !== userId) {
        const error = new Error("Username already exist's");
        error.statusCode = 400;
        error.type = "username";
        throw error;
      }
    }

    const updateUser = await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          username,
          gender,
          phone,
          userImage,
          userCountry,
        },
      },
      {
        new: true,
      }
    )
      .populate("favArticles.postId")
      .populate("followers.user")
      .populate("following.user")
      .populate("notifications.user")
      .exec();

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
exports.addFollower = async (req, res, next) => {
  //fetchedUser
  const { userId } = req.params;
  const loggedUser = req.user._id;
  console.log(userId, loggedUser);
  try {
    const findUser = await User.findOne({ _id: userId });
    if (!findUser) {
      const error = new Error("User doesn't exists");
      error.statusCode = 400;
      throw error;
    }
    const ifalreadyfollowing = findUser.followers.some(
      (user) => user.user.toString() === loggedUser.toString()
    );
    console.log(ifalreadyfollowing, "al");
    if (ifalreadyfollowing) {
      const updateFollower = await User.findOneAndUpdate(
        { _id: userId },
        {
          $pull: { followers: { user: loggedUser } },
        },
        { new: true }
      )
        .populate("favArticles.postId")
        .populate("followers.user")
        .populate("following.user")
        .populate("notifications.user")
        .exec();

      const updatecurrentUser = await User.findOneAndUpdate(
        { _id: loggedUser },
        {
          $pull: { following: { user: userId } },
        },
        { new: true }
      )
        .populate("favArticles.postId")
        .populate("followers.user")
        .populate("following.user")
        .populate("notifications.user")
        .exec();
      return res.status(201).json({
        message: "Follower removed",
        userdata: updateFollower,
        currentuserdata: updatecurrentUser,
      });
    } else {
      const notificationDetails = {
        message: req.user.username + " started following you",
        date: new Date().toISOString(),
        user: loggedUser,
      };
      const addFollower = await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            followers: { user: loggedUser },
            notifications: notificationDetails,
          },
        },
        { new: true }
      )
        .populate("favArticles.postId")
        .populate("followers.user")
        .populate("following.user")
        .populate("notifications.user")
        .exec();

      const currentnotificationDetails = {
        message: "You started following " + findUser.username,
        date: new Date().toISOString(),
        user: userId,
      };
      const updatecurrentUser = await User.findOneAndUpdate(
        { _id: loggedUser },
        {
          $push: {
            following: { user: userId },
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

      //sending notification to user
      const messageTitle = "New Follower";
      const messageBody = updatecurrentUser.username + " started Following you";
      const deviceToken = addFollower.deviceToken && addFollower.deviceToken;
      if (addFollower.deviceToken) {
        await notification(
          messageTitle,
          messageBody,
          updatecurrentUser.userImage,
          deviceToken
        );
      }

      return res.status(201).json({
        message: "Follower added",
        userdata: addFollower,
        currentuserdata: updatecurrentUser,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.addToken = async (req, res, next) => {
  const { userId, token, ipaddress } = req.body;

  try {
    if (!userId || !token) {
      console.log("field are required");
    }
    const findUser = await User.findOne({ userId })
      .populate("favArticles.postId")
      .populate("followers.user")
      .populate("following.user")
      .populate("notifications.user")
      .exec();
    if (findUser) {
      findUser.deviceToken = token;
      findUser.userNetwork = ipaddress;

      await findUser.save();
      return res.status(201).json({ userdata: findUser });
    }
  } catch (error) {
    console.log(error);
  }
};
exports.Notificationup = async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      console.log("field are required");
    }
    const findUser = await User.findOne({ userId });

    if (findUser) {
      await User.updateMany(
        { userId },
        {
          $set: {
            "notifications.$[].isRead": true,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      const updatedUser = await User.findOne({ userId })
        .populate("favArticles.postId")
        .populate("followers.user")
        .populate("following.user")
        .populate("notifications.user")
        .exec();
      return res.status(201).json({ userdata: updatedUser });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.RemoveNotificaitons = async (req, res, next) => {
  const { notiId } = req.params;
  const userId = req.user.userId;
  console.log(notiId, userId);
  try {
    if (!notiId) {
      console.log("field are required");
    }
    const findUser = await User.findOne({ userId });

    if (findUser) {
      const updatedUser = await User.findOneAndUpdate(
        { userId },
        {
          $pull: {
            notifications: { _id: notiId },
          },
        },
        {
          new: true,
        }
      )
        .populate("favArticles.postId")
        .populate("followers.user")
        .populate("following.user")
        .populate("notifications.user")
        .exec();
      return res.status(201).json({ userdata: updatedUser });
    } else {
      const error = new Error("User not found");
      error.statusCode = 500;
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
};

// exports.addNotification = async (req, res, next) => {
//   const { userId } = req.params;
//   const findUser = await User.findOne({ userId });
//   if (!findUser) {
//     const error = new Error("User doesn't exists");
//     error.statusCode = 400;
//     throw error;
//   }

// };
