const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "notifications",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    role: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    read: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    message: {
      type: Sequelize.STRING(500),
      defaultValue: "",
    },
    type: {
      //order,store,product,payout
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    itemId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    orderId: {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "",
    },
    createdAt: {
      type: "TIMESTAMP",
      defaultValue: moment().format("YYYY-MM-DD HH:mm:ss"), //Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: "TIMESTAMP",
      defaultValue: moment().format("YYYY-MM-DD HH:mm:ss"), //Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
  },
  {
    tableName: "notifications",
  }
);
