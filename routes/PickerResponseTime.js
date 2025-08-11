const express = require("express");
const router = express.Router();
const pickerResponseController = require("../controller/PickerResponseTime");
const {
  startResponseTimeSchema,
  endResponseTimeSchema,
  getOrderResponseTimesSchema,
  getPickerResponseStatsSchema,
} = require("../validation/pickerResponse");
const authenticatePicker = require("../middleware/authenticatePicker");
const validateJoi = require("../middleware/validationJoi");

// بدء تسجيل وقت الاستجابة لعنصر معين
router.post(
  "/start-response-time",
  authenticatePicker,
  validateJoi(startResponseTimeSchema),
  pickerResponseController.startResponseTime
);

// إنهاء تسجيل وقت الاستجابة مع حالة العنصر
router.post(
  "/end-response-time",
  authenticatePicker,
  validateJoi(endResponseTimeSchema),
  pickerResponseController.endResponseTime
);

// الحصول على إجمالي أوقات الاستجابة لطلب معين
router.get(
  "/order-response-times/:orderId",
  authenticatePicker,
  validateJoi(getOrderResponseTimesSchema, "params"),
  pickerResponseController.getOrderResponseTimes
);

// الحصول على إحصائيات أوقات الاستجابة للبيكر
router.get(
  "/response-stats",
  authenticatePicker,
  validateJoi(getPickerResponseStatsSchema),
  pickerResponseController.getPickerResponseStats
);

// الحصول على العناصر المعلقة (التي لم ينته تسجيل وقتها)
router.get(
  "/pending-response-items",
  authenticatePicker,
  pickerResponseController.getPendingResponseItems
);

module.exports = router;
