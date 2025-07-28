const Joi = require("joi");
const language = require("../language");

const getNotificationsSchema = (lang = "en") =>
  Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].notification.limit_min,
      "number.max": language[lang].notification.limit_max,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].notification.page_min,
    }),
    userId: Joi.number().integer().optional().messages({
      "number.base": language[lang].notification.user_id_invalid,
    }),
    role: Joi.string().optional().messages({
      "string.base": language[lang].notification.role_invalid,
    }),
    read: Joi.boolean().optional().messages({
      "boolean.base": language[lang].notification.read_invalid,
    }),
    type: Joi.string().optional().messages({
      "string.base": language[lang].notification.type_invalid,
    }),
    itemId: Joi.number().integer().optional().messages({
      "number.base": language[lang].notification.item_id_invalid,
    }),
    orderId: Joi.string().optional().messages({
      "string.base": language[lang].notification.order_id_invalid,
    }),
    startDate: Joi.date().optional().messages({
      "date.base": language[lang].notification.date_invalid,
    }),
    endDate: Joi.date().optional().messages({
      "date.base": language[lang].notification.date_invalid,
    }),
  });

const getNotificationByIdSchema = (lang = "en") =>
  Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": language[lang].notification.id_invalid,
      "any.required": language[lang].notification.id_required,
    }),
  });

const deleteNotificationSchema = (lang = "en") =>
  Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": language[lang].notification.id_invalid,
      "any.required": language[lang].notification.id_required,
    }),
  });

const markAsReadSchema = (lang = "en") =>
  Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": language[lang].notification.id_invalid,
      "any.required": language[lang].notification.id_required,
    }),
  });

module.exports = {
  getNotificationsSchema,
  getNotificationByIdSchema,
  deleteNotificationSchema,
  markAsReadSchema,
};
