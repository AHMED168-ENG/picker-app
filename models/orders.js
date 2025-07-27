const { sequelize } = require("../config/database");
const { Sequelize, DataTypes, literal } = require("sequelize");

let moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");

module.exports = sequelize.define(
  "orders",
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
    order_id: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    storeId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    driverId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    addressId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    addressJson: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    deliver: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    delivery_date: {
      type: Sequelize.DATEONLY,
      defaultValue: null,
    },
    delivery_time: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    addons_total: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    sub_total: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    delivery_charges: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    tax: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    total_amount: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    total_quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    payment_method: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    payment_status: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    created_by: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    rejected_by: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    updated_by: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE, //"TIMESTAMP",
      defaultValue: literal("CURRENT_TIMESTAMP"), // moment().format('YYYY-MM-DD HH:mm:ss'),//Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE, //"TIMESTAMP",
      defaultValue: literal("CURRENT_TIMESTAMP"), //moment().format('YYYY-MM-DD HH:mm:ss'),//Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    order_status_log: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    reason_of_reject: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    pickup_job_id: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    delivery_job_id: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    delivery_job_hash: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    pickup_job_hash: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    job_pickup_name: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    job_pickup_address: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    job_token: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    pickup_tracking_link: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    delivery_tracing_link: {
      type: Sequelize.STRING(255),
      defaultValue: "",
    },
    pickupAddressNotFound: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    deliveryAddressNotFound: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    invoice: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    invoice_ar: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    invoice_mobile: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    invoice_mobile_ar: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    qc_status: {
      type: Sequelize.STRING(50), //pending,ready,in_qc,completed
      defaultValue: "",
    },
    qcId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    delivery_date_time: {
      type: "TIMESTAMP",
      defaultValue: null,
    },
    specialRequest: {
      type: Sequelize.STRING(500),
      defaultValue: "",
    },
    coupon_code: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    coupon_data: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    discount: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    couponId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    device_type: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    store_reviewed: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    driver_reviewed: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pickerId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    picker_status: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    shipsy_status: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    offer_amount: {
      type: Sequelize.DOUBLE,
      defaultValue: 0,
    },
    inpick_threshold: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    inqc_threshold: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    in_pick_color: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    in_qc_color: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    receiverDetail: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    b2b: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    LPO_number: {
      type: Sequelize.TEXT,
      defaultValue: "",
    },
    baladi_discount_hold: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    vendor_discount_hold: {
      type: Sequelize.FLOAT,
      allowNull: true,
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
    tableName: "orders",
  }
);
