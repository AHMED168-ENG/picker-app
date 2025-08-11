const express = require("express");
const router = express.Router();
const PickerRouter = require("./picker");
const PickerLoginRouter = require("./auth");
const PickerAdminRouter = require("./picker_admin");
const PickerTypeRouter = require("./picker_break_type");
const PickerResponseRouter = require("./PickerResponseTime");
const NotificationsRouter = require("./notification");

router.use("/auth", PickerLoginRouter);
router.use("/pickers", PickerRouter);
router.use("/picker-admin", PickerAdminRouter);
router.use("/picker-break", PickerTypeRouter);
router.use("/picker-response", PickerResponseRouter);
router.use("/notifications", NotificationsRouter);

module.exports = router;
