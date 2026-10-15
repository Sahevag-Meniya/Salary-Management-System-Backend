const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { calculateSalary, validateSalaryInput } = require('../src/utils/calculations');

describe('Salary Calculation Business Logic', () => {
  test('should accurately calculate gross and net salary with valid inputs', () => {
    const result = calculateSalary({
      basicSalary: 80000,
      allowances: 10000,
      deductions: 15000
    });

    assert.strictEqual(result.basicSalary, 80000);
    assert.strictEqual(result.allowances, 10000);
    assert.strictEqual(result.deductions, 15000);
    assert.strictEqual(result.grossSalary, 90000); // 80000 + 10000
    assert.strictEqual(result.netSalary, 75000);   // 90000 - 15000
  });

  test('should handle default zero values for allowances and deductions', () => {
    const result = calculateSalary({ basicSalary: 50000 });

    assert.strictEqual(result.basicSalary, 50000);
    assert.strictEqual(result.allowances, 0);
    assert.strictEqual(result.deductions, 0);
    assert.strictEqual(result.grossSalary, 50000);
    assert.strictEqual(result.netSalary, 50000);
  });

  test('should accurately round floating decimals to 2 decimal places', () => {
    const result = calculateSalary({
      basicSalary: 12345.678,
      allowances: 123.456,
      deductions: 50.123
    });

    assert.strictEqual(result.basicSalary, 12345.68);
    assert.strictEqual(result.allowances, 123.46);
    assert.strictEqual(result.deductions, 50.12);
    assert.strictEqual(result.grossSalary, 12469.13); // 12345.678 + 123.456 = 12469.134 -> 12469.13
    assert.strictEqual(result.netSalary, 12419.01);   // 12469.134 - 50.123 = 12419.011 -> 12419.01
  });

  test('should throw error when basic salary is negative', () => {
    assert.throws(
      () => calculateSalary({ basicSalary: -500 }),
      /Basic salary must be a non-negative number/
    );
  });

  test('should throw error when allowances are negative', () => {
    assert.throws(
      () => calculateSalary({ basicSalary: 5000, allowances: -200 }),
      /Allowances must be a non-negative number/
    );
  });

  test('should throw error when deductions are negative', () => {
    assert.throws(
      () => calculateSalary({ basicSalary: 5000, deductions: -100 }),
      /Deductions must be a non-negative number/
    );
  });

  test('should throw error when deductions exceed gross salary', () => {
    assert.throws(
      () => calculateSalary({ basicSalary: 1000, allowances: 200, deductions: 1500 }),
      /Deductions cannot exceed Gross Salary/
    );
  });
});

describe('Salary Input Validation', () => {
  test('should return isValid: true for complete and valid payload', () => {
    const validData = {
      name: 'John Doe',
      email: 'john.doe@orgcorp.com',
      country: 'United States',
      department: 'Engineering',
      designation: 'Senior Developer',
      currency: 'USD',
      basicSalary: 95000
    };

    const result = validateSalaryInput(validData);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  test('should detect missing mandatory fields and invalid email format', () => {
    const invalidData = {
      name: '',
      email: 'invalid-email',
      country: '',
      department: '',
      designation: '',
      currency: 'US', // invalid length
      basicSalary: -100
    };

    const result = validateSalaryInput(invalidData);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes('name is required')));
    assert.ok(result.errors.some(e => e.includes('valid email')));
    assert.ok(result.errors.some(e => e.includes('Country is required')));
    assert.ok(result.errors.some(e => e.includes('3-letter currency code')));
    assert.ok(result.errors.some(e => e.includes('positive number')));
  });
});

describe('Itemized Component Rules & Formula Calculations', () => {
  test('should accurately compute percentage components (HRA 40%, DA 10%, PF 12%) and statutory defaults', () => {
    const basicPay = 50000;
    const hra = Math.round(basicPay * 0.40);
    const da = Math.round(basicPay * 0.10);
    const pf = Math.round(basicPay * 0.12);
    const conveyance = 1600;
    const medical = 1250;
    const profTax = 200;
    const healthIns = 500;

    assert.strictEqual(hra, 20000);
    assert.strictEqual(da, 5000);
    assert.strictEqual(pf, 6000);

    const totalAllowances = hra + da + conveyance + medical; // 27850
    const totalDeductions = pf + profTax + healthIns;        // 6700

    const salary = calculateSalary({
      basicSalary: basicPay,
      allowances: totalAllowances,
      deductions: totalDeductions
    });

    assert.strictEqual(salary.grossSalary, 77850);
    assert.strictEqual(salary.deductions, 6700);
    assert.strictEqual(salary.netSalary, 71150);
  });
});
