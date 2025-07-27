const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "break_requests",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    pickerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    breakTypeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    storeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    requestNote: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    voiceNote: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM("pending", "approved", "rejected", "cancelled"),
      defaultValue: "pending",
    },
    managerId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    managerNote: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
  },
  {
    tableName: "break_requests",
  }
);
