const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const FileDownloads = sequelize.define("fileDownloads", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fileUrl: Sequelize.STRING,
  date: Sequelize.DATE,
});

module.exports = FileDownloads;
