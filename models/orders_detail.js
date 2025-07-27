const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "orders_detail",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    orderId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    productId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    quantity: {
      type: Sequelize.STRING(255),
      defaultValue: "",
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
    uomId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    addonIds: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    addons_json: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    addonPrice: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    specialRequest: {
      type: Sequelize.STRING(500),
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
      type: Sequelize.ENUM,
      values: ["active", "inactive", "deleted"],
      defaultValue: "inactive",
    },
    offers: {
      type: Sequelize.JSON,
      defaultValue: {},
    },
    picker_status: {
      type: Sequelize.STRING(50),
      defaultValue: "", //pending,pickedup
    },
    qc_status: {
      type: Sequelize.STRING(50),
      defaultValue: "", //pending,collect,revert,completed
    },
    qc_status_log: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    stock: {
      type: Sequelize.STRING(50),
      defaultValue: "in",
    },
    stock: {
      type: Sequelize.STRING(50),
      defaultValue: "in",
    },
    categoryId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "orders_detail",
  }
);
