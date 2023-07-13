const jwt = require("jsonwebtoken");
const User = require("../models/user");
exports.authenticate = async (req, res, next) => {
  const token = req.header("Authentication");
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(tokenData.userId);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
};
