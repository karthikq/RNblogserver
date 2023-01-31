const express = require("express");

const { isAuth } = require("../middleware/isAuth");
const route = express.Router();
const { getUserData, addTofav } = require("../controller/userController");

route.patch("/addtofav/:postId", isAuth, addTofav);
route.get("/:userId", getUserData);

module.exports = route;
