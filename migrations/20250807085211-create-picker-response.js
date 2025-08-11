"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("picker_response_times", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      orderDetailId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      pickerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "picker_users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      storeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "stores",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      response_time_seconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Response time in seconds",
      },
      item_status: {
        type: Sequelize.ENUM(
          "out_of_stock",
          "quantity_insufficient",
          "item_canceled",
          "picked_successfully",
          "replaced"
        ),
        allowNull: true,
      },
      original_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      picked_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      notes: {
        type: Sequelize.TEXT,
        defaultValue: "",
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      updated_by: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: "active",
      },
    });

    // إضافة فهرس فريد لمنع تكرار تسجيل الوقت لنفس العنصر والبيكر
    await queryInterface.addIndex("picker_response_times", {
      fields: ["orderId", "orderDetailId", "pickerId"],
      unique: true,
      name: "unique_order_item_picker",
    });

    // إضافة فهارس للبحث السريع
    await queryInterface.addIndex("picker_response_times", {
      fields: ["orderId"],
      name: "idx_picker_response_times_order_id",
    });

    await queryInterface.addIndex("picker_response_times", {
      fields: ["pickerId"],
      name: "idx_picker_response_times_picker_id",
    });

    await queryInterface.addIndex("picker_response_times", {
      fields: ["storeId"],
      name: "idx_picker_response_times_store_id",
    });

    await queryInterface.addIndex("picker_response_times", {
      fields: ["is_completed"],
      name: "idx_picker_response_times_is_completed",
    });

    await queryInterface.addIndex("picker_response_times", {
      fields: ["item_status"],
      name: "idx_picker_response_times_item_status",
    });

    await queryInterface.addIndex("picker_response_times", {
      fields: ["createdAt"],
      name: "idx_picker_response_times_created_at",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // حذف الفهارس أولاً
    await queryInterface.removeIndex(
      "picker_response_times",
      "unique_order_item_picker"
    );
    await queryInterface.removeIndex(
      "picker_response_times",
      "idx_picker_response_times_order_id"
    );
    await queryInterface.removeIndex(
      "picker_response_times",
      "idx_picker_response_times_picker_id"
    );
    await queryInterface.removeIndex(
      "picker_response_times",
      "idx_picker_response_times_store_id"
    );
    await queryInterface.removeIndex(
      "picker_response_times",
      "idx_picker_response_times_is_completed"
    );
    await queryInterface.removeIndex(
      "picker_response_times",
      "idx_picker_response_times_item_status"
    );
    await queryInterface.removeIndex(
      "picker_response_times",
      "idx_picker_response_times_created_at"
    );

    // ثم حذف الجدول
    await queryInterface.dropTable("picker_response_times");
  },
};
