const Joi = require("joi");
const language = require("../language");

// Schema لبدء تسجيل وقت الاستجابة
const startResponseTimeSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base":
          language[lang]?.pickerResponse?.order_id_number ||
          "Order ID must be a number",
        "number.positive":
          language[lang]?.pickerResponse?.order_id_positive ||
          "Order ID must be positive",
        "any.required":
          language[lang]?.pickerResponse?.order_id_required ||
          "Order ID is required",
      }),
    orderDetailId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base":
          language[lang]?.pickerResponse?.order_detail_id_number ||
          "Order detail ID must be a number",
        "number.positive":
          language[lang]?.pickerResponse?.order_detail_id_positive ||
          "Order detail ID must be positive",
        "any.required":
          language[lang]?.pickerResponse?.order_detail_id_required ||
          "Order detail ID is required",
      }),
  });

// Schema لإنهاء تسجيل وقت الاستجابة
const endResponseTimeSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base":
          language[lang]?.pickerResponse?.order_id_number ||
          "Order ID must be a number",
        "number.positive":
          language[lang]?.pickerResponse?.order_id_positive ||
          "Order ID must be positive",
        "any.required":
          language[lang]?.pickerResponse?.order_id_required ||
          "Order ID is required",
      }),
    orderDetailId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base":
          language[lang]?.pickerResponse?.order_detail_id_number ||
          "Order detail ID must be a number",
        "number.positive":
          language[lang]?.pickerResponse?.order_detail_id_positive ||
          "Order detail ID must be positive",
        "any.required":
          language[lang]?.pickerResponse?.order_detail_id_required ||
          "Order detail ID is required",
      }),
    itemStatus: Joi.string()
      .valid(
        "out_of_stock",
        "quantity_insufficient",
        "item_canceled",
        "picked_successfully",
        "replaced"
      )
      .required()
      .messages({
        "any.only":
          language[lang]?.pickerResponse?.invalid_item_status ||
          "Item status must be one of: out_of_stock, quantity_insufficient, item_canceled, picked_successfully, replaced",
        "any.required":
          language[lang]?.pickerResponse?.item_status_required ||
          "Item status is required",
      }),
    pickedQuantity: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .messages({
        "number.base":
          language[lang]?.pickerResponse?.picked_quantity_number ||
          "Picked quantity must be a number",
        "number.min":
          language[lang]?.pickerResponse?.picked_quantity_min ||
          "Picked quantity cannot be negative",
      }),
    notes: Joi.string()
      .max(500)
      .default("")
      .messages({
        "string.max":
          language[lang]?.pickerResponse?.notes_max_length ||
          "Notes cannot exceed 500 characters",
      }),
  });

// Schema للحصول على أوقات الاستجابة لطلب معين
const getOrderResponseTimesSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base":
          language[lang]?.pickerResponse?.order_id_number ||
          "Order ID must be a number",
        "number.positive":
          language[lang]?.pickerResponse?.order_id_positive ||
          "Order ID must be positive",
        "any.required":
          language[lang]?.pickerResponse?.order_id_required ||
          "Order ID is required",
      }),
  });

// Schema لإحصائيات أوقات الاستجابة للبيكر
const getPickerResponseStatsSchema = (lang = "en") =>
  Joi.object({
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        "date.base":
          language[lang]?.pickerResponse?.start_date_invalid ||
          "Start date must be a valid date",
        "date.format":
          language[lang]?.pickerResponse?.start_date_format ||
          "Start date must be in ISO format",
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref("startDate"))
      .optional()
      .messages({
        "date.base":
          language[lang]?.pickerResponse?.end_date_invalid ||
          "End date must be a valid date",
        "date.format":
          language[lang]?.pickerResponse?.end_date_format ||
          "End date must be in ISO format",
        "date.min":
          language[lang]?.pickerResponse?.end_date_after_start ||
          "End date must be after start date",
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        "number.min":
          language[lang]?.pickerResponse?.limit_min ||
          "Limit must be at least 1",
        "number.max":
          language[lang]?.pickerResponse?.limit_max ||
          "Limit cannot exceed 100",
      }),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        "number.min":
          language[lang]?.pickerResponse?.page_min || "Page must be at least 1",
      }),
  });

module.exports = {
  startResponseTimeSchema,
  endResponseTimeSchema,
  getOrderResponseTimesSchema,
  getPickerResponseStatsSchema,
};
