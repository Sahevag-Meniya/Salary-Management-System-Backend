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
      FROM salaries
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
        e.country,
        e.currency,
        COUNT(e.id) as headcount,
        ROUND(SUM(s.gross_salary), 2) as total_gross,
        ROUND(SUM(s.net_salary), 2) as total_net,
        ROUND(AVG(s.net_salary), 2) as avg_net,
        ROUND(MIN(s.net_salary), 2) as min_net,
        ROUND(MAX(s.net_salary), 2) as max_net
      FROM employees e
      INNER JOIN salaries s ON e.id = s.employee_id
      GROUP BY e.country, e.currency
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
        e.department,
        e.currency,
        COUNT(e.id) as headcount,
        ROUND(SUM(s.net_salary), 2) as total_net,
        ROUND(AVG(s.net_salary), 2) as avg_net
      FROM employees e
      INNER JOIN salaries s ON e.id = s.employee_id
      GROUP BY e.department, e.currency
      ORDER BY e.department ASC, headcount DESC
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
        e.designation,
        e.currency,
        COUNT(e.id) as headcount,
        ROUND(AVG(s.net_salary), 2) as avg_net,
        ROUND(MIN(s.net_salary), 2) as min_net,
        ROUND(MAX(s.net_salary), 2) as max_net
      FROM employees e
      INNER JOIN salaries s ON e.id = s.employee_id
      GROUP BY e.designation, e.currency
      ORDER BY e.designation ASC
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
}

module.exports = new AnalyticsService();
