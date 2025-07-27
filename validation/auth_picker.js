const Joi = require("joi");
const language = require("../../language");

const loginSchema = (lang = "en") =>
  Joi.object({
    uname: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": language[lang].auth.invalid_email,
        "any.required": language[lang].auth.email_is_required,
      }),
    password: Joi.string().required().messages({
      "any.required": language[lang].auth.password_is_required,
    }),
    role: Joi.string().required().messages({
      "any.required": language[lang].auth.role_is_required,
    }),
  });

const forgotPasswordSchema = (lang = "en") =>
  Joi.object({
    uname: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": language[lang].auth.invalid_email,
        "any.required": language[lang].auth.email_is_required,
      }),
    role: Joi.string().required().messages({
      "any.required": language[lang].auth.role_is_required,
    }),
  });

const verifyOtpSchema = (lang = "en") =>
  Joi.object({
    uname: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": language[lang].auth.invalid_email,
        "any.required": language[lang].auth.email_is_required,
      }),
    otp: Joi.string().required().messages({
      "any.required": language[lang].auth.otp_is_required,
    }),
    role: Joi.string().required().messages({
      "any.required": language[lang].auth.role_is_required,
    }),
  });

const setPasswordSchema = (lang = "en") =>
  Joi.object({
    picker_id: Joi.number().integer().required().messages({
      "number.base": language[lang].auth.picker_id_is_required,
      "any.required": language[lang].auth.picker_id_is_required,
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])./)
      .required()
      .messages({
        "string.min": language[lang].auth.password_is_min_8,
        "string.pattern.base": language[lang].auth.password_is_min_one_digit,
        "any.required": language[lang].auth.password_is_required,
      }),
  });

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  setPasswordSchema,
};
