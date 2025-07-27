const Joi = require("joi");
const language = require("../language");

const getUnassignedOrdersSchema = (lang = "en") =>
  Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].picker.limit_min,
      "number.max": language[lang].picker.limit_max,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].picker.page_min,
    }),
  });

const getAssignedOrdersSchema = (lang = "en") =>
  Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].picker.limit_min,
      "number.max": language[lang].picker.limit_max,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].picker.page_min,
    }),
  });

const assignOrderSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.order_id_invalid,
      "any.required": language[lang].picker.order_id_required,
    }),
  });

const getOrderDetailsSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.order_id_invalid,
      "any.required": language[lang].picker.order_id_required,
    }),
  });

const updateOrderStatusSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.order_id_invalid,
      "any.required": language[lang].picker.order_id_required,
    }),
  });

const scanProductSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.order_id_invalid,
      "any.required": language[lang].picker.order_id_required,
    }),
    barcode: Joi.string().required().messages({
      "string.base": language[lang].picker.invalid_search,
      "any.required": "Barcode is required",
    }),
  });

const suggestProductSchema = (lang = "en") =>
  Joi.object({
    productId: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.id_invalid,
    }),
    uomId: Joi.number().integer().optional().messages({
      "number.base": language[lang].picker.id_invalid,
    }),
    orderId: Joi.number().integer().optional().messages({
      "number.base": language[lang].picker.order_id_invalid,
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].picker.limit_min,
      "number.max": language[lang].picker.limit_max,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].picker.page_min,
    }),
  })
    .or("productId", "uomId")
    .messages({
      "object.missing": language[lang].picker.product_or_uom_required,
    });

const addPickerSchema = (lang = "en") =>
  Joi.object({
    first_name: Joi.string().required().messages({
      "string.base": language[lang].picker.first_name_invalid,
      "any.required": language[lang].picker.first_name_required,
    }),
    last_name: Joi.string().required().messages({
      "string.base": language[lang].picker.last_name_invalid,
      "any.required": language[lang].picker.last_name_required,
    }),
    email: Joi.string().email().required().messages({
      "string.base": language[lang].picker.email_invalid,
      "string.email": language[lang].picker.email_invalid_format,
      "any.required": language[lang].picker.email_required,
    }),
    password: Joi.string().min(6).required().messages({
      "string.base": language[lang].picker.password_invalid,
      "string.min": language[lang].picker.password_min,
      "any.required": language[lang].picker.password_required,
    }),
    role: Joi.string()
      .valid(
        "picker",
        "qc",
        "section_manager",
        "cashier",
        "cashier_manager",
        "finance_manager"
      )
      .required()
      .messages({
        "any.only": language[lang].picker.role_invalid,
        "any.required": language[lang].picker.role_required,
      }),
    store_id: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.store_id_invalid,
      "any.required": language[lang].picker.store_id_required,
    }),
  });

const editPickerSchema = (lang = "en") =>
  Joi.object({
    first_name: Joi.string().required().messages({
      "string.base": language[lang].picker.first_name_invalid,
      "any.required": language[lang].picker.first_name_required,
    }),
    last_name: Joi.string().required().messages({
      "string.base": language[lang].picker.last_name_invalid,
      "any.required": language[lang].picker.last_name_required,
    }),
    email: Joi.string().email().required().messages({
      "string.base": language[lang].picker.email_invalid,
      "string.email": language[lang].picker.email_invalid_format,
      "any.required": language[lang].picker.email_required,
    }),
    password: Joi.string().min(6).optional().messages({
      "string.base": language[lang].picker.password_invalid,
      "string.min": language[lang].picker.password_min,
    }),
    role: Joi.string()
      .valid(
        "picker",
        "qc",
        "section_manager",
        "cashier",
        "cashier_manager",
        "finance_manager"
      )
      .required()
      .messages({
        "any.only": language[lang].picker.role_invalid,
        "any.required": language[lang].picker.role_required,
      }),
    store_id: Joi.number().integer().optional().messages({
      "number.base": language[lang].picker.store_id_invalid,
    }),
  }).options({ presence: "required" });

const getAllSchema = (lang = "en") =>
  Joi.object({
    search: Joi.string().allow("").default("").messages({
      "string.base": language[lang].picker.search_invalid,
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].picker.limit_min,
      "number.max": language[lang].picker.limit_max,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].picker.page_min,
    }),
    role: Joi.array()
      .items(
        Joi.string().valid(
          "picker",
          "qc",
          "section_manager",
          "cashier",
          "cashier_manager",
          "finance_manager"
        )
      )
      .default(["picker", "qc", "section_manager"])
      .messages({
        "any.only": language[lang].picker.role_invalid,
      }),
    sort_by: Joi.string().default("id").messages({
      "string.base": language[lang].picker.sort_by_invalid,
    }),
    order_by: Joi.string().valid("asc", "desc").default("desc").messages({
      "any.only": language[lang].picker.order_by_invalid,
    }),
  });

const getByIdSchema = (lang = "en") =>
  Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.id_invalid,
      "any.required": language[lang].picker.id_required,
    }),
  }).unknown(true);

const deletePickerSchema = (lang = "en") =>
  Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.id_invalid,
      "any.required": language[lang].picker.id_required,
    }),
  }).unknown(true);

const getAllFinanceUsersSchema = (lang = "en") =>
  Joi.object({
    search: Joi.string().allow("").default("").messages({
      "string.base": language[lang].picker.search_invalid,
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].picker.limit_min,
      "number.max": language[lang].picker.limit_max,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].picker.page_min,
    }),
    role: Joi.array()
      .items(
        Joi.string().valid("cashier", "cashier_manager", "finance_manager")
      )
      .default(["cashier", "cashier_manager", "finance_manager"])
      .messages({
        "any.only": language[lang].picker.role_invalid,
      }),
    sort_by: Joi.string().default("id").messages({
      "string.base": language[lang].picker.sort_by_invalid,
    }),
    order_by: Joi.string().valid("asc", "desc").default("desc").messages({
      "any.only": language[lang].picker.order_by_invalid,
    }),
  });

const markItemAsPickedSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.order_id_invalid,
      "any.required": language[lang].picker.order_id_required,
    }),
    itemId: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.id_invalid,
    }),
  });

const replaceOrderItemsSchema = (lang = "en") =>
  Joi.object({
    orderId: Joi.number().integer().required().messages({
      "number.base": language[lang].picker.order_id_invalid,
      "any.required": language[lang].picker.order_id_required,
    }),
    items: Joi.array()
      .min(1)
      .items(
        Joi.object({
          productId: Joi.number().integer().required().messages({
            "number.base": language[lang].picker.id_invalid,
            "any.required": language[lang].picker.id_required,
          }),
          // storeId: Joi.number().integer().required().messages({
          //   "number.base": language[lang].picker.id_invalid,
          //   "any.required": language[lang].picker.id_required,
          // }),
          uomId: Joi.number().integer().required().messages({
            "number.base": language[lang].picker.id_invalid,
            "any.required": language[lang].picker.id_required,
          }),
          quantity: Joi.number().min(1).required().messages({
            "number.base": language[lang].picker.quantity_invalid,
            "number.min": language[lang].picker.quantity_min,
            "any.required": language[lang].picker.quantity_required,
          }),
          price: Joi.number().min(0).required().messages({
            "number.base": language[lang].picker.price_invalid,
            "number.min": language[lang].picker.price_min,
          }),
          salePrice: Joi.number().min(0).required().messages({
            "number.base": language[lang].picker.price_invalid,
            "number.min": language[lang].picker.price_min,
          }),
          costPrice: Joi.number().min(0).required().messages({
            "number.base": language[lang].picker.price_invalid,
            "number.min": language[lang].picker.price_min,
          }),
        })
      )
      .required()
      .messages({
        "array.min": language[lang].picker.items_required,
        "any.required": language[lang].picker.items_required,
      }),
  });

module.exports = {
  getUnassignedOrdersSchema,
  getAssignedOrdersSchema,
  assignOrderSchema,
  getOrderDetailsSchema,
  updateOrderStatusSchema,
  scanProductSchema,
  addPickerSchema,
  editPickerSchema,
  getAllSchema,
  getByIdSchema,
  deletePickerSchema,
  markItemAsPickedSchema,
  suggestProductSchema,
  replaceOrderItemsSchema,
};
