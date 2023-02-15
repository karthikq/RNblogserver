const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");

exports.isAuth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    const error = new Error("User not authorized");
    error.statusCode = 402;
    throw error;
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    const error = new Error("Invalid Token");
    error.statusCode = 400;
    throw error;
  }

  jwt.verify(token, process.env.JWT_SECRECT, async (err, decodedToken) => {
    try {
      if (err) {
        console.log(err.message);
        const error = new Error("User session expired");
        error.type = "token";
        error.statusCode = 502;
        throw error;
      }
      if (!decodedToken) {
        const error = new Error("User not authorized");
        error.statusCode = 403;
        throw error;
      }
      if (decodedToken) {
        const userData = await User.findOne({ userId: decodedToken.userId });
        if (!userData) {
          const error = new Error("Please login");
          error.statusCode = 500;
          next(error);
        }
        req.user = userData;
        next();
      }
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  });
};
