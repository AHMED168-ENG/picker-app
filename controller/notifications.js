const { Op } = require("sequelize");
const moment = require("moment");
const {
  OrdersModel,
  OrdersDetailModel,
  ProductsModel,
  ProductsLocalesModel,
  UomModel,
  NotificationsModel,
  StoresModel,
  UomImageRelationModel,
  UnitModel,
} = require("../models/index");

const language = require("../language/index");

const data = {};

// جلب جميع الإشعارات مع فلاتر
// data.getNotifications = async (req, res) => {
//   try {
//     const auth_data = req.auth_data;
//     const {
//       limit = 10,
//       page = 1,
//       role,
//       read,
//       type,
//       itemId,
//       orderId,
//       startDate,
//       endDate,
//     } = req.query;
//     const offset = (page - 1) * limit;
//     const lang = req.headers.lang || "en";

//     const where = { userId: auth_data.id };
//     if (role) where.role = role;
//     if (read !== undefined) where.read = read === "true";
//     if (type) where.type = type;
//     if (itemId) where.itemId = itemId;
//     if (orderId) where.orderId = orderId;
//     if (startDate && endDate) {
//       where.createdAt = {
//         [Op.between]: [
//           moment(startDate).startOf("day").toDate(),
//           moment(endDate).endOf("day").toDate(),
//         ],
//       };
//     } else if (startDate) {
//       where.createdAt = { [Op.gte]: moment(startDate).startOf("day").toDate() };
//     } else if (endDate) {
//       where.createdAt = { [Op.lte]: moment(endDate).endOf("day").toDate() };
//     }

//     const notifications = await NotificationsModel.findAndCountAll({
//       where,
//       limit: parseInt(limit),
//       offset,
//       order: [["createdAt", "DESC"]],
//     });

//     res.status(200).json({
//       ack: 1,
//       notifications: notifications.rows,
//       totalCount: notifications.count,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(notifications.count / limit),
//     });
//   } catch (e) {
//     console.error("Error in getNotifications:", e);
//     res.status(500).json({
//       ack: 0,
//       msg:
//         language[req.headers.lang || "en"].notification.internal_server_error ||
//         "Internal server error",
//     });
//   }
// };

data.getNotifications = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const {
      limit = 10,
      page = 1,
      role,
      read,
      type,
      itemId,
      orderId,
      startDate,
      endDate,
    } = req.query;
    const offset = (page - 1) * limit;
    const lang = req.headers.lang || "en";

    const where = { userId: auth_data.id };
    if (role) where.role = role;
    if (read !== undefined) where.read = read === "true";
    if (type) where.type = type;
    if (itemId) where.itemId = itemId;
    if (orderId) where.orderId = orderId;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [
          moment(startDate).startOf("day").toDate(),
          moment(endDate).endOf("day").toDate(),
        ],
      };
    } else if (startDate) {
      where.createdAt = { [Op.gte]: moment(startDate).startOf("day").toDate() };
    } else if (endDate) {
      where.createdAt = { [Op.lte]: moment(endDate).endOf("day").toDate() };
    }

    const notifications = await NotificationsModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    // إضافة تفاصيل الطلب للإشعارات التي تحتوي على orderId
    const notificationsWithOrderDetails = await Promise.all(
      notifications.rows.map(async (notification) => {
        const notificationData = notification.toJSON();

        // إذا كان الإشعار يحتوي على orderId، جلب تفاصيل الطلب
        if (notificationData.orderId) {
          try {
            const order = await OrdersModel.findOne({
              where: {
                id: notificationData.orderId,
                // storeId: auth_data.store_id,
                // pickerId: auth_data.id,
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
                          include: [
                            {
                              model: UnitModel,
                              attributes: ["id"],
                            },
                            {
                              model: UomImageRelationModel,
                              as: "defaultImage",
                              attributes: ["id", "uomId", "image", "type"],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            });

            console.log(order);

            // إضافة تفاصيل الطلب للإشعار
            notificationData.orderDetails = order;
          } catch (orderError) {
            console.error(
              `Error fetching order details for orderId ${notificationData.orderId}:`,
              orderError
            );
            // في حالة حدوث خطأ، لا نضيف تفاصيل الطلب ولكن نكمل باقي الإشعارات
            notificationData.orderDetails = null;
          }
        }

        return notificationData;
      })
    );

    res.status(200).json({
      ack: 1,
      notifications: notificationsWithOrderDetails,
      totalCount: notifications.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(notifications.count / limit),
    });
  } catch (e) {
    console.error("Error in getNotifications:", e);
    res.status(500).json({
      ack: 0,
      msg:
        language[req.headers.lang || "en"].notification.internal_server_error ||
        "Internal server error",
    });
  }
};

// جلب إشعار معين
data.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await NotificationsModel.findByPk(id);
    const lang = req.headers.lang || "en";

    if (!notification) {
      return res.status(404).json({
        ack: 0,
        msg:
          language[lang].notification.notification_not_found ||
          "Notification not found",
      });
    }

    res.status(200).json({ ack: 1, notification });
  } catch (e) {
    console.error("Error in getNotificationById:", e);
    res.status(500).json({
      ack: 0,
      msg:
        language[req.headers.lang || "en"].notification.internal_server_error ||
        "Internal server error",
    });
  }
};

// حذف إشعار
data.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await NotificationsModel.findByPk(id);
    const lang = req.headers.lang || "en";

    if (!notification) {
      return res.status(404).json({
        ack: 0,
        msg:
          language[lang].notification.notification_not_found ||
          "Notification not found",
      });
    }

    await notification.destroy();
    res.status(200).json({
      ack: 1,
      msg:
        language[lang].notification.notification_deleted_successfully ||
        "Notification deleted successfully",
    });
  } catch (e) {
    console.error("Error in deleteNotification:", e);
    res.status(500).json({
      ack: 0,
      msg:
        language[req.headers.lang || "en"].notification.internal_server_error ||
        "Internal server error",
    });
  }
};

// تحديث حالة القراءة
data.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await NotificationsModel.findByPk(id);
    const lang = req.headers.lang || "en";

    if (!notification) {
      return res.status(404).json({
        ack: 0,
        msg:
          language[lang].notification.notification_not_found ||
          "Notification not found",
      });
    }

    await notification.update({ read: true });
    res.status(200).json({ ack: 1, notification });
  } catch (e) {
    console.error("Error in markAsRead:", e);
    res.status(500).json({
      ack: 0,
      msg:
        language[req.headers.lang || "en"].notification.internal_server_error ||
        "Internal server error",
    });
  }
};

module.exports = data;
