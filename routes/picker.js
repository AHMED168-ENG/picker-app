const express = require("express");
const router = express.Router();
const pickerController = require("../controller/Picker");
const {
  getUnassignedOrdersSchema,
  getAssignedOrdersSchema,
  assignOrderSchema,
  getOrderDetailsSchema,
  updateOrderStatusSchema,
  scanProductSchema,
  markItemAsPickedSchema,
  suggestProductSchema,
  replaceOrderItemsSchema,
} = require("../validation/pickerValidation");
const authenticatePicker = require("../middleware/authenticatePicker");
const validateJoi = require("../middleware/validationJoi");

router.get(
  "/unassigned-orders",
  authenticatePicker,
  validateJoi(getUnassignedOrdersSchema),
  pickerController.getUnassignedOrders
);
router.get(
  "/assigned-orders",
  authenticatePicker,
  validateJoi(getAssignedOrdersSchema),
  pickerController.getAssignedOrders
);
router.post(
  "/assign-order",
  authenticatePicker,
  validateJoi(assignOrderSchema),
  pickerController.assignOrder
);
router.get(
  "/order-details/:orderId",
  authenticatePicker,
  validateJoi(getOrderDetailsSchema, "params"),
  pickerController.getOrderDetails
);
router.post(
  "/update-order-status",
  authenticatePicker,
  validateJoi(updateOrderStatusSchema),
  pickerController.updateOrderStatus
);
router.post(
  "/mark-item-picked",
  authenticatePicker,
  validateJoi(markItemAsPickedSchema),
  pickerController.markItemAsPicked
);
router.post(
  "/un_mark-item-picked",
  authenticatePicker,
  validateJoi(markItemAsPickedSchema),
  pickerController.unmarkItemAsPicked
);
router.post(
  "/scan-product",
  authenticatePicker,
  validateJoi(scanProductSchema),
  pickerController.scanProduct
);
router.post(
  "/suggest-product",
  authenticatePicker,
  validateJoi(suggestProductSchema),
  pickerController.suggestProduct
); // إضافة الـ route الجديد
router.post(
  "/replace-order-items",
  authenticatePicker,
  validateJoi(replaceOrderItemsSchema),
  pickerController.replaceOrderItems
);

module.exports = router;
