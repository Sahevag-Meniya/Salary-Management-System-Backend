'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Base components without dependencies
    const baseComponents = [
      {
        name: 'Basic Salary',
        code: 'BASIC',
        type: 'earning',
        calculation_type: 'fixed',
        default_value: 0.00,
        is_active: true
      },
      {
        name: 'Conveyance Allowance',
        code: 'CONVEYANCE',
        type: 'earning',
        calculation_type: 'fixed',
        default_value: 1600.00,
        is_active: true
      },
      {
        name: 'Medical Allowance',
        code: 'MEDICAL',
        type: 'earning',
        calculation_type: 'fixed',
        default_value: 1250.00,
        is_active: true
      },
      {
        name: 'Special Allowance',
        code: 'SPECIAL',
        type: 'earning',
        calculation_type: 'remaining',
        default_value: 0.00,
        is_active: true
      },
      {
        name: 'Performance Bonus',
        code: 'BONUS',
        type: 'earning',
        calculation_type: 'fixed',
        default_value: 0.00,
        is_active: true
      },
      {
        name: 'Tax Deducted at Source (TDS)',
        code: 'TDS',
        type: 'deduction',
        calculation_type: 'fixed',
        default_value: 0.00,
        is_active: true
      },
      {
        name: 'Professional Tax',
        code: 'PROF_TAX',
        type: 'deduction',
        calculation_type: 'fixed',
        default_value: 200.00,
        is_active: true
      },
      {
        name: 'Health Insurance',
        code: 'HEALTH_INS',
        type: 'deduction',
        calculation_type: 'fixed',
        default_value: 500.00,
        is_active: true
      }
    ];

    for (const comp of baseComponents) {
      await queryInterface.sequelize.query(`
        INSERT INTO salary_components (name, code, type, calculation_type, default_value, percentage_of_component_id, is_active, created_at, updated_at)
        VALUES ('${comp.name.replace(/'/g, "\\'")}', '${comp.code}', '${comp.type}', '${comp.calculation_type}', ${comp.default_value}, NULL, ${comp.is_active}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          type = VALUES(type),
          calculation_type = VALUES(calculation_type),
          default_value = VALUES(default_value),
          is_active = VALUES(is_active),
          updated_at = NOW();
      `);
    }

    // 2. Fetch BASIC component ID to link percentage components
    const [basicRows] = await queryInterface.sequelize.query(
      "SELECT id FROM salary_components WHERE code = 'BASIC' LIMIT 1;"
    );

    const basicId = basicRows && basicRows[0] ? basicRows[0].id : null;

    // 3. Components that depend on BASIC (% of Basic)
    const dependentComponents = [
      {
        name: 'House Rent Allowance (HRA)',
        code: 'HRA',
        type: 'earning',
        calculation_type: 'percentage',
        default_value: 40.00, // 40% of Basic
        percentage_of_component_id: basicId,
        is_active: true
      },
      {
        name: 'Dearness Allowance (DA)',
        code: 'DA',
        type: 'earning',
        calculation_type: 'percentage',
        default_value: 10.00, // 10% of Basic
        percentage_of_component_id: basicId,
        is_active: true
      },
      {
        name: 'Provident Fund (PF)',
        code: 'PF',
        type: 'deduction',
        calculation_type: 'percentage',
        default_value: 12.00, // 12% of Basic
        percentage_of_component_id: basicId,
        is_active: true
      }
    ];

    for (const comp of dependentComponents) {
      const parentIdVal = comp.percentage_of_component_id ? comp.percentage_of_component_id : 'NULL';
      await queryInterface.sequelize.query(`
        INSERT INTO salary_components (name, code, type, calculation_type, default_value, percentage_of_component_id, is_active, created_at, updated_at)
        VALUES ('${comp.name.replace(/'/g, "\\'")}', '${comp.code}', '${comp.type}', '${comp.calculation_type}', ${comp.default_value}, ${parentIdVal}, ${comp.is_active}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          type = VALUES(type),
          calculation_type = VALUES(calculation_type),
          default_value = VALUES(default_value),
          percentage_of_component_id = VALUES(percentage_of_component_id),
          is_active = VALUES(is_active),
          updated_at = NOW();
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const allCodes = ['BASIC', 'CONVEYANCE', 'MEDICAL', 'SPECIAL', 'BONUS', 'TDS', 'PROF_TAX', 'HEALTH_INS', 'HRA', 'DA', 'PF'];
    await queryInterface.bulkDelete('salary_components', {
      code: {
        [Sequelize.Op.in]: allCodes
      }
    }, {});
  }
};
