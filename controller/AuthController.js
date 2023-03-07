const User = require("../models/User");
const moment = require("moment");
const { validationResult } = require("express-validator");

const { v4: nanoid } = require("uuid");
const jwt = require("jsonwebtoken");

exports.loginRoute = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const CheckUser = await User.findOne({ email })
      .select("+password")
      .populate("favArticles.postId")
      .exec();
    if (!CheckUser) {
      const error = new Error("Email Not found");
      error.statusCode = 401;
      error.type = "email";
      throw error;
    }
    await CheckUser.comparePassword(password, (err, isMatch) => {
      try {
        if (!isMatch) {
          const error = new Error("Invalid Credentials");
          error.statusCode = 401;
          error.type = "password";
          throw error;
        }
        const userId = CheckUser.userId;
        const token = jwt.sign({ email, userId }, process.env.JWT_SECRECT, {
          expiresIn: "72hr",
        });

        return res.status(200).json({
          message: "user created",
          token,
          userdata: CheckUser,
        });
      } catch (error) {
        if (!error.statusCode) {
          error.statusCode = 500;
        }

        next(error);
      }
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};
exports.singUpRoute = async (req, res, next) => {
  const { email, password, username, userImage } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (!email || !password || !username) {
    return res.status(400).json({ message: "All field are required" });
  }
  try {
    const CheckUser = await User.findOne({ email });

    if (CheckUser) {
      const error = new Error("Email already exists");
      error.statusCode = 401;
      error.type = "email";
      throw error;
    }

    const checkUserName = await User.findOne({ username });

    if (checkUserName) {
      const error = new Error("Username already exist's");
      error.statusCode = 400;
      error.type = "username";
      throw error;
    }

    const userId = nanoid();
    const usercreated_at = new Date().toISOString();
    const date = moment().format("MMM Do YY");

    const newUser = new User({
      email,
      password,
      username,
      userId,
      usercreated_at,
      date,
      userImage,
    });
    let userdata = await newUser.save();
    const token = jwt.sign({ email, userId }, process.env.JWT_SECRECT, {
      expiresIn: "72hr",
    });

    userdata.password = "";
    delete userdata.password;

    return res.status(201).json({
      message: "user created",
      token,
      userdata,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};
