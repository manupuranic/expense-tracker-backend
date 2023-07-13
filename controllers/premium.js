const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../utils/database");

exports.getLeaderboards = async (req, res, next) => {
  // const leaderboard = await User.findAll({
  //   attributes: [
  //     "id",
  //     "userName",
  //     [sequelize.fn("sum", sequelize.col("amount")), "totalExpense"],
  //   ],
  //   include: [
  //     {
  //       model: Expense,
  //       attributes: [],
  //     },
  //   ],
  //   group: ["user.id"],
  //   order: [["totalExpense", "DESC"]],
  // });
  const leaderboard = await User.findAll({
    attributes: ["userName", "totalExpense"],
    order: [["totalExpense", "DESC"]],
  });
  res.json(leaderboard);
};
