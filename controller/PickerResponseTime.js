require("dotenv").config();
const { Op, sequelize } = require("sequelize");
const moment = require("moment");
const language = require("../language/index");

const {
  OrdersModel,
  OrdersDetailModel,
  ProductsModel,
  PickerResponseTimeModel, // النموذج الجديد
} = require("../models/index");

const data = {};

// بدء تسجيل وقت الاستجابة لعنصر معين
data.startResponseTime = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { orderId, orderDetailId } = req.body;

    // التحقق من صحة الطلب والعنصر
    const orderDetail = await OrdersDetailModel.findOne({
      where: {
        id: orderDetailId,
        orderId: orderId,
      },
      include: [
        {
          model: OrdersModel,
          where: {
            storeId: auth_data.store_id,
            pickerId: auth_data.id,
            picker_status: "in_pick",
          },
        },
      ],
    });

    if (!orderDetail) {
      return res.status(404).json({
        ack: 0,
        msg:
          language[lang]?.pickerResponse?.order_item_not_found ||
          "Order item not found",
      });
    }

    // التحقق من عدم وجود تسجيل وقت مسبق لنفس العنصر
    const existingRecord = await PickerResponseTimeModel.findOne({
      where: {
        orderId,
        orderDetailId,
        pickerId: auth_data.id,
      },
    });

    if (existingRecord) {
      return res.status(400).json({
        ack: 0,
        msg:
          language[lang]?.pickerResponse?.response_time_already_started ||
          "Response time tracking already started for this item",
      });
    }

    // إنشاء سجل جديد لتسجيل الوقت
    const responseTime = await PickerResponseTimeModel.create({
      orderId,
      orderDetailId,
      pickerId: auth_data.id,
      storeId: auth_data.store_id,
      productId: orderDetail.productId,
      original_quantity: orderDetail.quantity,
      start_time: new Date(),
      is_completed: false,
      created_by: auth_data.id,
    });

    res.status(200).json({
      ack: 1,
      msg:
        language[lang]?.pickerResponse?.response_time_started ||
        "Response time tracking started",
      responseTimeId: responseTime.id,
    });
  } catch (e) {
    console.error("Error in startResponseTime:", e);
    res.status(500).json({
      ack: 0,
      msg: "Internal server error",
    });
  }
};

// إنهاء تسجيل وقت الاستجابة مع حالة العنصر
data.endResponseTime = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const {
      orderId,
      orderDetailId,
      itemStatus,
      pickedQuantity = 0,
      notes = "",
    } = req.body;

    // البحث عن السجل الموجود
    const responseTimeRecord = await PickerResponseTimeModel.findOne({
      where: {
        orderId,
        orderDetailId,
        pickerId: auth_data.id,
        is_completed: false,
      },
    });

    if (!responseTimeRecord) {
      return res.status(404).json({
        ack: 0,
        msg:
          language[lang]?.picker?.response_time_not_found ||
          "Response time record not found or already completed",
      });
    }

    // حساب الوقت المستغرق بالثواني
    const endTime = new Date();
    const startTime = new Date(responseTimeRecord.start_time);
    const responseTimeSeconds = Math.floor((endTime - startTime) / 1000);

    // تحديث السجل
    await PickerResponseTimeModel.update(
      {
        end_time: endTime,
        response_time_seconds: responseTimeSeconds,
        item_status: itemStatus,
        picked_quantity: pickedQuantity,
        notes: notes,
        is_completed: true,
        updated_by: auth_data.id,
      },
      {
        where: { id: responseTimeRecord.id },
      }
    );

    res.status(200).json({
      ack: 1,
      msg:
        language[lang]?.picker?.response_time_completed ||
        "Response time tracking completed",
      responseTimeSeconds: responseTimeSeconds,
      responseTimeMinutes: Math.round((responseTimeSeconds / 60) * 100) / 100,
    });
  } catch (e) {
    console.error("Error in endResponseTime:", e);
    res.status(500).json({
      ack: 0,
      msg: "Internal server error",
    });
  }
};

// الحصول على إجمالي أوقات الاستجابة لطلب معين
data.getOrderResponseTimes = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { orderId } = req.params;

    // التحقق من صحة الطلب
    const order = await OrdersModel.findOne({
      where: {
        id: orderId,
        storeId: auth_data.store_id,
      },
    });

    if (!order) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang]?.picker?.order_not_found || "Order not found",
      });
    }

    // جلب جميع أوقات الاستجابة للطلب
    const responseTimes = await PickerResponseTimeModel.findAll({
      where: {
        orderId,
        pickerId: auth_data.id,
      },
      include: [
        {
          model: OrdersDetailModel,
          include: [
            {
              model: ProductsModel,
              attributes: ["id", "itemCode"],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // حساب إجمالي الوقت والإحصائيات
    const totalResponseTime = responseTimes
      .filter((rt) => rt.is_completed)
      .reduce((total, rt) => total + (rt.response_time_seconds || 0), 0);

    const completedItems = responseTimes.filter((rt) => rt.is_completed).length;
    const pendingItems = responseTimes.filter((rt) => !rt.is_completed).length;

    // تجميع حسب حالة العنصر
    const statusBreakdown = responseTimes
      .filter((rt) => rt.is_completed)
      .reduce((acc, rt) => {
        const status = rt.item_status || "unknown";
        if (!acc[status]) {
          acc[status] = { count: 0, totalTime: 0 };
        }
        acc[status].count++;
        acc[status].totalTime += rt.response_time_seconds || 0;
        return acc;
      }, {});

    res.status(200).json({
      ack: 1,
      orderId: orderId,
      pickerId: auth_data.id,
      totalItems: responseTimes.length,
      completedItems: completedItems,
      pendingItems: pendingItems,
      totalResponseTimeSeconds: totalResponseTime,
      totalResponseTimeMinutes:
        Math.round((totalResponseTime / 60) * 100) / 100,
      averageResponseTimeSeconds:
        completedItems > 0 ? Math.round(totalResponseTime / completedItems) : 0,
      statusBreakdown: statusBreakdown,
      itemDetails: responseTimes,
    });
  } catch (e) {
    console.error("Error in getOrderResponseTimes:", e);
    res.status(500).json({
      ack: 0,
      msg: "Internal server error",
    });
  }
};

// الحصول على إحصائيات أوقات الاستجابة للبيكر
data.getPickerResponseStats = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const auth_data = req.auth_data;
    const { startDate, endDate, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.between]: [
            moment(startDate).startOf("day").toDate(),
            moment(endDate).endOf("day").toDate(),
          ],
        },
      };
    }

    // إحصائيات عامة
    const totalStats = await PickerResponseTimeModel.findAll({
      where: {
        pickerId: auth_data.id,
        storeId: auth_data.store_id,
        is_completed: true,
        ...dateFilter,
      },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalItems"],
        [
          sequelize.fn("SUM", sequelize.col("response_time_seconds")),
          "totalResponseTime",
        ],
        [
          sequelize.fn("AVG", sequelize.col("response_time_seconds")),
          "avgResponseTime",
        ],
        [
          sequelize.fn("MIN", sequelize.col("response_time_seconds")),
          "minResponseTime",
        ],
        [
          sequelize.fn("MAX", sequelize.col("response_time_seconds")),
          "maxResponseTime",
        ],
      ],
      raw: true,
    });

    // إحصائيات حسب الحالة
    const statusStats = await PickerResponseTimeModel.findAll({
      where: {
        pickerId: auth_data.id,
        storeId: auth_data.store_id,
        is_completed: true,
        ...dateFilter,
      },
      attributes: [
        "item_status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [
          sequelize.fn("AVG", sequelize.col("response_time_seconds")),
          "avgTime",
        ],
      ],
      group: ["item_status"],
      raw: true,
    });

    res.status(200).json({
      ack: 1,
      pickerId: auth_data.id,
      dateRange: { startDate, endDate },
      overallStats: totalStats[0],
      statusBreakdown: statusStats,
    });
  } catch (e) {
    console.error("Error in getPickerResponseStats:", e);
    res.status(500).json({
      ack: 0,
      msg: "Internal server error",
    });
  }
};

// الحصول على العناصر المعلقة (التي لم ينته تسجيل وقتها)
data.getPendingResponseItems = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const auth_data = req.auth_data;

    const pendingItems = await PickerResponseTimeModel.findAll({
      where: {
        pickerId: auth_data.id,
        storeId: auth_data.store_id,
        is_completed: false,
      },
      include: [
        {
          model: OrdersModel,
          attributes: ["id", "order_id", "status"],
        },
        {
          model: OrdersDetailModel,
          include: [
            {
              model: ProductsModel,
              attributes: ["id", "itemCode"],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // حساب الوقت المنقضي حتى الآن لكل عنصر معلق
    const itemsWithElapsedTime = pendingItems.map((item) => {
      const elapsedSeconds = Math.floor(
        (new Date() - new Date(item.start_time)) / 1000
      );
      return {
        ...item.toJSON(),
        elapsedTimeSeconds: elapsedSeconds,
        elapsedTimeMinutes: Math.round((elapsedSeconds / 60) * 100) / 100,
      };
    });

    res.status(200).json({
      ack: 1,
      pendingItems: itemsWithElapsedTime,
      totalPendingItems: pendingItems.length,
    });
  } catch (e) {
    console.error("Error in getPendingResponseItems:", e);
    res.status(500).json({
      ack: 0,
      msg: "Internal server error",
    });
  }
};

module.exports = data;
