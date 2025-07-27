'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('break_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pickerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'picker_users',
          key: 'id',
        },
      },
      breakTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'break_types',
          key: 'id',
        },
      },
      storeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id',
        },
      },
      requestNote: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      voiceNote: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'pending',
      },
      managerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'picker_users',
          key: 'id',
        },
      },
      managerNote: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('break_requests');
  },
};