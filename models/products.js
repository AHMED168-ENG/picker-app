const { sequelize } = require("../config/database");
const { Sequelize, DataTypes, literal } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "products",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
      unique: true,
    },
    storeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: "store",
        key: "id",
      },
    },
    itemCode: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    categoryId: {
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
      type: DataTypes.DATE,
      defaultValue: literal("CURRENT_TIMESTAMP"), //moment().format('YYYY-MM-DD HH:mm:ss'),//Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: literal("CURRENT_TIMESTAMP"), //moment().format('YYYY-MM-DD HH:mm:ss'),//Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM,
      values: ["active", "inactive", "deleted"],
      defaultValue: "active",
    },
    is_approved: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    slug: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    reason_of_reject: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    availability_start_time: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    availability_end_time: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    uom_data: {
      type: Sequelize.TEXT,
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
    retialPrice: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    stockQuantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    baseUomId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    product_id_tp: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    brandId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_suggestion: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    maxQuantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    tag: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    preferred: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    selected_campagin_product: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "products",
  }
);
