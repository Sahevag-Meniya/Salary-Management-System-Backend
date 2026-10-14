'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('countries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      code: {
        type: Sequelize.STRING(3),
        allowNull: false,
        unique: true
      },
      currency_code: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      currency_symbol: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('countries', ['name'], {
      name: 'idx_countries_name'
    });

    await queryInterface.addIndex('countries', ['currency_code'], {
      name: 'idx_countries_currency_code'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('countries');
  }
};
