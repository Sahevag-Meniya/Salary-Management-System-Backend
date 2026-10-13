const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('Express Server Initialization with Sequelize', () => {
  assert.ok(app, 'app should be defined');
  assert.strictEqual(typeof app.listen, 'function', 'app.listen should be a function');
});
