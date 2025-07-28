const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notifications");
const {
  getNotificationsSchema,
  getNotificationByIdSchema,
  deleteNotificationSchema,
  markAsReadSchema,
} = require("../validation/notification");
const authenticatePicker = require("../middleware/authenticatePicker");
const validateJoi = require("../middleware/validationJoi");

router.get(
  "/",
  authenticatePicker,
  validateJoi(getNotificationsSchema),
  notificationController.getNotifications
);
router.get(
  "/:id",
  authenticatePicker,
  validateJoi(getNotificationByIdSchema, "params"),
  notificationController.getNotificationById
);
router.delete(
  "/:id",
  authenticatePicker,
  validateJoi(deleteNotificationSchema, "params"),
  notificationController.deleteNotification
);
router.put(
  "/:id/mark-as-read",
  authenticatePicker,
  validateJoi(markAsReadSchema, "params"),
  notificationController.markAsRead
);

module.exports = router;
