'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employee_salary_structures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      effective_to: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      is_current: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      gross_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      total_deductions: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      net_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: true,
        defaultValue: 'USD'
      },
      revision_reason: {
        type: Sequelize.STRING(255),
        allowNull: true
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

    await queryInterface.addIndex('employee_salary_structures', ['employee_id', 'is_current'], {
      name: 'idx_emp_current'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employee_salary_structures');
  }
};
