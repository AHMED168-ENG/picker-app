const BreakRequestsModel = require("./break_requests");
const BreakTypesModel = require("./break_types");
const PickerUsersModel = require("./picker_users");
const PickerUserSessionModel = require("./picker_sections");
const accessToken = require("./access_token");
const StoresModel = require("./stores");
const OrdersModel = require("./orders");
const OrdersDetailModel = require("./orders_detail");
const ProductsLocalesModel = require("./products_locales");
const ProductsModel = require("./products");
const UnitModel = require("./unit");
const UomModel = require("./uom");
const UomImageRelationModel = require("./uom_image");
const UomBarcodeRelationModel = require("./uom_barcode_relation");
const NotificationsModel = require("./notifications");
const UsersModel = require("./users");
const PickerResponseTimeModel = require("./picker_response_times");

// تحديد العلاقات بشكل صحيح
OrdersModel.hasMany(OrdersDetailModel, { foreignKey: "orderId" });
OrdersDetailModel.belongsTo(OrdersModel, { foreignKey: "orderId" });
OrdersDetailModel.belongsTo(ProductsModel, { foreignKey: "productId" });
ProductsModel.hasMany(OrdersDetailModel, { foreignKey: "productId" });
ProductsModel.hasMany(ProductsLocalesModel, { foreignKey: "productId" });
// ProductsModel.hasMany(UomModel, { foreignKey: 'productId'  });
ProductsModel.hasOne(UomModel, {
  foreignKey: "productId",
  as: "defaultUom",
});
UomModel.belongsTo(ProductsModel, { foreignKey: "productId" });
UomModel.hasMany(UomBarcodeRelationModel, { foreignKey: "uomId" });
UomBarcodeRelationModel.belongsTo(UomModel, { foreignKey: "uomId" });
// UomModel.hasMany(UomImageRelationModel, { foreignKey: 'uomId' });
UomModel.hasOne(UomImageRelationModel, {
  foreignKey: "uomId",
  as: "defaultImage",
});

UomModel.belongsTo(UnitModel, { foreignKey: "unitId" });
StoresModel.hasMany(OrdersModel, { foreignKey: "storeId" });

// إضافة العلاقات
OrdersModel.hasMany(PickerResponseTimeModel, {
  foreignKey: "orderId",
  as: "responseTimes",
});

OrdersDetailModel.hasMany(PickerResponseTimeModel, {
  foreignKey: "orderDetailId",
  as: "responseTimes",
});

ProductsModel.hasMany(PickerResponseTimeModel, {
  foreignKey: "productId",
  as: "responseTimes",
});

PickerResponseTimeModel.belongsTo(OrdersModel, {
  foreignKey: "orderId",
});

PickerResponseTimeModel.belongsTo(OrdersDetailModel, {
  foreignKey: "orderDetailId",
});

PickerResponseTimeModel.belongsTo(ProductsModel, {
  foreignKey: "productId",
});

module.exports = {
  BreakRequestsModel,
  BreakTypesModel,
  PickerUsersModel,
  PickerUserSessionModel,
  accessToken,
  StoresModel,
  OrdersModel,
  OrdersDetailModel,
  ProductsLocalesModel,
  ProductsModel,
  UnitModel,
  UomModel,
  UomImageRelationModel,
  UomBarcodeRelationModel,
  NotificationsModel,
  UsersModel,
  PickerResponseTimeModel,
};
