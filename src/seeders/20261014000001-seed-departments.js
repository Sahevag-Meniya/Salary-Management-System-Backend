'use strict';

const departments = [
  { name: 'Engineering' },
  { name: 'Product' },
  { name: 'Human Resources' },
  { name: 'Finance' },
  { name: 'Sales' },
  { name: 'Marketing' },
  { name: 'Operations' },
  { name: 'Customer Support' }
];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const dept of departments) {
      await queryInterface.sequelize.query(`
        INSERT INTO departments (name, created_at, updated_at)
        VALUES ('${dept.name}', NOW(), NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW();
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const names = departments.map(d => d.name);
    await queryInterface.bulkDelete('departments', {
      name: {
        [Sequelize.Op.in]: names
      }
    }, {});
  }
};
