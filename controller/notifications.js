const { Op } = require("sequelize");
const moment = require("moment");
const { NotificationsModel } = require("../models/index");
const language = require("../language/index");

const data = {};

// جلب جميع الإشعارات مع فلاتر
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

    res.status(200).json({
      ack: 1,
      notifications: notifications.rows,
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
