'use strict';

const countriesData = [
  { name: 'United States', code: 'USA', currency_code: 'USD', currency_symbol: '$' },
  { name: 'India', code: 'IND', currency_code: 'INR', currency_symbol: '₹' },
  { name: 'United Kingdom', code: 'GBR', currency_code: 'GBP', currency_symbol: '£' },
  { name: 'Canada', code: 'CAN', currency_code: 'CAD', currency_symbol: 'C$' },
  { name: 'Germany', code: 'DEU', currency_code: 'EUR', currency_symbol: '€' },
  { name: 'France', code: 'FRA', currency_code: 'EUR', currency_symbol: '€' },
  { name: 'Australia', code: 'AUS', currency_code: 'AUD', currency_symbol: 'A$' },
  { name: 'Japan', code: 'JPN', currency_code: 'JPY', currency_symbol: '¥' },
  { name: 'Singapore', code: 'SGP', currency_code: 'SGD', currency_symbol: 'S$' },
  { name: 'United Arab Emirates', code: 'ARE', currency_code: 'AED', currency_symbol: 'AED' },
  { name: 'Switzerland', code: 'CHE', currency_code: 'CHF', currency_symbol: 'CHF' },
  { name: 'Netherlands', code: 'NLD', currency_code: 'EUR', currency_symbol: '€' },
  { name: 'Saudi Arabia', code: 'SAU', currency_code: 'SAR', currency_symbol: '﷼' },
  { name: 'Brazil', code: 'BRA', currency_code: 'BRL', currency_symbol: 'R$' },
  { name: 'South Africa', code: 'ZAF', currency_code: 'ZAR', currency_symbol: 'R' },
  { name: 'China', code: 'CHN', currency_code: 'CNY', currency_symbol: '¥' },
  { name: 'Sweden', code: 'SWE', currency_code: 'SEK', currency_symbol: 'kr' },
  { name: 'Ireland', code: 'IRL', currency_code: 'EUR', currency_symbol: '€' },
  { name: 'New Zealand', code: 'NZL', currency_code: 'NZD', currency_symbol: 'NZ$' },
  { name: 'Spain', code: 'ESP', currency_code: 'EUR', currency_symbol: '€' }
];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const country of countriesData) {
      await queryInterface.sequelize.query(`
        INSERT INTO countries (name, code, currency_code, currency_symbol, created_at, updated_at)
        VALUES ('${country.name.replace(/'/g, "\\'")}', '${country.code}', '${country.currency_code}', '${country.currency_symbol}', NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          currency_code = VALUES(currency_code),
          currency_symbol = VALUES(currency_symbol),
          updated_at = NOW();
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const codes = countriesData.map(c => c.code);
    await queryInterface.bulkDelete('countries', {
      code: {
        [Sequelize.Op.in]: codes
      }
    }, {});
  }
};
