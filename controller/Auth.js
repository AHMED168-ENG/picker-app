require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");
const generateToken = require("../middleware/generateToken");

// Import Models
const {
  PickerUsersModel,
  PickerUserSessionModel,
  TempOtpModel,
} = require("../models");

// Import Utilities
const language = require("../language");

// Picker Login
const pickerLogin = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const { uname, password, role } = req.body;

    // Normalize email
    const email = uname.toLowerCase();
    const user = await PickerUsersModel.findOne({
      where: {
        email,
        role,
        status: { [Op.ne]: "deleted" },
      },
      raw: true,
    });

    if (!user) {
      return res.status(401).json({
        ack: 0,
        msg: language[lang].auth.you_are_not_registered_with_us,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        ack: 0,
        msg: language[lang].auth.mobile_and_password_did_not_match,
      });
    }

    // Update user status and create session
    await PickerUsersModel.update(
      { online: 1, picker_state: "idle" },
      { where: { id: user.id } }
    );
    await PickerUserSessionModel.create({
      pickerUserId: user.id,
      loggedInTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      loggedOutTime: null,
    });

    console.log(user);
    let token = generateToken(user);

    return res.status(200).json({
      ack: 1,
      msg: language[lang].auth.user_has_logged_in_successfully,
      token,
    });
  } catch (error) {
    console.error("Error: pickerLogin -", error);
  }
};

// Forgot Password (Generate OTP)
const pickerForgotPassword = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const { uname, role } = req.body;

    // Normalize email
    const email = uname.toLowerCase();
    const user = await PickerUsersModel.findOne({
      where: {
        email,
        role,
        status: { [Op.ne]: "deleted" },
      },
    });

    if (!user) {
      return res.status(401).json({
        ack: 0,
        msg: language[lang].auth.email_not_registerwith_us,
      });
    }

    // Generate and store OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    await TempOtpModel.destroy({ where: { email } });
    await TempOtpModel.create({
      email,
      otp,
      role,
    });

    return res.status(201).json({
      ack: 1,
      msg: language[lang].auth.otp_sent_successfully,
    });
  } catch (error) {
    console.error("Error: pickerForgotPassword -", error);
    return res.status(500).json({
      ack: 0,
      msg: language[lang].auth.server_error,
    });
  }
};

// Verify OTP
const pickerForgotPasswordVerify = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const { uname, otp, role } = req.body;

    // Normalize email
    const email = uname.toLowerCase();
    const user = await PickerUsersModel.findOne({
      where: {
        email,
        role,
        status: { [Op.ne]: "deleted" },
      },
      raw: true,
    });

    if (!user) {
      return res.status(401).json({
        ack: 0,
        msg: language[lang].auth.you_are_not_registered_with_us,
      });
    }

    const otpRecord = await TempOtpModel.findOne({
      where: {
        email,
        role,
        otp,
      },
    });

    if (!otpRecord) {
      return res.status(401).json({
        ack: 0,
        msg: language[lang].auth.your_entered_OTP_is_invalid,
      });
    }

    return res.status(200).json({
      ack: 1,
      msg: language[lang].auth.forgot_password_otp_verify,
      picker_id: user.id,
    });
  } catch (error) {
    console.error("Error: pickerForgotPasswordVerify -", error);
    return res.status(500).json({
      ack: 0,
      msg: language[lang].auth.server_error,
    });
  }
};

// Set Password
const pickerSetPassword = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const { picker_id, password } = req.body;

    const user = await PickerUsersModel.findOne({
      where: { id: picker_id },
      raw: true,
    });

    if (!user) {
      return res.status(401).json({
        ack: 0,
        msg: language[lang].auth.you_are_not_registered_with_us,
      });
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    await PickerUsersModel.update(
      { password: hashedPassword },
      { where: { id: picker_id } }
    );

    return res.status(200).json({
      ack: 1,
      msg: language[lang].auth.password_set_successfully,
    });
  } catch (error) {
    console.error("Error: pickerSetPassword -", error);
    return res.status(500).json({
      ack: 0,
      msg: language[lang].auth.server_error,
    });
  }
};

module.exports = {
  pickerLogin,
  pickerForgotPassword,
  pickerForgotPasswordVerify,
  pickerSetPassword,
};
