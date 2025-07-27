const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "uom",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    productId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    relationWithBase: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    uomName: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    uomNameEr: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    unitId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    price: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    salePrice: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    costPrice: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    retailPrice: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    stock: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    isDefault: {
      type: Sequelize.INTEGER,
      defaultValue: 0, //0,1
    },
    stockQuantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    threshold: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
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
    UoMCode: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    UoMEntry: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    product_expiry: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    product_manufacture: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    wholesalePrice: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
  },
  {
    tableName: "uom",
  }
);
