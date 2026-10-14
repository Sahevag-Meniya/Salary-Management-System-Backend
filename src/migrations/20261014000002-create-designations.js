'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('designations', {
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
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('designations', ['department_id'], {
      name: 'idx_designations_department_id'
    });

    await queryInterface.addConstraint('designations', {
      fields: ['department_id', 'name'],
      type: 'unique',
      name: 'uk_dept_designation'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('designations');
  }
};
