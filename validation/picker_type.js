const Joi = require("joi");
const language = require("../language");

const createBreakTypeSchema = (lang = "en") =>
  Joi.object({
    name: Joi.string().max(100).required().messages({
      "string.base": language[lang].pickerType.name_invalid,
      "string.max": language[lang].pickerType.name_max,
      "any.required": language[lang].pickerType.name_required,
    }),
    description: Joi.string().max(500).allow("").optional().messages({
      "string.base": language[lang].pickerType.description_invalid,
      "string.max": language[lang].pickerType.description_max,
    }),
  });

const updateBreakTypeSchema = (lang = "en") =>
  Joi.object({
    breakTypeId: Joi.number().integer().required().messages({
      "number.base": language[lang].pickerType.id_invalid,
      "any.required": language[lang].pickerType.break_type_id_required,
    }),
    name: Joi.string().max(100).optional().messages({
      "string.base": language[lang].pickerType.name_invalid,
      "string.max": language[lang].pickerType.name_max,
    }),
    description: Joi.string().max(500).allow("").optional().messages({
      "string.base": language[lang].pickerType.description_invalid,
      "string.max": language[lang].pickerType.description_max,
    }),
    status: Joi.string()
      .valid("active", "inactive", "deleted")
      .optional()
      .messages({
        "any.only": language[lang].pickerType.break_type_status_invalid,
      }),
  });

const deleteBreakTypeSchema = (lang = "en") =>
  Joi.object({
    breakTypeId: Joi.number().integer().required().messages({
      "number.base": language[lang].pickerType.id_invalid,
      "any.required": language[lang].pickerType.break_type_id_required,
    }),
  });

const getAllBreakTypesSchema = (lang = "en") =>
  Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].pickerType.limit_min,
      "number.max": language[lang].pickerType.limit_max,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].pickerType.page_min,
    }),
  });

const getBreakTypeByIdSchema = (lang = "en") =>
  Joi.object({
    breakTypeId: Joi.number().integer().required().messages({
      "number.base": language[lang].pickerType.id_invalid,
      "any.required": language[lang].pickerType.break_type_id_required,
    }),
  });

const getBreakRequestByIdSchema = (lang = "en") =>
  Joi.object({
    breakRequestId: Joi.number().integer().required().messages({
      "number.base": language[lang].pickerType.id_invalid,
      "any.required": language[lang].pickerType.break_request_id_required,
    }),
  });

const requestBreakSchema = (lang = "en") =>
  Joi.object({
    breakTypeId: Joi.alternatives()
      .try(
        Joi.number().integer(), // رقم ID عادي
        Joi.string().valid("other") // أو كلمة "other"
      )
      .required()
      .messages({
        "number.base": language[lang].pickerType.id_invalid,
        "any.required": language[lang].pickerType.break_type_required,
        "any.only": language[lang].pickerType.break_type_invalid,
      }),

    requestNote: Joi.string().max(500).allow("").optional().messages({
      "string.base": language[lang].pickerType.note_invalid,
      "string.max": language[lang].pickerType.note_max,
    }),

    // Voice note مطلوب لو breakTypeId = "other"
    voiceNote: Joi.when("breakTypeId", {
      is: "other",
      then: Joi.string().max(255).required(), // مطلوب لو "other"
      otherwise: Joi.forbidden(), // ممنوع لو رقم ID
    }).messages({
      "string.base": language[lang].pickerType.voice_note_invalid,
      "string.max": language[lang].pickerType.voice_note_max,
      "any.required": language[lang].pickerType.voice_note_required_for_other,
      "any.unknown": language[lang].pickerType.voice_note_not_allowed_with_id,
    }),

    // Voice text مطلوب لو تم إرسال voiceNote
    voiceText: Joi.when("voiceNote", {
      is: Joi.exist(), // لو voiceNote موجود
      then: Joi.string().min(1).max(1000).required(), // voiceText مطلوب
      otherwise: Joi.forbidden(), // ممنوع لو مافيش voiceNote
    }).messages({
      "string.base": language[lang].pickerType.voice_text_invalid,
      "string.min": language[lang].pickerType.voice_text_empty,
      "string.max": language[lang].pickerType.voice_text_max,
      "any.required": language[lang].pickerType.voice_text_required_with_voice,
      "any.unknown": language[lang].pickerType.voice_text_not_allowed,
    }),
  });

const getPickerBreakRequestsSchema = (lang = "en") =>
  Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].pickerType.limit_min,
      "number.max": language[lang].pickerType.limit_max,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].pickerType.page_min,
    }),
  });

const cancelBreakRequestSchema = (lang = "en") =>
  Joi.object({
    breakRequestId: Joi.number().integer().required().messages({
      "number.base": language[lang].pickerType.id_invalid,
      "any.required": language[lang].pickerType.break_request_id_required,
    }),
  });

const manageBreakRequestSchema = (lang = "en") =>
  Joi.object({
    breakRequestId: Joi.number().integer().required().messages({
      "number.base": language[lang].pickerType.id_invalid,
      "any.required": language[lang].pickerType.break_request_id_required,
    }),
    status: Joi.string().valid("approved", "rejected").required().messages({
      "any.only": language[lang].pickerType.break_status_invalid,
      "any.required": language[lang].pickerType.break_status_required,
    }),
    managerNote: Joi.string().max(500).allow("").optional().messages({
      "string.base": language[lang].pickerType.note_invalid,
      "string.max": language[lang].pickerType.note_max,
    }),
  });

module.exports = {
  createBreakTypeSchema,
  updateBreakTypeSchema,
  deleteBreakTypeSchema,
  getAllBreakTypesSchema,
  getBreakTypeByIdSchema,
  requestBreakSchema,
  getPickerBreakRequestsSchema,
  cancelBreakRequestSchema,
  manageBreakRequestSchema,
  getBreakRequestByIdSchema,
};
