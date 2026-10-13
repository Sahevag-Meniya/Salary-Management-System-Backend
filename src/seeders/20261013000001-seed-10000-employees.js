'use strict';

const countriesData = [
  {
    country: 'United States',
    currency: 'USD',
    baseMin: 65000,
    baseMax: 185000,
    allowanceMin: 5000,
    allowanceMax: 20000,
    deductionRate: 0.22
  },
  {
    country: 'United Kingdom',
    currency: 'GBP',
    baseMin: 45000,
    baseMax: 130000,
    allowanceMin: 3000,
    allowanceMax: 15000,
    deductionRate: 0.20
  },
  {
    country: 'Germany',
    currency: 'EUR',
    baseMin: 50000,
    baseMax: 140000,
    allowanceMin: 4000,
    allowanceMax: 16000,
    deductionRate: 0.25
  },
  {
    country: 'India',
    currency: 'INR',
    baseMin: 600000,
    baseMax: 3600000,
    allowanceMin: 100000,
    allowanceMax: 500000,
    deductionRate: 0.15
  },
  {
    country: 'Singapore',
    currency: 'SGD',
    baseMin: 70000,
    baseMax: 195000,
    allowanceMin: 6000,
    allowanceMax: 22000,
    deductionRate: 0.16
  },
  {
    country: 'Japan',
    currency: 'JPY',
    baseMin: 5500000,
    baseMax: 18000000,
    allowanceMin: 500000,
    allowanceMax: 2000000,
    deductionRate: 0.20
  }
];

const departments = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Success'
];

const designations = [
  'Junior Associate',
  'Associate',
  'Senior Specialist',
  'Team Lead',
  'Manager',
  'Senior Manager',
  'Director',
  'VP'
];

const firstNames = [
  'Aarav', 'Emma', 'Liam', 'Priya', 'Noah', 'Sophia', 'Lucas', 'Mia',
  'Rohan', 'Olivia', 'Ethan', 'Ananya', 'Mateo', 'Isabella', 'Alexander', 'Charlotte',
  'Kavya', 'James', 'Benjamin', 'Diya', 'William', 'Amelia', 'Henry', 'Sneha',
  'Oliver', 'Harper', 'Sebastian', 'Pooja', 'Daniel', 'Evelyn', 'Jack', 'Meera',
  'Kenji', 'Yuki', 'Hans', 'Greta', 'Chloe', 'Takeshi', 'Leon', 'Sakura'
];

const lastNames = [
  'Smith', 'Johnson', 'Sharma', 'Williams', 'Brown', 'Patel', 'Jones', 'Garcia',
  'Miller', 'Davis', 'Verma', 'Rodriguez', 'Martinez', 'Gupta', 'Hernandez', 'Lopez',
  'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez',
  'Müller', 'Schmidt', 'Schneider', 'Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe'
];

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Starting high-performance seeding for 10,000 employees and salaries...');
    const startTime = Date.now();

    const TOTAL_RECORDS = 10000;
    const CHUNK_SIZE = 2000;
    const now = new Date();

    // Check existing count to prevent accidental duplicate key errors
    const [existing] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM employees');
    if (existing[0].count >= TOTAL_RECORDS) {
      console.log(`ℹ️ Employees already seeded (${existing[0].count} records found). Skipping.`);
      return;
    }

    // Clean existing tables before full seed
    await queryInterface.bulkDelete('salaries', null, {});
    await queryInterface.bulkDelete('employees', null, {});

    // Generate in chunks
    for (let chunkStart = 0; chunkStart < TOTAL_RECORDS; chunkStart += CHUNK_SIZE) {
      const currentChunkSize = Math.min(CHUNK_SIZE, TOTAL_RECORDS - chunkStart);
      const employeesChunk = [];
      const salariesChunk = [];

      for (let i = 0; i < currentChunkSize; i++) {
        const id = chunkStart + i + 1;
        const cConfig = countriesData[id % countriesData.length];
        const dept = departments[(id * 3) % departments.length];
        const desig = designations[(id * 7) % designations.length];
        const fName = firstNames[(id * 11) % firstNames.length];
        const lName = lastNames[(id * 17) % lastNames.length];
        const fullName = `${fName} ${lName}`;
        const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${id}@orgcorp.com`;

        employeesChunk.push({
          id,
          name: fullName,
          email,
          country: cConfig.country,
          department: dept,
          designation: desig,
          currency: cConfig.currency,
          created_at: now,
          updated_at: now
        });

        // Calculate localized salary figures
        const salarySpread = (id % 100) / 100;
        const basic = Math.round(cConfig.baseMin + (cConfig.baseMax - cConfig.baseMin) * salarySpread);
        const allowances = Math.round(cConfig.allowanceMin + (cConfig.allowanceMax - cConfig.allowanceMin) * ((id % 50) / 50));
        const gross = basic + allowances;
        const deductions = Math.round(gross * cConfig.deductionRate);
        const net = gross - deductions;

        salariesChunk.push({
          id,
          employee_id: id,
          basic_salary: basic,
          allowances: allowances,
          deductions: deductions,
          gross_salary: gross,
          net_salary: net,
          currency: cConfig.currency,
          effective_from: '2026-01-01',
          created_at: now,
          updated_at: now
        });
      }

      await queryInterface.bulkInsert('employees', employeesChunk);
      await queryInterface.bulkInsert('salaries', salariesChunk);
      console.log(`  Inserted records ${chunkStart + 1} to ${chunkStart + currentChunkSize}...`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Successfully seeded 10,000 employees and salaries in ${elapsed}s!`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('salaries', null, {});
    await queryInterface.bulkDelete('employees', null, {});
    console.log('🧹 Cleaned up seeded employees and salaries.');
  }
};
