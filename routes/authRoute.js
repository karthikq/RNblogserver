const express = require("express");
const { loginRoute, singUpRoute } = require("../controller/AuthController");
const route = express.Router();
const { body, validationResult } = require("express-validator");

route.post(
  "/login",
  body("email").isEmail().withMessage("Email is not valid").normalizeEmail(),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be 5 character's long"),
  loginRoute
);
route.post(
  "/signup",
  body("email").isEmail().withMessage("Email is not valid").normalizeEmail(),
  body("username").trim().escape(),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be 5 character's long"),

  singUpRoute
);
module.exports = route;
