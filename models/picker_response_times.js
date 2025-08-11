const { sequelize } = require("../config/database");
const { Sequelize, DataTypes, literal } = require("sequelize");

let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "picker_response_times",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    orderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    orderDetailId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "orders_details",
        key: "id",
      },
    },
    pickerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    storeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "stores",
        key: "id",
      },
    },
    productId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal("CURRENT_TIMESTAMP"),
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    response_time_seconds: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Response time in seconds",
    },
    item_status: {
      type: Sequelize.ENUM(
        "out_of_stock",
        "quantity_insufficient",
        "item_canceled",
        "picked_successfully",
        "replaced"
      ),
      allowNull: true,
    },
    original_quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    picked_quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    notes: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    is_completed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
      defaultValue: literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING(50),
      defaultValue: "active",
    },
  },
  {
    tableName: "picker_response_times",
    indexes: [
      {
        unique: true,
        fields: ["orderId", "orderDetailId", "pickerId"],
        name: "unique_order_item_picker",
      },
      {
        fields: ["orderId"],
      },
      {
        fields: ["pickerId"],
      },
      {
        fields: ["storeId"],
      },
    ],
  }
);
