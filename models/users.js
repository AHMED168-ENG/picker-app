const { sequelize } = require("../config/database");
const { Sequelize, DataTypes, literal } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "users",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    full_name: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    email: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    password: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    country_code: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    contact_number: {
      type: Sequelize.BIGINT,
      defaultValue: 0,
    },
    other_email: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    order_request_time: {
      type: Sequelize.INTEGER,
      default: 10,
    },
    commission: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    auth_required: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    forgot_password_code: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    password_code_time: {
      type: "TIMESTAMP",
      defaultValue: null,
    },
    role: {
      type: Sequelize.ENUM,
      values: ["user", "vendor", "admin", "subadmin"],
      defaultValue: "user",
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
      type: DataTypes.DATE, //"TIMESTAMP",
      defaultValue: literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE, //"TIMESTAMP",
      defaultValue: literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM,
      values: ["active", "inactive", "deleted"],
      defaultValue: "inactive",
    },
    last_login: {
      type: "TIMESTAMP",
      defaultValue: null,
    },
    admin_approved: {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
    },
    old_password1: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    old_password2: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    registration_step1: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    registration_step2: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    registration_step3: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    language: {
      type: Sequelize.STRING(50),
      defaultValue: "en",
    },
    gateway_customer_id: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    subadminRoleId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mpgsToken: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    google_auth_hash: {
      type: Sequelize.STRING(500),
      defaultValue: "",
    },
    email_verified_at: {
      type: "TIMESTAMP",
      defaultValue: null,
    },
    gender: {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: null,
    },
    dob: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    },
    receive_offers: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    newsletter: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
  }
);
