'use strict';

const currencyConfigs = {
  'USD': { min: 4500, max: 16000, conveyance: 150, medical: 100, profTax: 20, healthIns: 80, taxRate: 0.18 },
  'INR': { min: 40000, max: 320000, conveyance: 1600, medical: 1250, profTax: 200, healthIns: 500, taxRate: 0.12 },
  'GBP': { min: 3200, max: 11000, conveyance: 120, medical: 90, profTax: 15, healthIns: 70, taxRate: 0.20 },
  'CAD': { min: 4200, max: 14000, conveyance: 140, medical: 100, profTax: 20, healthIns: 75, taxRate: 0.18 },
  'EUR': { min: 3500, max: 12000, conveyance: 130, medical: 100, profTax: 20, healthIns: 80, taxRate: 0.22 },
  'AUD': { min: 4500, max: 15000, conveyance: 150, medical: 110, profTax: 20, healthIns: 85, taxRate: 0.20 },
  'JPY': { min: 420000, max: 1600000, conveyance: 15000, medical: 10000, profTax: 2000, healthIns: 8000, taxRate: 0.15 },
  'SGD': { min: 4500, max: 15000, conveyance: 140, medical: 100, profTax: 20, healthIns: 80, taxRate: 0.12 },
  'AED': { min: 12000, max: 45000, conveyance: 500, medical: 400, profTax: 0, healthIns: 300, taxRate: 0.00 },
  'CHF': { min: 5500, max: 18000, conveyance: 180, medical: 140, profTax: 25, healthIns: 120, taxRate: 0.18 },
  'SAR': { min: 11000, max: 40000, conveyance: 450, medical: 350, profTax: 0, healthIns: 250, taxRate: 0.00 },
  'BRL': { min: 5000, max: 22000, conveyance: 250, medical: 200, profTax: 30, healthIns: 120, taxRate: 0.15 },
  'ZAR': { min: 25000, max: 95000, conveyance: 1000, medical: 800, profTax: 100, healthIns: 500, taxRate: 0.18 },
  'CNY': { min: 12000, max: 48000, conveyance: 400, medical: 300, profTax: 50, healthIns: 250, taxRate: 0.14 },
  'SEK': { min: 32000, max: 110000, conveyance: 1200, medical: 900, profTax: 150, healthIns: 600, taxRate: 0.25 },
  'NZD': { min: 4500, max: 14000, conveyance: 140, medical: 100, profTax: 20, healthIns: 80, taxRate: 0.19 }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Starting seeding for Employee Salary Structures and Components...');
    const startTime = Date.now();

    // 1. Fetch employees with currency code
    const [employees] = await queryInterface.sequelize.query(`
      SELECT e.id, e.country_id, c.currency_code 
      FROM employees e 
      JOIN countries c ON e.country_id = c.id 
      ORDER BY e.id ASC;
    `);

    if (employees.length === 0) {
      throw new Error('Employees table must be seeded before seeding salary structures.');
    }

    // 2. Fetch component map by code
    const [components] = await queryInterface.sequelize.query(`
      SELECT id, code FROM salary_components;
    `);

    const compMap = {};
    for (const comp of components) {
      compMap[comp.code] = comp.id;
    }

    const defaultCfg = currencyConfigs['USD'];
    const CHUNK_SIZE = 2000;
    const now = new Date();

    for (let chunkStart = 0; chunkStart < employees.length; chunkStart += CHUNK_SIZE) {
      const currentChunk = employees.slice(chunkStart, chunkStart + CHUNK_SIZE);
      const structuresChunk = [];
      const structureComponentsChunk = [];

      for (let i = 0; i < currentChunk.length; i++) {
        const emp = currentChunk[i];
        const structureId = chunkStart + i + 1;
        const cfg = currencyConfigs[emp.currency_code] || defaultCfg;

        // Salary spread calculation
        const spread = (emp.id % 100) / 100;
        const targetGross = Math.round(cfg.min + (cfg.max - cfg.min) * spread);

        const basic = Math.round(targetGross * 0.50);
        const hra = Math.round(basic * 0.40);
        const da = Math.round(basic * 0.10);
        const conveyance = cfg.conveyance;
        const medical = cfg.medical;
        const special = Math.max(0, targetGross - (basic + hra + da + conveyance + medical));
        const actualGross = basic + hra + da + conveyance + medical + special;

        const pf = Math.round(basic * 0.12);
        const profTax = cfg.profTax;
        const healthIns = cfg.healthIns;
        const tds = Math.round(actualGross * cfg.taxRate);
        const totalDeductions = pf + profTax + healthIns + tds;
        const netSalary = actualGross - totalDeductions;

        structuresChunk.push({
          id: structureId,
          employee_id: emp.id,
          effective_from: '2026-01-01',
          effective_to: null,
          is_current: true,
          gross_salary: actualGross,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          currency: emp.currency_code,
          revision_reason: 'Joining Offer 2026',
          created_at: now,
          updated_at: now
        });

        // Line-item component breakdowns
        const lineItems = [
          { code: 'BASIC', amount: basic },
          { code: 'HRA', amount: hra },
          { code: 'DA', amount: da },
          { code: 'CONVEYANCE', amount: conveyance },
          { code: 'MEDICAL', amount: medical },
          { code: 'SPECIAL', amount: special },
          { code: 'PF', amount: pf },
          { code: 'PROF_TAX', amount: profTax },
          { code: 'HEALTH_INS', amount: healthIns },
          { code: 'TDS', amount: tds }
        ];

        for (const item of lineItems) {
          const compId = compMap[item.code];
          if (compId) {
            structureComponentsChunk.push({
              structure_id: structureId,
              component_id: compId,
              amount: item.amount,
              created_at: now,
              updated_at: now
            });
          }
        }
      }

      await queryInterface.bulkInsert('employee_salary_structures', structuresChunk);
      await queryInterface.bulkInsert('employee_salary_components', structureComponentsChunk);
      console.log(`  Inserted structures & components for employees ${chunkStart + 1} to ${chunkStart + currentChunk.length}...`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Successfully seeded salary structures and component breakdowns for ${employees.length} employees in ${elapsed}s!`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employee_salary_components', null, {});
    await queryInterface.bulkDelete('employee_salary_structures', null, {});
    console.log('🧹 Cleaned up employee salary structures.');
  }
};
