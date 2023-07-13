const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const Expense = sequelize.define("expense", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: Sequelize.DOUBLE,
  desc: Sequelize.STRING,
  category: Sequelize.STRING,
});

module.exports = Expense;
