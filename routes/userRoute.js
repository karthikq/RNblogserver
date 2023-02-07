const express = require("express");

const { isAuth } = require("../middleware/isAuth");
const route = express.Router();
const {
  getUserData,
  addTofav,
  generateOpt,
  checkToken,
  resetPassoword,
  updateUser,
} = require("../controller/userController");

route.patch("/addtofav/:postId", isAuth, addTofav);
route.get("/:userId", getUserData);
route.post("/reset/pass", generateOpt);
route.post("/check/token", checkToken);
route.post("/password/reset", resetPassoword);
route.patch("/update/:id", isAuth, updateUser);

module.exports = route;
