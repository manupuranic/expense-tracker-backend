const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const ForgotPasswordRequests = sequelize.define("forgotPasswordRequests", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  isActive: Sequelize.BOOLEAN,
});

module.exports = ForgotPasswordRequests;
