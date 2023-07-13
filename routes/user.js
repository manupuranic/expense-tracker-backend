const express = require("express");

const userController = require("../controllers/user");
const userAuthentication = require("../middleware/auth");

const router = express.Router();

router.post("/sign-up", userController.postSignUpUser);

router.post("/login", userController.postLoginUser);

router.get("/", userAuthentication.authenticate, userController.getUser);

module.exports = router;
