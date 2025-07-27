require("dotenv").config();
const { Op } = require("sequelize");
const moment = require("moment-timezone");
const { BreakTypesModel } = require("../models/index");
const language = require("../language");

const data = {};

// إنشاء نوع استراحة جديد
data.createBreakType = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { name, description } = req.body;
    const lang = req.headers.lang || "en";

    // التحقق من وجود اسم النوع
    const existingBreakType = await BreakTypesModel.findOne({
      where: { name },
    });

    if (existingBreakType) {
      return res.status(400).json({
        ack: 0,
        msg: language[lang].pickerType.break_type_exists,
      });
    }

    // إنشاء نوع الاستراحة
    const breakType = await BreakTypesModel.create({
      name,
      description,
      status: "active",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    res.status(200).json({
      ack: 1,
      msg: language[lang].pickerType.break_type_created,
      breakType: {
        id: breakType.id,
        name: breakType.name,
        description: breakType.description,
      },
    });
  } catch (e) {
    logger.error("Error: createBreakType API - " + e.message);
    console.log(e);
  }
};

// تعديل نوع استراحة
data.updateBreakType = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { breakTypeId, name, description, status } = req.body;
    const lang = req.headers.lang || "en";

    // التحقق من وجود نوع الاستراحة
    const breakType = await BreakTypesModel.findOne({
      where: { id: breakTypeId, status: { [Op.ne]: "deleted" } },
    });

    if (!breakType) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].pickerType.break_type_not_found,
      });
    }

    // التحقق من عدم وجود اسم مكرر
    if (name && name !== breakType.name) {
      const existingBreakType = await BreakTypesModel.findOne({
        where: { name },
      });

      if (existingBreakType) {
        return res.status(400).json({
          ack: 0,
          msg: language[lang].pickerType.break_type_exists,
        });
      }
    }

    // تحديث نوع الاستراحة
    await BreakTypesModel.update(
      {
        name: name || breakType.name,
        description:
          description !== undefined ? description : breakType.description,
        status: status || breakType.status,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      { where: { id: breakTypeId } }
    );

    res.status(200).json({
      ack: 1,
      msg: language[lang].pickerType.break_type_updated,
    });
  } catch (e) {
    logger.error("Error: updateBreakType API - " + e.message);
  }
};

// حذف نوع استراحة (soft delete)
data.deleteBreakType = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { breakTypeId } = req.body;
    const lang = req.headers.lang || "en";

    // التحقق من وجود نوع الاستراحة
    const breakType = await BreakTypesModel.findOne({
      where: { id: breakTypeId },
    });

    if (!breakType) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].pickerType.break_type_not_found,
      });
    }

    try {
      // حذف نوع الاستراحة (soft delete)
      await BreakTypesModel.destroy({ where: { id: breakTypeId } });
    } catch (error) {
      return res.status(400).json({
        ack: 1,
        msg: error.message,
      });
    }

    return res.status(200).json({
      ack: 1,
      msg: language[lang].pickerType.break_type_deleted,
    });
  } catch (e) {
    logger.error("Error: deleteBreakType API - " + e.message);
    console.log(e);
  }
};

// جلب كل أنواع الاستراحات
data.getAllBreakTypes = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { limit = 10, page = 1 } = req.query;
    const lang = req.headers.lang || "en";
    const offset = (page - 1) * limit;

    const breakTypes = await BreakTypesModel.findAndCountAll({
      limit: parseInt(limit),
      offset,
      attributes: ["id", "name", "description", "status"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      ack: 1,
      breakTypes: breakTypes.rows,
      totalCount: breakTypes.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(breakTypes.count / limit),
    });
  } catch (e) {
    logger.error("Error: getAllBreakTypes API - " + e.message);
  }
};

// جلب نوع استراحة واحد
data.getBreakTypeById = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { breakTypeId } = req.params;
    const lang = req.headers.lang || "en";

    const breakType = await BreakTypesModel.findOne({
      where: { id: breakTypeId },
      attributes: ["id", "name", "description", "status"],
    });

    if (!breakType) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].pickerType.break_type_not_found,
      });
    }

    res.status(200).json({
      ack: 1,
      breakType,
    });
  } catch (e) {
    logger.error("Error: getBreakTypeById API - " + e.message);
  }
};

// جلب أنواع الاستراحات للبيكر (نشطة فقط)
data.getBreakTypes = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const breakTypes = await BreakTypesModel.findAll({
      attributes: ["id", "name", "description"],
    });

    res.status(200).json({
      ack: 1,
      breakTypes,
    });
  } catch (e) {
    logger.error("Error: getBreakTypes API - " + e.message);
  }
};

module.exports = data;
