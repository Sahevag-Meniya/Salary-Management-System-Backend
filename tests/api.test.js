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

  test('GET /api/structures with country filter should filter records accurately', async () => {
    const res = await request(app).get('/api/structures?country=India&limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    res.body.data.forEach(item => {
      const countryVal = typeof item.country === 'object' ? item.country?.name : item.country;
      assert.strictEqual(countryVal, 'India');
    });
  });

  test('GET /api/analytics/by-department should return department payroll breakdown', async () => {
    const res = await request(app).get('/api/analytics/by-department');
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

  test('GET /api/analytics/summary should enforce strict currency isolation', async () => {
    const res = await request(app).get('/api/analytics/summary');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.currencyBreakdown));
    assert.ok(res.body.data.currencyBreakdown.length > 0);
    // Every entry in breakdown must have a valid 3-letter currency and positive headcount
    res.body.data.currencyBreakdown.forEach(item => {
      assert.strictEqual(typeof item.currency, 'string');
      assert.strictEqual(item.currency.length, 3);
      assert.ok(Number(item.employeeCount) > 0);
    });
  });

  test('GET /api/reports/export should stream audit-ready CSV with attachment header', async () => {
    const res = await request(app).get('/api/reports/export?limit=5');
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/csv'));
    assert.ok(res.headers['content-disposition'].includes('attachment'));
  });

  test('Full Salary Structure Lifecycle: Create, Read with Components, Update, and Cascade Delete', async () => {
    // 1. Create a test employee with itemized components
    const createRes = await request(app)
      .post('/api/structures')
      .send({
        name: 'Automated Test Employee',
        email: `test.lifecycle.${Date.now()}@example.com`,
        country: 'India',
        department: 'Engineering',
        designation: 'Software Engineer',
        currency: 'INR',
        basicSalary: 40000,
        allowances: 20000,
        deductions: 5000,
        components: [
          { componentId: 1, amount: 40000 },
          { componentId: 9, amount: 16000 },
          { componentId: 11, amount: 4800 }
        ]
      });

    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.body.success, true);
    const createdId = createRes.body.data.id;
    assert.ok(createdId);

    // 2. Fetch by ID and verify itemized components exist
    const getRes = await request(app).get(`/api/structures/${createdId}`);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.data.id, createdId);
    assert.ok(Array.isArray(getRes.body.data.salaryStructure.components));
    assert.strictEqual(getRes.body.data.salaryStructure.components.length, 3);

    // 3. Update the structure
    const updateRes = await request(app)
      .put(`/api/structures/${createdId}`)
      .send({
        basicSalary: 45000,
        allowances: 22000,
        deductions: 5500,
        components: [
          { componentId: 1, amount: 45000 },
          { componentId: 9, amount: 18000 },
          { componentId: 11, amount: 5400 }
        ]
      });

    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.success, true);

    // 4. Cascade Delete
    const deleteRes = await request(app).delete(`/api/structures/${createdId}`);
    assert.strictEqual(deleteRes.status, 200);

    // 5. Verify 404 after deletion
    const verifyRes = await request(app).get(`/api/structures/${createdId}`);
    assert.strictEqual(verifyRes.status, 404);
  });
});
