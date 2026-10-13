'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salaries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      basic_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      allowances: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      deductions: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      gross_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      net_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      effective_from: {
        type: Sequelize.DATEONLY,
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

    // Performance Indexes for 10,000+ records
    await queryInterface.addIndex('salaries', ['employee_id'], { name: 'idx_salaries_employee_id' });
    await queryInterface.addIndex('salaries', ['net_salary'], { name: 'idx_salaries_net_salary' });
    await queryInterface.addIndex('salaries', ['currency'], { name: 'idx_salaries_currency' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('salaries');
  }
};
