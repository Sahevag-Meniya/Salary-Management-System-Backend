'use strict';

const firstNames = [
  'Aarav', 'Emma', 'Liam', 'Priya', 'Noah', 'Sophia', 'Lucas', 'Mia',
  'Rohan', 'Olivia', 'Ethan', 'Ananya', 'Mateo', 'Isabella', 'Alexander', 'Charlotte',
  'Kavya', 'James', 'Benjamin', 'Diya', 'William', 'Amelia', 'Henry', 'Sneha',
  'Oliver', 'Harper', 'Sebastian', 'Pooja', 'Daniel', 'Evelyn', 'Jack', 'Meera',
  'Kenji', 'Yuki', 'Hans', 'Greta', 'Chloe', 'Takeshi', 'Leon', 'Sakura',
  'Carlos', 'Elena', 'Vikram', 'Zoe', 'Gabriel', 'Fatima', 'Tariq', 'Sora',
  'Lars', 'Astrid', 'Nikhil', 'Zara', 'Arthur', 'Clara', 'Samuel', 'Layla'
];

const lastNames = [
  'Smith', 'Johnson', 'Sharma', 'Williams', 'Brown', 'Patel', 'Jones', 'Garcia',
  'Miller', 'Davis', 'Verma', 'Rodriguez', 'Martinez', 'Gupta', 'Hernandez', 'Lopez',
  'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez',
  'Müller', 'Schmidt', 'Schneider', 'Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe',
  'Al-Mansoor', 'Dubois', 'Laurent', 'Silva', 'Santos', 'Johansson', 'Nakamura', 'Mehta'
];

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Starting high-performance seeding for 10,000 employees...');
    const startTime = Date.now();

    const [countries] = await queryInterface.sequelize.query('SELECT id FROM countries ORDER BY id ASC;');
    const [designations] = await queryInterface.sequelize.query('SELECT id FROM designations ORDER BY id ASC;');

    if (countries.length === 0 || designations.length === 0) {
      throw new Error('Master tables (countries, designations) must be seeded before seeding employees.');
    }

    const TOTAL_RECORDS = 10000;
    const CHUNK_SIZE = 2000;
    const now = new Date();

    for (let chunkStart = 0; chunkStart < TOTAL_RECORDS; chunkStart += CHUNK_SIZE) {
      const currentChunkSize = Math.min(CHUNK_SIZE, TOTAL_RECORDS - chunkStart);
      const employeesChunk = [];

      for (let i = 0; i < currentChunkSize; i++) {
        const id = chunkStart + i + 1;
        const country = countries[id % countries.length];
        const desig = designations[(id * 7) % designations.length];

        const fName = firstNames[(id * 11) % firstNames.length];
        const lName = lastNames[(id * 17) % lastNames.length];
        const fullName = `${fName} ${lName}`;
        const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${id}@orgcorp.com`;

        employeesChunk.push({
          id,
          name: fullName,
          email,
          country_id: country.id,
          designation_id: desig.id,
          created_at: now,
          updated_at: now
        });
      }

      await queryInterface.bulkInsert('employees', employeesChunk);
      console.log(`  Inserted employees ${chunkStart + 1} to ${chunkStart + currentChunkSize}...`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Successfully seeded 10,000 employees in ${elapsed}s!`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employees', null, {});
    console.log('🧹 Cleaned up seeded employees.');
  }
};
