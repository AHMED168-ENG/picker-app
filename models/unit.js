const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "unit",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    created_by: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    updated_by: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
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
    status: {
      type: Sequelize.ENUM,
      values: ["active", "inactive", "deleted"],
      defaultValue: "active",
    },
  },
  {
    tableName: "unit",
  }
);
