require("dotenv").config();
const { Op, sequelize } = require("sequelize");
const moment = require("moment");
const notificationService = require("../services/notification");
const language = require("../language/index");

const {
  OrdersModel,
  OrdersDetailModel,
  ProductsModel,
  ProductsLocalesModel,
  UomModel,
  UomBarcodeRelationModel,
  StoresModel,
  UomImageRelationModel,
  UnitModel,
} = require("../models/index");

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

const data = {};

// جلب الطلبات غير المعينة (Unassigned Orders)
data.getUnassignedOrders = async (req, res) => {
  try {
    let lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const storeId = auth_data.store_id;
    const where = {
      storeId,
      picker_status: "pending_pickup",
      status: ["processing", "placed"],
    };

    const orders = await OrdersModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      attributes: [
        "id",
        "order_id",
        "status",
        "createdAt",
        "delivery_date_time",
        "total_amount",
        "delivery_charges",
        "payment_method",
        "picker_status",
      ],
      include: [
        {
          model: OrdersDetailModel,
          attributes: [
            "id",
            "productId",
            "quantity",
            "price",
            "specialRequest",
          ],
          where: { status: "active" },
          required: false,
          include: [
            {
              model: ProductsModel,
              attributes: ["id", "storeId", "itemCode", "categoryId"],
              include: [
                {
                  model: UomModel,
                  as: "defaultUom",
                  attributes: [
                    "id",
                    "quantity",
                    "unitId",
                    "price",
                    "salePrice",
                    "retailPrice",
                    "stock",
                    "isDefault",
                    "uomName",
                  ],
                  // limit: 1,
                  include: [
                    {
                      model: UnitModel,
                      attributes: ["id"],
                    },
                    {
                      model: UomImageRelationModel,
                      attributes: ["id", "uomId", "image", "type"],
                      as: "defaultImage",
                      // limit: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      ack: 1,
      orders: orders.rows,
      totalCount: orders.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(orders.count / limit),
    });
  } catch (e) {
    console.error("Error in getUnassignedOrders:", e);
  }
};

// جلب الطلبات المعينة (Assigned Orders)
data.getAssignedOrders = async (req, res) => {
  try {
    let lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const storeId = auth_data.store_id;
    const where = {
      storeId,
      picker_status: ["in_pick", "repick"],
      pickerId: auth_data.id,
      status: ["processing", "placed"],
    };

    const orders = await OrdersModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      attributes: [
        "id",
        "order_id",
        "status",
        "createdAt",
        "delivery_date_time",
        "total_amount",
        "delivery_charges",
        "payment_method",
        "picker_status",
      ],
      include: [
        {
          model: OrdersDetailModel,
          attributes: [
            "id",
            "productId",
            "quantity",
            "price",
            "specialRequest",
            "picker_status",
          ],
          where: { status: "active" },
          required: false,
          include: [
            {
              model: ProductsModel,
              attributes: ["id", "storeId", "itemCode", "categoryId"],
              include: [
                {
                  model: UomModel,
                  as: "defaultUom",
                  attributes: [
                    "id",
                    "quantity",
                    "unitId",
                    "price",
                    "salePrice",
                    "retailPrice",
                    "stock",
                    "isDefault",
                    "uomName",
                  ],
                  // limit: 1,
                  include: [
                    {
                      model: UnitModel,
                      attributes: ["id"],
                    },
                    {
                      model: UomImageRelationModel,
                      as: "defaultImage", // لازم تعرف العلاقة دي كمان كـ hasOne
                      attributes: ["id", "uomId", "image", "type"],
                      // limit: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      ack: 1,
      orders: orders.rows,
      totalCount: orders.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(orders.count / limit),
    });
  } catch (e) {
    console.error("Error in getAssignedOrders:", e);
  }
};

// تخصيص طلب (Assign Order)
data.assignOrder = async (req, res) => {
  try {
    let lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        ack: 0,
        msg: "Order ID is required",
      });
    }

    const order = await OrdersModel.findAll({
      where: {
        id: orderId,
        storeId: auth_data.store_id,
        picker_status: "pending_pickup",
      },
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang]?.picker?.order_not_found || "Order not found",
      });
    }

    // التحقق من عدم وجود طلب مخصص بالفعل للبيكر
    const assignedOrder = await OrdersModel.findOne({
      where: { pickerId: auth_data.id, picker_status: ["in_pick", "repick"] },
    });

    // if (assignedOrder) {
    //   return res.status(400).json({
    //     ack: 0,
    //     msg: language[lang]?.picker?.one_order_at_a_time || "You can only work on one order at a time"
    //   });
    // }

    await OrdersModel.update(
      { picker_status: "in_pick", pickerId: auth_data.id },
      { where: { id: orderId } }
    );

    res.status(200).json({
      ack: 1,
      msg:
        language[lang]?.picker?.order_assigned || "Order assigned successfully",
    });
  } catch (e) {
    console.error("Error in assignOrder:", e);
  }
};

// إلغاء تخصيص طلب (Unassign Order)
data.unassignOrder = async (req, res) => {
  try {
    let lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { orderId } = req.body;

    const order = await OrdersModel.findOne({
      where: {
        id: orderId,
        pickerId: auth_data.id,
        picker_status: ["in_pick", "repick"],
      },
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang]?.picker?.order_not_found || "Order not found",
      });
    }

    await OrdersModel.update(
      { picker_status: "pending_pickup", pickerId: null },
      { where: { id: orderId } }
    );

    res.status(200).json({
      ack: 1,
      msg:
        language[lang]?.picker?.order_unassigned ||
        "Order unassigned successfully",
    });
  } catch (e) {
    console.error("Error in unassignOrder:", e);
  }
};

// جلب تفاصيل طلب معين
data.getOrderDetails = async (req, res) => {
  try {
    let lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { orderId } = req.params;

    const order = await OrdersModel.findOne({
      where: {
        id: orderId,
        storeId: auth_data.store_id,
        pickerId: auth_data.id,
      },
      attributes: [
        "id",
        "order_id",
        "status",
        "createdAt",
        "delivery_date_time",
        "total_amount",
        "delivery_charges",
        "payment_method",
        "picker_status",
      ],
      include: [
        {
          model: OrdersDetailModel,
          attributes: [
            "id",
            "productId",
            "quantity",
            "price",
            "specialRequest",
            "picker_status",
          ],
          where: { status: "active" },
          required: false,
          include: [
            {
              model: ProductsModel,
              attributes: ["id", "storeId", "itemCode", "categoryId"],
              include: [
                {
                  model: ProductsLocalesModel,
                  required: false,
                },
                {
                  model: UomModel,
                  as: "defaultUom", // لازم تعرف العلاقة دي كمان كـ hasOne
                  attributes: [
                    "id",
                    "quantity",
                    "unitId",
                    "price",
                    "salePrice",
                    "retailPrice",
                    "stock",
                    "isDefault",
                    "uomName",
                  ],
                  // limit: 1,
                  include: [
                    {
                      model: UnitModel,
                      attributes: ["id"],
                    },
                    {
                      model: UomImageRelationModel,
                      as: "defaultImage", // لازم تعرف العلاقة دي كمان كـ hasOne
                      attributes: ["id", "uomId", "image", "type"],
                      // limit: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang]?.picker?.order_not_found || "Order not found",
      });
    }

    res.status(200).json({ ack: 1, order });
  } catch (e) {
    console.error("Error in getOrderDetails:", e);
  }
};

data.updateOrderStatus = async (req, res) => {
  try {
    let lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { orderId } = req.body;

    const order = await OrdersModel.findOne({
      where: {
        id: orderId,
        storeId: auth_data.store_id,
        pickerId: auth_data.id,
        picker_status: "in_pick",
      },
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang]?.picker?.order_not_found || "Order not found",
      });
    }

    // التحقق من أن جميع العناصر تم تجهيزها
    const totalItems = await OrdersDetailModel.count({
      where: { orderId },
    });

    const pickedItems = await OrdersDetailModel.count({
      where: { orderId, picker_status: "pickedup" },
    });

    if (pickedItems < totalItems) {
      return res.status(400).json({
        ack: 0,
        msg:
          language[lang]?.picker?.all_items_not_picked ||
          "All items must be processed first",
      });
    }

    // الحصول على معلومات الفرع لمعرفة صاحب الفرع
    const store = await StoresModel.findOne({
      where: { id: order.storeId },
      attributes: ["userId", "id"], // userId هو صاحب الفرع
    });

    if (!store) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang]?.picker?.store_not_found || "Store not found",
      });
    }

    await OrdersModel.update(
      { picker_status: "completed" },
      { where: { id: orderId } }
    );

    // إرسال إشعار للعميل
    await notificationService.notifyCustomerOrderReady({
      customerId: order.userId,
      orderId: order.order_id,
    });

    // إرسال إشعار للمشرف
    await notificationService.notifyStoreOwnerOrderReadyForDelivery({
      storeId: store.userId,
      orderId: order.order_id,
      pickerId: auth_data.id,
      pickerName:
        auth_data?.first_name && auth_data?.last_name
          ? `${auth_data.first_name} ${auth_data.last_name}`
          : "Unknown",
    });

    res.status(200).json({
      ack: 1,
      msg: language[req.headers.lang || "en"].picker.status_updated,
    });
  } catch (e) {
    logger.error("Error: updateOrderStatus API - " + e);
  }
};

// دالة لتحديث حالة عنصر الطلب إلى pickedup
data.markItemAsPicked = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { orderId, itemId } = req.body; // يمكن استخدام itemId أو barcode لتحديد العنصر

    // التحقق من الطلب
    const order = await OrdersModel.findOne({
      where: {
        id: orderId,
        storeId: auth_data.store_id,
        pickerId: auth_data.id,
        picker_status: "in_pick",
      },
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.order_not_found,
      });
    }

    let orderDetail = await OrdersDetailModel.findOne({
      where: { id: itemId, orderId },
    });

    if (!orderDetail) {
      return res.status(404).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.item_not_found,
      });
    }

    await OrdersDetailModel.update(
      { picker_status: "pickedup" },
      { where: { id: orderDetail.id } }
    );

    res.status(200).json({
      ack: 1,
      msg: language[req.headers.lang || "en"].picker.item_picked_successfully,
    });
  } catch (e) {
    logger.error("Error: markItemAsPicked API - " + e.message);
  }
};

// دالة لإلغاء حالة عنصر الطلب من pickedup
data.unmarkItemAsPicked = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { orderId, itemId } = req.body; // يتم استخدام itemId لتحديد العنصر

    // التحقق من الطلب
    const order = await OrdersModel.findOne({
      where: {
        id: orderId,
        storeId: auth_data.store_id,
        pickerId: auth_data.id,
        picker_status: "in_pick",
      },
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.order_not_found,
      });
    }

    // التحقق من وجود العنصر
    const orderDetail = await OrdersDetailModel.findOne({
      where: { id: itemId, orderId },
    });

    if (!orderDetail) {
      return res.status(404).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.item_not_found,
      });
    }

    // التحقق من أن العنصر في حالة pickedup قبل الإلغاء
    if (orderDetail.picker_status !== "pickedup") {
      return res.status(400).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.item_not_picked_yet,
      });
    }

    // تحديث حالة العنصر إلى pending (أو الحالة الأصلية)
    await OrdersDetailModel.update(
      { picker_status: "" }, // يمكن تعديل "pending" حسب الحالة الأصلية
      { where: { id: orderDetail.id } }
    );

    res.status(200).json({
      ack: 1,
      msg: language[req.headers.lang || "en"].picker.item_unmarked_successfully,
    });
  } catch (e) {
    logger.error("Error: unmarkItemAsPicked API - " + e.message);
  }
};

// دالة Scan المنتج
data.scanProduct = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { orderId, barcode } = req.body;

    // التحقق من الطلب
    const order = await OrdersModel.findOne({
      where: {
        id: orderId,
        storeId: auth_data.store_id,
        pickerId: auth_data.id,
        picker_status: "in_pick",
      },
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.order_not_found,
      });
    }

    // البحث عن العلاقة باستخدام الباركود مع تحميل UomModel وOrdersDetailModel
    const barcodeRelation = await UomBarcodeRelationModel.findOne({
      include: [
        {
          model: UomModel,
          as: "uom", // الاسم الرمزي المفترض للعلاقة العكسي
          include: [
            {
              model: OrdersDetailModel,
              where: { orderId }, // فلترة حسب الطلب الحالي
            },
          ],
        },
      ],
      where: { barcode },
    });

    if (!barcodeRelation) {
      return res.status(400).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.invalid_barcode,
      });
    }

    // التحقق مما إذا كان الباركود ينتمي إلى عنصر في الطلب
    if (
      !barcodeRelation.uom ||
      !barcodeRelation.uom.orders_details ||
      barcodeRelation.uom.orders_details.length === 0
    ) {
      return res.status(400).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.barcode_not_in_order,
      });
    }

    // إرجاع تأكيد أن الباركود صالح وينتمي إلى الطلب
    res.status(200).json({
      ack: 1,
      msg: language[req.headers.lang || "en"].picker.barcode_valid,
      itemId: barcodeRelation.uom.orders_details[0].id, // إرجاع ID العنصر للاستخدام في markItemAsPicked
    });
  } catch (e) {
    console.log("Error:", e);
    logger.error("Error: scanProduct API - " + e.message);
  }
};

// إضافة دالة suggestProduct إلى الكائن data
data.suggestProduct = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { productId, uomId, limit = 10, page = 1 } = req.body;
    const lang = req.headers.lang || "en";
    const offset = (page - 1) * limit;

    // التحقق من وجود storeId للبيكر
    const storeId = auth_data.store_id;
    if (!storeId) {
      return res.status(400).json({
        ack: 0,
        msg: language[lang].picker.store_not_found,
      });
    }

    // البحث عن المنتج الأصلي لاستخلاص خصائصه
    let product;
    if (productId) {
      product = await ProductsModel.findOne({
        where: { id: productId },
        attributes: ["id", "storeId", "categoryId", "brandId", "itemCode"],
      });
    }
    // else if (uomId) {
    //   const uom = await UomModel.findOne({
    //     where: { id: uomId, status: "active" },
    //     include: [
    //       {
    //         model: ProductsModel,
    //         attributes: ["id", "storeId", "categoryId", "brandId", "itemCode"],
    //         where: { storeId, status: "active" },
    //       },
    //     ],
    //   });
    //   product = uom ? uom.product : null;
    // }

    if (!product) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].picker.product_not_found,
      });
    }

    // بناء شروط البحث عن المنتجات البديلة
    const where = {
      // storeId,
      // status: "active",
      id: { [Op.ne]: product.id }, // استثناء المنتج الأصلي
      [Op.or]: [
        { categoryId: product.categoryId }, // نفس التصنيف
        product.brandId ? { brandId: product.brandId } : {}, // نفس العلامة التجارية إذا كانت موجودة
        { is_suggestion: 1 }, // منتجات مقترحة
      ],
    };

    // استرجاع المنتجات البديلة
    const suggestedProducts = await ProductsModel.findAndCountAll({
      where,
      limit,
      offset,
      attributes: ["id", "storeId", "itemCode", "categoryId", "brandId"],
      include: [
        {
          model: UomModel,
          as: "defaultUom",
          attributes: [
            "id",
            "uomName",
            "quantity",
            "price",
            "salePrice",
            "retailPrice",
            "stock",
            "isDefault",
          ],
          where: { status: "active", stock: { [Op.gt]: 0 } }, // التأكد من وجود مخزون
          required: true,
          include: [
            {
              model: UomImageRelationModel,
              as: "defaultImage",
              attributes: ["id", "uomId", "image", "type"],
              // limit: 1,
            },
          ],
        },
        {
          model: ProductsLocalesModel,
          required: false,
        },
      ],
    });

    if (suggestedProducts.count === 0) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].picker.no_suggestions_found,
      });
    }

    // إرجاع النتائج
    res.status(200).json({
      ack: 1,
      products: suggestedProducts.rows,
      totalCount: suggestedProducts.count,
      currentPage: page,
      totalPages: Math.ceil(suggestedProducts.count / limit),
    });
  } catch (e) {
    console.log(e);
  }
};

data.replaceOrderItems = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { orderId, items } = req.body;
    const lang = req.headers.lang || "en";

    // التحقق من وجود storeId للبيكر
    const storeId = auth_data.store_id;
    if (!storeId) {
      return res.status(400).json({
        ack: 0,
        msg: language[lang].picker.store_not_found,
      });
    }

    // التحقق من الطلب
    const order = await OrdersModel.findOne({
      where: {
        id: orderId,
        storeId,
        pickerId: auth_data.id,
        picker_status: "in_pick",
      },
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].picker.order_not_found,
      });
    }

    // التحقق من وجود عناصر جديدة
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ack: 0,
        msg: language[lang].picker.items_required,
      });
    }

    // التحقق من صحة المنتجات الجديدة
    for (const item of items) {
      const { productId, uomId, quantity } = item;
      const product = await ProductsModel.findOne({
        where: {
          id: productId,
          //  storeId
        },
      });

      if (!product) {
        return res.status(404).json({
          ack: 0,
          msg: language[lang].picker.product_not_found,
        });
      }
    }

    // حذف العناصر القديمة
    await OrdersDetailModel.destroy({
      where: { orderId },
    });

    // إضافة العناصر الجديدة
    const newItems = items.map((item) => ({
      orderId,
      productId: item.productId,
      uomId: item.uomId,
      quantity: item.quantity,
      storeId: item.storeId,
      price: item.price || 0,
      salePrice: item.salePrice || 0,
      costPrice: item.costPrice || 0,
      picker_status: "pickedup",
      status: "active",
      created_by: auth_data.id,
      updated_by: auth_data.id,
    }));

    await OrdersDetailModel.bulkCreate(newItems);

    res.status(200).json({
      ack: 1,
      msg: language[lang].picker.items_replaced_successfully,
    });
  } catch (e) {
    logger.error("Error: replaceOrderItems API - " + e.message);
  }
};

module.exports = data;
