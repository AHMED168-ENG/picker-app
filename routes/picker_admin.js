const express = require("express");
const router = express.Router();
const pickerAdminController = require("../controller/pickerAdmin");
const validateJoi = require("../middleware/validationJoi");
const {
  addPickerSchema,
  editPickerSchema,
  getAllSchema,
  getByIdSchema,
  deletePickerSchema,
  //   getAllFinanceUsersSchema,
} = require("../validation/pickerValidation");
const authenticateAdmin = require("../middleware/authenticateAdmin");

router.post(
  "/add-picker",
  authenticateAdmin,
  validateJoi(addPickerSchema),
  pickerAdminController.addPicker
);
router.put(
  "/edit-picker/:id",
  authenticateAdmin,
  validateJoi(editPickerSchema),
  pickerAdminController.editPicker
);
router.get(
  "/pickers",
  authenticateAdmin,
  validateJoi(getAllSchema),
  pickerAdminController.getAll
);
router.get(
  "/picker/:id",
  authenticateAdmin,
  validateJoi(getByIdSchema, "params"),
  pickerAdminController.getById
);
router.delete(
  "/picker/:id",
  authenticateAdmin,
  validateJoi(deletePickerSchema, "params"),
  pickerAdminController.deletePicker
);
// router.get("/finance-users", checkApiKey, authenticateAdmin, validateJoi(getAllFinanceUsersSchema), pickerAdminController.getAllFinanceUsers);

module.exports = router;
