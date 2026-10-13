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
      country: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
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
    await queryInterface.addIndex('employees', ['name'], { name: 'idx_employees_name' });
    await queryInterface.addIndex('employees', ['country'], { name: 'idx_employees_country' });
    await queryInterface.addIndex('employees', ['department'], { name: 'idx_employees_department' });
    await queryInterface.addIndex('employees', ['designation'], { name: 'idx_employees_designation' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employees');
  }
};
