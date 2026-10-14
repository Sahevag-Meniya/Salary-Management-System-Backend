const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

after(async () => {
  try {
    await sequelize.close();
  } catch (e) {}
});

describe('API Route Endpoints', () => {
  test('GET /api/health should return status 200 and ok', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.timestamp);
  });

  test('GET / should return informational metadata', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.version, '1.0.0');
    assert.ok(res.body.endpoints);
  });

  test('GET /api/unknown-route should return 404 Route Not Found', async () => {
    const res = await request(app).get('/api/unknown-route');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Route not found');
  });

  test('GET /api/structures should return status 200 and paginated data', async () => {
    const res = await request(app).get('/api/structures?limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  test('GET /api/structures/filters should return filter options', async () => {
    const res = await request(app).get('/api/structures/filters');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.countries));
  });

  test('POST /api/structures should return 400 Bad Request on invalid input', async () => {
    const res = await request(app)
      .post('/api/structures')
      .send({
        name: '',
        email: 'invalid-email'
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('name is required'));
  });
});
