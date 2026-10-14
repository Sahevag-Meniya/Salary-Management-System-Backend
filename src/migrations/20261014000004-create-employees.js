'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      country_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'countries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      designation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'designations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    await queryInterface.addIndex('employees', ['name'], {
      name: 'idx_employees_name'
    });

    await queryInterface.addIndex('employees', ['country_id'], {
      name: 'idx_employees_country_id'
    });

    await queryInterface.addIndex('employees', ['designation_id'], {
      name: 'idx_employees_designation_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employees');
  }
};
