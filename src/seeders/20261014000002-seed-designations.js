'use strict';

const departmentDesignations = {
  'Engineering': [
    'Junior Software Engineer',
    'Software Engineer',
    'Senior Software Engineer',
    'Tech Lead',
    'Engineering Manager',
    'QA Engineer',
    'DevOps Engineer'
  ],
  'Product': [
    'Associate Product Manager',
    'Product Manager',
    'Senior Product Manager',
    'UI/UX Designer',
    'Head of Product'
  ],
  'Human Resources': [
    'HR Executive',
    'HR Specialist',
    'Talent Acquisition Lead',
    'HR Manager',
    'VP of Human Resources'
  ],
  'Finance': [
    'Junior Accountant',
    'Financial Analyst',
    'Senior Accountant',
    'Finance Manager',
    'Finance Director'
  ],
  'Sales': [
    'Business Development Associate',
    'Account Executive',
    'Senior Sales Executive',
    'Sales Manager',
    'VP of Sales'
  ],
  'Marketing': [
    'Content Marketing Specialist',
    'SEO Specialist',
    'Digital Marketing Manager',
    'Brand Marketing Lead'
  ],
  'Operations': [
    'Operations Associate',
    'Operations Coordinator',
    'Operations Manager',
    'Director of Operations'
  ],
  'Customer Support': [
    'Customer Support Representative',
    'Customer Support Lead',
    'Customer Success Manager'
  ]
};

module.exports = {
  async up(queryInterface, Sequelize) {
    // Dynamically look up department IDs by department name
    const [departments] = await queryInterface.sequelize.query(
      'SELECT id, name FROM departments;'
    );

    const deptMap = {};
    for (const d of departments) {
      deptMap[d.name] = d.id;
    }

    for (const [deptName, desigList] of Object.entries(departmentDesignations)) {
      const deptId = deptMap[deptName];
      if (deptId) {
        for (const desigName of desigList) {
          const safeName = desigName.replace(/'/g, "\\'");
          await queryInterface.sequelize.query(`
            INSERT INTO designations (name, department_id, created_at, updated_at)
            VALUES ('${safeName}', ${deptId}, NOW(), NOW())
            ON DUPLICATE KEY UPDATE updated_at = NOW();
          `);
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('designations', null, {});
  }
};
