/**
 * Core Salary Calculation and Validation Utilities
 */

/**
 * Calculates Gross and Net salary with two decimal precision.
 * Formula:
 *  Gross Salary = Basic Salary + Allowances
 *  Net Salary = Gross Salary - Deductions
 *
 * @param {Object} params
 * @param {number|string} params.basicSalary
 * @param {number|string} [params.allowances=0]
 * @param {number|string} [params.deductions=0]
 * @returns {{ basicSalary: number, allowances: number, deductions: number, grossSalary: number, netSalary: number }}
 */
function calculateSalary({ basicSalary, allowances = 0, deductions = 0 }) {
  const basic = parseFloat(basicSalary);
  const allow = allowances !== undefined && allowances !== null && allowances !== '' ? parseFloat(allowances) : 0;
  const deduct = deductions !== undefined && deductions !== null && deductions !== '' ? parseFloat(deductions) : 0;

  if (isNaN(basic) || basic < 0) {
    throw new Error('Basic salary must be a non-negative number');
  }
  if (isNaN(allow) || allow < 0) {
    throw new Error('Allowances must be a non-negative number');
  }
  if (isNaN(deduct) || deduct < 0) {
    throw new Error('Deductions must be a non-negative number');
  }

  const grossSalary = Math.round((basic + allow) * 100) / 100;
  const netSalary = Math.round((grossSalary - deduct) * 100) / 100;

  if (netSalary < 0) {
    throw new Error('Deductions cannot exceed Gross Salary (Net Salary cannot be negative)');
  }

  return {
    basicSalary: Math.round(basic * 100) / 100,
    allowances: Math.round(allow * 100) / 100,
    deductions: Math.round(deduct * 100) / 100,
    grossSalary,
    netSalary
  };
}

/**
 * Validates employee and salary input payload.
 *
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateSalaryInput(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Employee name is required');
  }
  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push('A valid email address is required');
  }
  if (!data.country || typeof data.country !== 'string' || !data.country.trim()) {
    errors.push('Country is required');
  }
  if (!data.department || typeof data.department !== 'string' || !data.department.trim()) {
    errors.push('Department is required');
  }
  if (!data.designation || typeof data.designation !== 'string' || !data.designation.trim()) {
    errors.push('Designation is required');
  }
  if (!data.currency || typeof data.currency !== 'string' || data.currency.trim().length !== 3) {
    errors.push('A valid 3-letter currency code is required (e.g. USD, EUR, INR)');
  }

  const basic = parseFloat(data.basicSalary);
  if (isNaN(basic) || basic < 0) {
    errors.push('Basic salary must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  calculateSalary,
  validateSalaryInput
};
