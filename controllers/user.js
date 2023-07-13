const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../utils/database");

const generateWebToken = (id, isPremium) => {
  return jwt.sign({ userId: id, isPremium: isPremium }, process.env.JWT_SECRET);
};

exports.postSignUpUser = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { userName, email, password } = req.body;
  try {
    const user = await User.findAll(
      { where: { email: email } },
      { transaction: t }
    );
    if (user.length !== 0) {
      res.json({
        message: "User already exists!",
      });
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        console.log(err);
        const result = await User.create(
          {
            userName: userName,
            email: email,
            password: hash,
            isPremium: false,
            totalExpense: 0,
          },
          { transaction: t }
        );
        await t.commit();
        res.json(result.dataValues);
      });
    }
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
};

exports.postLoginUser = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findAll({ where: { email: email } });
    if (user.length === 0) {
      res.status(404).json({
        message: "User not found",
        success: false,
      });
    } else {
      const result = await bcrypt.compare(password, user[0].password);
      if (result === true) {
        res.json({
          message: "User logged in Successfully",
          success: true,
          token: generateWebToken(user[0].id, user[0].isPremium),
        });
      } else {
        res.status(401).json({
          message: "Password do not match",
          success: false,
        });
      }
    }
  } catch (err) {
    res.json({
      success: false,
      message: err,
    });
  }
};

exports.getUser = async (req, res, next) => {
  const user = req.user;
  return res.json(req.user);
};
