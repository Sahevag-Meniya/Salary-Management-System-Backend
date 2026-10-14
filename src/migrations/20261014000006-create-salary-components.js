'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salary_components', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.ENUM('earning', 'deduction'),
        allowNull: false
      },
      calculation_type: {
        type: Sequelize.ENUM('fixed', 'percentage', 'remaining'),
        allowNull: false,
        defaultValue: 'fixed'
      },
      default_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      percentage_of_component_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'salary_components',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('salary_components', ['type'], {
      name: 'idx_salary_components_type'
    });

    await queryInterface.addIndex('salary_components', ['is_active'], {
      name: 'idx_salary_components_is_active'
    });

    await queryInterface.addIndex('salary_components', ['percentage_of_component_id'], {
      name: 'idx_salary_components_percentage_of'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('salary_components');
  }
};
