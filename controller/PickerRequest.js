require("dotenv").config();
const { Op } = require("sequelize");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Qatar");
const notificationService = require("../services/notification");
const language = require("../language");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const {
  OrdersModel,
  BreakTypesModel,
  BreakRequestsModel,
  StoresModel,
  PickerUsersModel,
} = require("../models/index");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI,
});

BreakRequestsModel.belongsTo(BreakTypesModel, {
  foreignKey: "breakTypeId",
});

BreakRequestsModel.belongsTo(PickerUsersModel, {
  foreignKey: "pickerId",
  as: "picker",
});

const data = {};

// Helper function to convert voice to text
const convertVoiceToText = async (voiceFilePath) => {
  try {
    const absolutePath = path.join(
      __dirname,
      "../",
      "uploads",
      "voice_notes",
      path.basename(voiceFilePath)
    );
    console.log(absolutePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Voice file not found");
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(absolutePath),
      model: "whisper-1",
      language: "ar", // Arabic, can be dynamic based on user preference
    });

    return transcription.text;
  } catch (error) {
    console.error("Error converting voice to text:", error);
    throw new Error("Failed to convert voice to text");
  }
};

data.requestBreak = async (req, res, next) => {
  try {
    const auth_data = req.auth_data;
    const { breakTypeId, requestNote, voiceNote, voiceText } = req.body;
    const lang = req.headers.lang || "en";
    const storeId = auth_data.store_id;

    // التحقق من عدم وجود طلب مخصص
    const assignedOrder = await OrdersModel.findOne({
      where: { pickerId: auth_data.id, picker_status: ["in_pick", "repick"] },
    });

    if (assignedOrder) {
      return res.status(400).json({
        ack: 0,
        msg: language[lang].pickerType.break_request_order_assigned,
      });
    }

    // التحقق من نوع الاستراحة
    let breakType;
    if (breakTypeId === "other") {
      // إنشاء breakType وهمي للـ "other"
      breakType = { id: null, name: "other" };
    } else {
      breakType = await BreakTypesModel.findOne({
        where: { id: breakTypeId, status: "active" },
      });

      if (!breakType) {
        return res.status(404).json({
          ack: 0,
          msg: language[lang].pickerType.break_type_not_found,
        });
      }
    }

    // let voiceText = null;

    // إذا كان breakTypeId هو "other" ومطلوب voice note
    // if (breakTypeId === "other" && voiceNote) {
    //   try {
    //     // تحويل الصوت لنص
    //     voiceText = await convertVoiceToText(voiceNote);
    //   } catch (error) {
    //     return res.status(400).json({
    //       ack: 0,
    //       msg: language[lang].pickerType.voice_conversion_failed,
    //     });
    //   }
    // }
    // إنشاء طلب الاستراحة
    const breakRequest = await BreakRequestsModel.create({
      pickerId: auth_data.id,
      breakTypeId: breakTypeId === "other" ? null : breakTypeId,
      storeId,
      requestNote: breakTypeId === "other" ? voiceText : requestNote,
      voiceNote: breakTypeId === "other" ? voiceNote : null,
      voiceText: voiceText,
      status: "pending",
      created_by: auth_data.id,
      updated_by: auth_data.id,
    });

    const store = await StoresModel.findOne({
      where: { id: storeId },
      attributes: ["userId", "id"],
    });

    if (!store) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang]?.picker?.store_not_found || "Store not found",
      });
    }

    // إرسال إشعار للمشرف
    await notificationService.notifyStoreOwnerBreakRequest({
      storeOwnerId: store.userId,
      pickerId: auth_data.id,
      breakRequestId: breakRequest.id,
      pickerName: `${auth_data.first_name} ${auth_data.last_name}`,
      breakReason: breakType.name,
      breakNote: breakTypeId === "other" ? voiceText : requestNote,
    });

    res.status(200).json({
      ack: 1,
      msg: language[lang].pickerType.break_request_submitted,
      breakRequest: {
        ...breakRequest.toJSON(),
        voiceText: voiceText,
      },
    });
  } catch (e) {
    console.log("Error: requestBreak API - " + e.message);
    next(e);
  }
};
// جلب طلبات الاستراحة الخاصة بالبيكر
data.getPickerBreakRequests = async (req, res, next) => {
  try {
    const auth_data = req.auth_data;
    const { limit = 10, page = 1 } = req.query;
    const lang = req.headers.lang || "en";
    const offset = (page - 1) * limit;

    const breakRequests = await BreakRequestsModel.findAndCountAll({
      where: { pickerId: auth_data.id },
      limit: parseInt(limit),
      offset,
      attributes: [
        "id",
        "breakTypeId",
        "requestNote",
        "voiceNote",
        "voiceText",
        "status",
        "managerNote",
        "createdAt",
      ],
      include: [
        {
          model: BreakTypesModel,
          attributes: ["id", "name", "description"],
        },
        {
          model: PickerUsersModel,
          as: "picker",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      ack: 1,
      breakRequests: breakRequests.rows,
      totalCount: breakRequests.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(breakRequests.count / limit),
    });
  } catch (e) {
    console.error("Error: getPickerBreakRequests API - " + e.message);
    next(e);
  }
};

// جلب طلبات الاستراحة للأدمن
data.getAdminBreakRequests = async (req, res, next) => {
  try {
    const auth_data = req.auth_data;
    const { limit = 10, page = 1 } = req.query;
    const lang = req.headers.lang || "en";
    const offset = (page - 1) * limit;

    const breakRequests = await BreakRequestsModel.findAndCountAll({
      where: { status: "pending" },
      limit: parseInt(limit),
      offset,
      attributes: [
        "id",
        "breakTypeId",
        "requestNote",
        "voiceNote",
        "voiceText",
        "status",
        "managerNote",
        "createdAt",
      ],
      include: [
        {
          model: BreakTypesModel,
          attributes: ["id", "name", "description"],
        },
        {
          model: PickerUsersModel,
          as: "picker",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      ack: 1,
      breakRequests: breakRequests.rows,
      totalCount: breakRequests.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(breakRequests.count / limit),
    });
  } catch (e) {
    console.error("Error: getAdminBreakRequests API - " + e.message);
    next(e);
  }
};

// جلب طلب استراحة واحد للبيكر
data.getOnePickerBreakRequest = async (req, res, next) => {
  try {
    const auth_data = req.auth_data;
    const { breakRequestId } = req.params;

    const breakRequest = await BreakRequestsModel.findOne({
      where: { pickerId: auth_data.id, id: breakRequestId },
      attributes: [
        "id",
        "breakTypeId",
        "requestNote",
        "voiceNote",
        "voiceText",
        "status",
        "managerNote",
        "createdAt",
      ],
      include: [
        {
          model: BreakTypesModel,
          attributes: ["id", "name", "description"],
        },
        {
          model: PickerUsersModel,
          as: "picker",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    if (!breakRequest) {
      return res.status(404).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].pickerType
          .break_request_not_found,
      });
    }

    res.status(200).json({
      ack: 1,
      breakRequest: breakRequest,
    });
  } catch (e) {
    console.error("Error: getOnePickerBreakRequest API - " + e.message);
    next(e);
  }
};

// إلغاء طلب استراحة (للبيكر)
data.cancelBreakRequest = async (req, res, next) => {
  try {
    const auth_data = req.auth_data;
    const { breakRequestId } = req.params;
    const lang = req.headers.lang || "en";
    const storeId = auth_data.store_id;

    // التحقق من طلب الاستراحة
    const breakRequest = await BreakRequestsModel.findOne({
      where: { id: breakRequestId, pickerId: auth_data.id, status: "pending" },
    });

    if (!breakRequest) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].pickerType.break_request_not_found,
      });
    }

    // إلغاء الطلب
    await BreakRequestsModel.update(
      {
        status: "cancelled",
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      { where: { id: breakRequestId } }
    );

    const store = await StoresModel.findOne({
      where: { id: storeId },
      attributes: ["userId", "id"],
    });

    if (!store) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang]?.picker?.store_not_found || "Store not found",
      });
    }

    await notificationService.notifyPickerCancelledOrder({
      storeOwnerId: store.userId,
      pickerId: auth_data.id,
      breakRequestId: breakRequestId,
      pickerName: `${auth_data.first_name} ${auth_data.last_name}`,
    });

    res.status(200).json({
      ack: 1,
      msg: language[lang].pickerType.break_request_cancelled,
    });
  } catch (e) {
    console.error("Error: cancelBreakRequest API - " + e.message);
    next(e);
  }
};

// الموافقة/الرفض على طلب استراحة (للأدمن)
data.manageBreakRequest = async (req, res, next) => {
  try {
    const auth_data = req.auth_data;
    const { breakRequestId, status, managerNote } = req.body;
    const lang = req.headers.lang || "en";

    // التحقق من طلب الاستراحة
    const breakRequest = await BreakRequestsModel.findOne({
      where: {
        id: breakRequestId,
        status: "pending",
      },
    });

    if (!breakRequest) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].pickerType.break_request_not_found,
      });
    }

    // تحديث حالة الطلب
    await BreakRequestsModel.update(
      {
        status,
        managerId: auth_data.id,
        managerNote,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      { where: { id: breakRequestId } }
    );

    // إرسال إشعار للبيكر
    await notificationService.notifyPickerBreakResponse({
      pickerId: breakRequest.pickerId,
      approved: status === "approved",
      adminNote: managerNote,
    });

    res.status(200).json({
      ack: 1,
      msg: language[lang].pickerType.break_request_updated,
    });
  } catch (e) {
    console.error("Error: manageBreakRequest API - " + e.message);
    next(e);
  }
};

// رفع الملف الصوتي
data.uploadVoiceNote = async (req, res, next) => {
  try {
    const lang = req.headers.lang || "en";

    // التحقق من وجود الملف في الطلب
    if (!req.file) {
      return res.status(400).json({
        ack: 0,
        msg:
          language[lang]?.picker?.no_file_uploaded || "No voice note uploaded",
        data: null,
      });
    }

    // إنشاء المسار النسبي للملف
    const voiceNotePath = req.file.path
      .replace(/\\/g, "/")
      .match(/\/voice_notes\/.+$/)[0];

    return res.status(200).json({
      ack: 1,
      msg:
        language[lang]?.picker?.voice_note_uploaded ||
        "Voice note uploaded successfully",
      data: voiceNotePath,
    });
  } catch (error) {
    console.error("Error in uploadVoiceNote:", error);
    next(error);
  }
};

module.exports = data;
