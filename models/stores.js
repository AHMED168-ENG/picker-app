const { sequelize } = require("../config/database");
const { Sequelize, DataTypes, literal } = require("sequelize");
let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "stores",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    businessTypeId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    business_address: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    slug: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    zone_number: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    street_number: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    building_number: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    apartment_number: {
      type: Sequelize.STRING(500),
      defaultValue: "",
    },
    latitude: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    longitude: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    country: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    business_logo: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    recommended: {
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
    online: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    online_status_change_time: {
      type: "TIMESTAMP",
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    is_approved: {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
    },
    admin_commission: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    order_accept_time: {
      type: Sequelize.INTEGER,
      defaultValue: 10,
    },
    order_time_for_picker: {
      type: Sequelize.INTEGER,
      defaultValue: 10,
    },
    reason_of_reject: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    zoneId: {
      type: Sequelize.STRING,
      defaultValue: ",57,58,",
    },
    open247: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    category_update_status: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    store_key: {
      type: Sequelize.STRING,
      defaultValue: "KHYUIS7L3xa07dsfgdyWA8dMRRsFkc1sfd3432jLB",
    },
    market_place: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    delivery_charges: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    thirdPartyId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    cuisineId: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    banner_image: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    trending: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    online_status: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ranking: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    store_id_tp: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    deliveryPartner: {
      type: Sequelize.STRING(100),
      defaultValue: "tookan",
    },
    parent_id: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    online_status_not_update_by_cron: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    supportingCash: {
      type: Sequelize.STRING(50),
      defaultValue: "yes",
    },
    pagination: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    items_per_page: {
      type: Sequelize.INTEGER,
      defaultValue: 50,
    },
    customDelivery: {
      type: Sequelize.STRING(50),
      defaultValue: "no",
    },
    customDeliveryCharge: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    minimum_order_value: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    on_placed_complete: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    account_manager: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    tags: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    isDeliveryNow: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    delivery_fee_onby_baladi: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    delivery_fee_onby_vendor: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    bank_fee_onby_baladi: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    bank_fee_onby_vendor: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "stores",
  }
);
