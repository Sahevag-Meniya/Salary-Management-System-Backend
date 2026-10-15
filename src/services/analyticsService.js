const { sequelize } = require('../models');

class AnalyticsService {
  /**
   * Executive high-level compensation summary.
   * Enforces strict currency isolation (never adds different currencies together).
   */
  async getSummary() {
    const [totalEmployeesResult] = await sequelize.query(
      'SELECT COUNT(*) as total_employees FROM employees'
    );
    const totalEmployees = parseInt(totalEmployeesResult[0].total_employees, 10) || 0;

    const [currencySummaries] = await sequelize.query(`
      SELECT 
        currency,
        COUNT(id) as count,
        ROUND(SUM(gross_salary), 2) as total_gross,
        ROUND(SUM(net_salary), 2) as total_net,
        ROUND(AVG(net_salary), 2) as avg_net,
        ROUND(MIN(net_salary), 2) as min_net,
        ROUND(MAX(net_salary), 2) as max_net
      FROM employee_salary_structures
      WHERE is_current = 1
      GROUP BY currency
      ORDER BY count DESC
    `);

    const formattedCurrencySummaries = currencySummaries.map(c => ({
      currency: c.currency,
      employeeCount: parseInt(c.count, 10),
      totalGross: parseFloat(c.total_gross) || 0,
      totalNet: parseFloat(c.total_net) || 0,
      avgNet: parseFloat(c.avg_net) || 0,
      minNet: parseFloat(c.min_net) || 0,
      maxNet: parseFloat(c.max_net) || 0
    }));

    return {
      totalEmployees,
      currenciesCount: formattedCurrencySummaries.length,
      currencyBreakdown: formattedCurrencySummaries
    };
  }

  /**
   * Country-wise compensation distribution.
   */
  async getByCountry() {
    const [rows] = await sequelize.query(`
      SELECT 
        c.name as country,
        s.currency,
        COUNT(e.id) as headcount,
        ROUND(SUM(s.gross_salary), 2) as total_gross,
        ROUND(SUM(s.net_salary), 2) as total_net,
        ROUND(AVG(s.net_salary), 2) as avg_net,
        ROUND(MIN(s.net_salary), 2) as min_net,
        ROUND(MAX(s.net_salary), 2) as max_net
      FROM employees e
      INNER JOIN countries c ON e.country_id = c.id
      INNER JOIN employee_salary_structures s ON e.id = s.employee_id AND s.is_current = 1
      GROUP BY c.name, s.currency
      ORDER BY headcount DESC
    `);

    return rows.map(r => ({
      country: r.country,
      currency: r.currency,
      headcount: parseInt(r.headcount, 10),
      totalGross: parseFloat(r.total_gross) || 0,
      totalNet: parseFloat(r.total_net) || 0,
      avgNet: parseFloat(r.avg_net) || 0,
      minNet: parseFloat(r.min_net) || 0,
      maxNet: parseFloat(r.max_net) || 0
    }));
  }

  /**
   * Department-wise compensation distribution.
   */
  async getByDepartment() {
    const [rows] = await sequelize.query(`
      SELECT 
        d.name as department,
        s.currency,
        COUNT(e.id) as headcount,
        ROUND(SUM(s.net_salary), 2) as total_net,
        ROUND(AVG(s.net_salary), 2) as avg_net
      FROM employees e
      INNER JOIN designations des ON e.designation_id = des.id
      INNER JOIN departments d ON des.department_id = d.id
      INNER JOIN employee_salary_structures s ON e.id = s.employee_id AND s.is_current = 1
      GROUP BY d.name, s.currency
      ORDER BY d.name ASC, headcount DESC
    `);

    return rows.map(r => ({
      department: r.department,
      currency: r.currency,
      headcount: parseInt(r.headcount, 10),
      totalNet: parseFloat(r.total_net) || 0,
      avgNet: parseFloat(r.avg_net) || 0
    }));
  }

  /**
   * Designation / Role salary ranges.
   */
  async getByDesignation() {
    const [rows] = await sequelize.query(`
      SELECT 
        des.name as designation,
        s.currency,
        COUNT(e.id) as headcount,
        ROUND(AVG(s.net_salary), 2) as avg_net,
        ROUND(MIN(s.net_salary), 2) as min_net,
        ROUND(MAX(s.net_salary), 2) as max_net
      FROM employees e
      INNER JOIN designations des ON e.designation_id = des.id
      INNER JOIN employee_salary_structures s ON e.id = s.employee_id AND s.is_current = 1
      GROUP BY des.name, s.currency
      ORDER BY des.name ASC
    `);

    return rows.map(r => ({
      designation: r.designation,
      currency: r.currency,
      headcount: parseInt(r.headcount, 10),
      avgNet: parseFloat(r.avg_net) || 0,
      minNet: parseFloat(r.min_net) || 0,
      maxNet: parseFloat(r.max_net) || 0
    }));
  }

  /**
   * Top earners / highest paid employees for a currency (or partitioned by currency).
   */
  async getTopEarners(currency) {
    if (currency) {
      const [rows] = await sequelize.query(`
        SELECT 
          e.id,
          e.name,
          e.email,
          c.name as country,
          d.name as department,
          des.name as designation,
          s.currency,
          ROUND(s.gross_salary, 2) as gross_salary,
          ROUND(s.net_salary, 2) as net_salary
        FROM employees e
        INNER JOIN countries c ON e.country_id = c.id
        INNER JOIN designations des ON e.designation_id = des.id
        INNER JOIN departments d ON des.department_id = d.id
        INNER JOIN employee_salary_structures s ON e.id = s.employee_id AND s.is_current = 1
        WHERE s.currency = :currency
        ORDER BY s.net_salary DESC
        LIMIT 5
      `, {
        replacements: { currency }
      });

      return rows.map((r, idx) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        country: r.country,
        department: r.department,
        designation: r.designation,
        currency: r.currency,
        grossSalary: parseFloat(r.gross_salary) || 0,
        netSalary: parseFloat(r.net_salary) || 0,
        rank: idx + 1
      }));
    }

    const [rows] = await sequelize.query(`
      WITH RankedEmployees AS (
        SELECT 
          e.id,
          e.name,
          e.email,
          c.name as country,
          d.name as department,
          des.name as designation,
          s.currency,
          s.gross_salary as gross_salary,
          s.net_salary as net_salary,
          ROW_NUMBER() OVER (PARTITION BY s.currency ORDER BY s.net_salary DESC) as rn
        FROM employees e
        INNER JOIN countries c ON e.country_id = c.id
        INNER JOIN designations des ON e.designation_id = des.id
        INNER JOIN departments d ON des.department_id = d.id
        INNER JOIN employee_salary_structures s ON e.id = s.employee_id AND s.is_current = 1
      )
      SELECT 
        id,
        name,
        email,
        country,
        department,
        designation,
        currency,
        ROUND(gross_salary, 2) as gross_salary,
        ROUND(net_salary, 2) as net_salary,
        rn as \`rank\`
      FROM RankedEmployees
      WHERE rn <= 5
      ORDER BY currency ASC, rn ASC
    `);

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      country: r.country,
      department: r.department,
      designation: r.designation,
      currency: r.currency,
      grossSalary: parseFloat(r.gross_salary) || 0,
      netSalary: parseFloat(r.net_salary) || 0,
      rank: parseInt(r.rank, 10)
    }));
  }
}

module.exports = new AnalyticsService();
