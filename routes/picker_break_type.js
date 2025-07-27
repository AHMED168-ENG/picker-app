const express = require("express");
const router = express.Router();
const BreakTypeController = require("../controller/PickerType");
const BreakRequestController = require("../controller/PickerRequest");

const authenticatePicker = require("../middleware/authenticatePicker");
const validateJoi = require("../middleware/validationJoi");
const {
  getPickerBreakRequestsSchema,
  cancelBreakRequestSchema,
  requestBreakSchema,
  manageBreakRequestSchema,
  createBreakTypeSchema,
  updateBreakTypeSchema,
  deleteBreakTypeSchema,
  getAllBreakTypesSchema,
  getBreakTypeByIdSchema,
  getBreakRequestByIdSchema,
} = require("../validation/picker_type");
const authenticateAdmin = require("../middleware/authenticateAdmin");
const { uploadSingleAudio } = require("../config/Multer");

// Routes للبيكر
router.get(
  "/break-types",
  authenticatePicker,
  BreakTypeController.getBreakTypes
);
router.post(
  "/request-break",
  authenticatePicker,
  validateJoi(requestBreakSchema),
  BreakRequestController.requestBreak
);
router.get(
  "/picker-break-requests",
  authenticatePicker,
  validateJoi(getPickerBreakRequestsSchema),
  BreakRequestController.getPickerBreakRequests
);
router.get(
  "/picker-break-requests/:breakRequestId",
  authenticatePicker,
  validateJoi(getBreakRequestByIdSchema, "params"),
  BreakRequestController.getOnePickerBreakRequests
);
router.post(
  "/cancel-break-request/:breakRequestId",
  authenticatePicker,
  validateJoi(cancelBreakRequestSchema, "params"),
  BreakRequestController.cancelBreakRequest
);

// admin
router.post(
  "/admin/manage-break-request",
  authenticateAdmin,
  validateJoi(manageBreakRequestSchema),
  BreakRequestController.manageBreakRequest
);
router.post(
  "/admin/break-types",
  authenticateAdmin,
  validateJoi(createBreakTypeSchema),
  BreakTypeController.createBreakType
);
router.put(
  "/admin/break-types",
  authenticateAdmin,
  validateJoi(updateBreakTypeSchema),
  BreakTypeController.updateBreakType
);
router.delete(
  "/admin/break-types",
  authenticateAdmin,
  validateJoi(deleteBreakTypeSchema),
  BreakTypeController.deleteBreakType
);
router.get(
  "/admin/break-types",
  authenticateAdmin,
  validateJoi(getAllBreakTypesSchema),
  BreakTypeController.getAllBreakTypes
);
router.get(
  "/admin/break-types/:breakTypeId",
  authenticateAdmin,
  validateJoi(getBreakTypeByIdSchema, "params"),
  BreakTypeController.getBreakTypeById
);

router.post(
  "/upload-voice-note",
  authenticatePicker,
  uploadSingleAudio("voiceNote"),
  BreakRequestController.uploadVoiceNote
);

module.exports = router;
