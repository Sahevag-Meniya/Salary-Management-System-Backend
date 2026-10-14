'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salary_slips', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      slip_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      salary_structure_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employee_salary_structures',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      month: {
        type: Sequelize.TINYINT,
        allowNull: false
      },
      year: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      working_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      paid_days: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      unpaid_days: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
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
        allowNull: false,
        defaultValue: 'USD'
      },
      status: {
        type: Sequelize.ENUM('draft', 'generated', 'paid'),
        allowNull: false,
        defaultValue: 'generated'
      },
      salary_details: {
        type: Sequelize.JSON,
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

    await queryInterface.addConstraint('salary_slips', {
      fields: ['employee_id', 'month', 'year'],
      type: 'unique',
      name: 'unique_employee_month_year'
    });

    await queryInterface.addIndex('salary_slips', ['month', 'year'], {
      name: 'idx_salary_slips_month_year'
    });

    await queryInterface.addIndex('salary_slips', ['status'], {
      name: 'idx_salary_slips_status'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('salary_slips');
  }
};
