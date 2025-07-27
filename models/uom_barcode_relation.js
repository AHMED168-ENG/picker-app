const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "uom_barcode_relation",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    uomId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    barcode: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    location: {
      //product section location on baladimart
      type: Sequelize.TEXT,
      defaultValue: "",
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
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
  },
  {
    tableName: "uom_barcode_relation",
  }
);
