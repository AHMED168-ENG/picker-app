var express = require("express");
var router = express.Router();
let Auth = require("../controller/Auth");

router.post("/picker-login", Auth.pickerLogin);

module.exports = router;
