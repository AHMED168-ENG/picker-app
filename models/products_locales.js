const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "products_locales",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    productId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: "product",
        key: "id",
      },
    },
    locale: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    title: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    description: {
      type: Sequelize.TEXT,
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
    status: {
      type: Sequelize.ENUM,
      values: ["active", "inactive", "deleted"],
      defaultValue: "active",
    },
  },
  {
    tableName: "products_locales",
  }
);
