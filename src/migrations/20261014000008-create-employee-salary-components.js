'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employee_salary_components', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      structure_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employee_salary_structures',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      component_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'salary_components',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
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

    await queryInterface.addConstraint('employee_salary_components', {
      fields: ['structure_id', 'component_id'],
      type: 'unique',
      name: 'unique_structure_component'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employee_salary_components');
  }
};
