const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "picker_users",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    first_name: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    last_name: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    email: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    contact_number: {
      type: Sequelize.BIGINT,
      defaultValue: 0,
    },
    password: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    language: {
      type: Sequelize.STRING(50),
      defaultValue: "en",
    },
    role: {
      type: Sequelize.STRING(50),
      defaultValue: "picker",
    },
    wallet_amount: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    last_wallet_amount: {
      type: Sequelize.DOUBLE,
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
    status: {
      type: Sequelize.STRING(50),
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
    wallet_amount_c: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    last_wallet_amount_c: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    online: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    picker_state: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    store_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "picker_users",
  }
);
