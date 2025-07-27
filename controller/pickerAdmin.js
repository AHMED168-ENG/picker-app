require("dotenv").config();
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const { PickerUsersModel, StoresModel } = require("../models/index");
const language = require("../language/index");

PickerUsersModel.belongsTo(StoresModel, {
  foreignKey: "store_id",
  as: "stores", // اسم العلاقة اللي هتستخدم في الـ include
});
const data = {};

// إضافة Picker
data.addPicker = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { first_name, last_name, email, password, role, store_id } = req.body;

    // التحقق من وجود الفرع
    const store = await StoresModel.findOne({
      where: { id: store_id, status: "active" },
    });
    if (!store) {
      return res.status(400).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.store_not_found,
      });
    }

    const existingEmail = await PickerUsersModel.findOne({
      where: { email: email.toLowerCase(), status: { [Op.not]: "deleted" } },
    });
    if (existingEmail) {
      return res.status(400).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.email_already_exist,
      });
    }

    const pickerData = {
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, 10),
      language: req.headers.lang || "en",
      role,
      store_id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      created_by: auth_data.id,
      updated_by: auth_data.id,
    };

    await PickerUsersModel.create(pickerData);
    res.status(200).json({
      ack: 1,
      msg: language[req.headers.lang || "en"].picker.added_successfully,
    });
  } catch (e) {
    logger.error("Error: addPicker API - " + e.message);
    res.status(500).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].picker.add_error,
    });
  }
};

// تعديل Picker
data.editPicker = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const { id } = req.params;
    const { first_name, last_name, email, password, role, store_id } = req.body;

    // التحقق من وجود الفرع
    if (store_id) {
      const store = await StoresModel.findOne({
        where: { id: store_id, status: "active" },
      });
      if (!store) {
        return res.status(400).json({
          ack: 0,
          msg: language[req.headers.lang || "en"].picker.store_not_found,
        });
      }
    }

    const existingEmail = await PickerUsersModel.findOne({
      where: {
        email: email.toLowerCase(),
        id: { [Op.not]: id },
        status: { [Op.not]: "deleted" },
      },
    });
    if (existingEmail) {
      return res.status(400).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.email_already_exist,
      });
    }

    const pickerData = {
      first_name,
      last_name,
      email: email.toLowerCase(),
      role,
      updatedAt: new Date(),
      updated_by: auth_data.id,
    };
    if (password) {
      pickerData.password = bcrypt.hashSync(password, 10);
    }
    if (store_id) {
      pickerData.store_id = store_id;
    }

    await PickerUsersModel.update(pickerData, { where: { id } });
    res.status(200).json({
      ack: 1,
      msg: language[req.headers.lang || "en"].picker.updated_successfully,
    });
  } catch (e) {
    logger.error("Error: editPicker API - " + e.message);
    res.status(500).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].picker.edit_error,
    });
  }
};

// جلب جميع الـ Pickers
data.getAll = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const {
      search = "",
      limit = 10,
      page = 1,
      role = ["picker", "qc", "section_manager"],
      sort_by = "id",
      order_by = "desc",
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { status: "active", role: { [Op.in]: role } };

    if (search) {
      where[Op.or] = [{ first_name: { [Op.iLike]: `%${search}%` } }];
    }
    const pickers = await PickerUsersModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sort_by, order_by]],
      include: [
        {
          model: StoresModel,
          as: "stores",
          attributes: [
            "id",
            "country",
            "banner_image",
            "business_address",
            "slug",
          ],
        },
      ], // استخدام alias "store" كما تم تعريفه
    });

    console.log(pickers);

    res.status(200).json({
      ack: 1,
      pickers: pickers.rows,
      totalCount: pickers.count,
      currentPage: page,
      totalPages: Math.ceil(pickers.count / limit),
    });
  } catch (e) {
    console.log(e);
    logger.error("Error: getAllPickers API - " + e.message);
    res.status(500).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].picker.fetch_error,
    });
  }
};

// جلب Picker بـ ID
data.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const picker = await PickerUsersModel.findOne({
      where: { id, status: "active" },
      include: [
        {
          model: StoresModel,
          as: "stores",
          attributes: [
            "id",
            "country",
            "banner_image",
            "business_address",
            "slug",
          ],
        },
      ], // استخدام alias "store" كما تم تعريفه
    });

    if (!picker) {
      return res.status(404).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.not_found,
      });
    }

    res.status(200).json({
      ack: 1,
      picker,
    });
  } catch (e) {
    logger.error("Error: getPickerById API - " + e.message);
    res.status(500).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].picker.fetch_error,
    });
  }
};

// حذف Picker
data.deletePicker = async (req, res) => {
  try {
    const { id } = req.params;

    const picker = await PickerUsersModel.findOne({
      where: { id, status: "active" },
    });

    if (!picker) {
      return res.status(404).json({
        ack: 0,
        msg: language[req.headers.lang || "en"].picker.not_found,
      });
    }

    await PickerUsersModel.update({ status: "deleted" }, { where: { id } });
    res.status(200).json({
      ack: 1,
      msg: language[req.headers.lang || "en"].picker.deleted_successfully,
    });
  } catch (e) {
    logger.error("Error: deletePicker API - " + e.message);
    res.status(500).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].picker.delete_error,
    });
  }
};

// جلب مستخدمي المالية
data.getAllFinanceUsers = async (req, res) => {
  try {
    const auth_data = req.auth_data;
    const {
      search = "",
      limit = 10,
      page = 1,
      role = ["cashier", "cashier_manager", "finance_manager"],
      sort_by = "id",
      order_by = "desc",
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { status: "active", role: { [Op.in]: role } };

    if (search) {
      where[Op.or] = [{ first_name: { [Op.iLike]: `%${search}%` } }];
    }

    const users = await PickerUsersModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sort_by, order_by]],
      include: [{ model: StoresModel, attributes: ["id", "name"] }],
    });

    res.status(200).json({
      ack: 1,
      users: users.rows,
      totalCount: users.count,
      currentPage: page,
      totalPages: Math.ceil(users.count / limit),
    });
  } catch (e) {
    logger.error("Error: getAllFinanceUsers API - " + e.message);
    res.status(500).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].picker.fetch_error,
    });
  }
};

module.exports = data;
