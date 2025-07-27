const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "access_tokens",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    device_id: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    access_token: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    createdAt: {
      type: "TIMESTAMP",
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: "TIMESTAMP",
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
  },
  {
    tableName: "access_tokens",
  }
);
