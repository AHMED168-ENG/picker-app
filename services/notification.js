const { NotificationsModel } = require("../models/index");
const { sendToUser } = require("../config/socket");
const moment = require("moment-timezone");

class NotificationService {
  // إرسال إشعار مع حفظ في قاعدة البيانات
  async sendNotification({
    userId,
    role,
    message,
    type,
    itemId = 0,
    orderId = "",
    socketEvent = "notification",
    socketData = {},
  }) {
    try {
      // حفظ الإشعار في قاعدة البيانات
      const notification = await NotificationsModel.create({
        userId,
        role,
        message,
        type,
        itemId,
        orderId,
        read: false,
      });

      // إرسال الإشعار عبر Socket
      const notificationData = {
        id: notification.id,
        message,
        type,
        orderId,
        itemId,
        createdAt: notification.createdAt,
        ...socketData,
      };

      // إرسال للمستخدم مباشرة بـ userId
      sendToUser(userId, socketEvent, notificationData);

      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  // إشعار العميل بعدم توفر المنتج
  async notifyCustomerProductUnavailable({
    customerId,
    orderId,
    productName,
    alternatives = [],
  }) {
    const message = `المنتج "${productName}" غير متوفر حاليا. نقترح عليك بدائل أخرى.`;

    return await this.sendNotification({
      userId: customerId,
      role: "customer",
      message,
      type: "product_unavailable",
      orderId,
      socketEvent: "product_unavailable",
      socketData: {
        productName,
        alternatives,
        action_required: true,
      },
    });
  }

  // إشعار العميل بنقص الكمية
  async notifyCustomerInsufficientQuantity({
    customerId,
    orderId,
    productName,
    availableQuantity,
    requestedQuantity,
  }) {
    const message = `الكمية المطلوبة من "${productName}" غير متوفرة. متوفر فقط ${availableQuantity} من ${requestedQuantity}.`;

    return await this.sendNotification({
      userId: customerId,
      role: "customer",
      message,
      type: "insufficient_quantity",
      orderId,
      socketEvent: "insufficient_quantity",
      socketData: {
        productName,
        availableQuantity,
        requestedQuantity,
        action_required: true,
      },
    });
  }

  // إشعار البيكر برد العميل
  async notifyPickerCustomerResponse({
    pickerId,
    orderId,
    customerResponse,
    productName,
  }) {
    const message = `العميل رد على طلب استبدال "${productName}": ${customerResponse}`;

    return await this.sendNotification({
      userId: pickerId,
      role: "picker",
      message,
      type: "customer_response",
      orderId,
      socketEvent: "customer_response",
      socketData: {
        customerResponse,
        productName,
        action_required: true,
      },
    });
  }

  // إشعار صاحب المتجر بطلب استراحة
  async notifyStoreOwnerBreakRequest({
    storeOwnerId,
    pickerId,
    breakRequestId,
    pickerName,
    breakReason,
    breakNote,
  }) {
    const message = `The picker ${pickerName} has requested a break. Reason: ${breakReason}`;

    return await this.sendNotification({
      userId: storeOwnerId, // صاحب المتجر مباشرة
      role: "store_owner", // أو أي دور تريده
      message,
      type: "break_request",
      itemId: breakRequestId,
      socketEvent: "break_request",
      socketData: {
        pickerId,
        pickerName,
        breakReason,
        breakNote,
        action_required: true,
      },
    });
  }

  // إشعار العميل وصاحب المتجر بإلغاء البيكر للطلب
  async notifyPickerCancelledOrder({
    storeOwnerId,
    pickerId,
    breakRequestId,
    pickerName,
  }) {
    try {
      // إشعار صاحب المتجر
      const storeOwnerMessage = `The picker ${pickerName} has cancelled their break request .`;

      const storeOwnerNotification = await this.sendNotification({
        userId: storeOwnerId,
        role: "store_owner",
        message: storeOwnerMessage,
        type: "order_cancelled_by_picker",
        itemId: breakRequestId,
        socketEvent: "picker_cancelled_order",
        socketData: {
          pickerId,
          pickerName,
          action_required: true,
        },
      });

      return {
        storeOwnerNotification,
      };
    } catch (error) {
      console.error("Error sending picker cancellation notifications:", error);
      throw error;
    }
  }

  // إشعار البيكر بالموافقة/الرفض على الاستراحة
  async notifyPickerBreakResponse({ pickerId, approved, adminNote = "" }) {
    const message = approved
      ? `Break request approved. Note: ${adminNote}`
      : `Break request rejected. Note: ${adminNote}`;

    return await this.sendNotification({
      userId: pickerId,
      role: "picker",
      message,
      type: "break_response",
      socketEvent: "break_response",
      socketData: {
        approved,
        adminNote,
      },
    });
  }

  // إشعار العميل بجاهزية الطلب
  async notifyCustomerOrderReady({ customerId, orderId }) {
    const message = `Your order #${orderId} is ready for delivery.`;

    return await this.sendNotification({
      userId: customerId,
      role: "customer",
      message,
      type: "order_ready",
      orderId,
      socketEvent: "order_ready",
    });
  }

  // إشعار صاحب المتجر بجاهزية الطلب للتوصيل
  async notifyStoreOwnerOrderReadyForDelivery({
    storeId,
    orderId,
    pickerId,
    pickerName,
  }) {
    const message = `Order #${orderId} is ready for delivery. Prepared by ${pickerName}.`;

    return await this.sendNotification({
      userId: storeId, // صاحب المتجر مباشرة
      role: "store_owner",
      message,
      type: "order_ready_delivery",
      orderId,
      socketEvent: "order_ready_delivery",
      socketData: {
        pickerId,
        pickerName,
      },
    });
  }

  // جلب الإشعارات للمستخدم
  async getUserNotifications({
    userId,
    role,
    limit = 20,
    page = 1,
    unreadOnly = false,
  }) {
    const offset = (page - 1) * limit;
    const where = { userId };

    // إضافة الدور إذا كان مطلوب (اختياري)
    if (role) {
      where.role = role;
    }

    if (unreadOnly) {
      where.read = false;
    }

    try {
      const notifications = await NotificationsModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        notifications: notifications.rows,
        totalCount: notifications.count,
        currentPage: page,
        totalPages: Math.ceil(notifications.count / limit),
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // تحديث حالة الإشعار إلى مقروء
  async markAsRead(notificationId, userId) {
    try {
      await NotificationsModel.update(
        {
          read: true,
          updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          where: { id: notificationId, userId },
        }
      );
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // تحديد جميع الإشعارات كمقروءة
  async markAllAsRead(userId, role = null) {
    try {
      const where = { userId, read: false };

      // إضافة الدور إذا كان محدد
      if (role) {
        where.role = role;
      }

      await NotificationsModel.update(
        {
          read: true,
          updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        { where }
      );
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
}

// إنشاء instance واحد
const notificationService = new NotificationService();

module.exports = notificationService;
