const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userName: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  isPremium: Sequelize.BOOLEAN,
  totalExpense: Sequelize.DOUBLE,
});

module.exports = User;
