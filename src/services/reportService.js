const { Op } = require('sequelize');
const { Employee, EmployeeSalaryStructure, Country, Department, Designation } = require('../models');

class ReportService {
  /**
   * Generates a clean, CSV-formatted string for filtered salary records.
   */
  async generateSalaryCsv({
    ids,
    search = '',
    country = '',
    department = '',
    designation = '',
    currency = '',
    minSalary,
    maxSalary
  }) {
    const employeeWhere = {};

    if (ids) {
      const idList = Array.isArray(ids)
        ? ids.map(id => parseInt(id, 10)).filter(n => !isNaN(n))
        : String(ids).split(',').map(id => parseInt(id.trim(), 10)).filter(n => !isNaN(n));

      if (idList.length > 0) {
        employeeWhere.id = { [Op.in]: idList };
      }
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      employeeWhere[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { email: { [Op.like]: searchTerm } }
      ];
    }

    const salaryWhere = { isCurrent: true };
    if (currency && currency.trim()) {
      salaryWhere.currency = currency.trim().toUpperCase();
    }
    if (minSalary !== undefined && minSalary !== '' && !isNaN(minSalary)) {
      salaryWhere.netSalary = { ...(salaryWhere.netSalary || {}), [Op.gte]: parseFloat(minSalary) };
    }
    if (maxSalary !== undefined && maxSalary !== '' && !isNaN(maxSalary)) {
      salaryWhere.netSalary = { ...(salaryWhere.netSalary || {}), [Op.lte]: parseFloat(maxSalary) };
    }

    const records = await Employee.findAll({
      where: employeeWhere,
      include: [
        {
          model: Country,
          as: 'country',
          where: country && country.trim() ? { name: country.trim() } : undefined,
          required: !!(country && country.trim())
        },
        {
          model: Designation,
          as: 'designation',
          where: designation && designation.trim() ? { name: designation.trim() } : undefined,
          required: !!(designation && designation.trim()) || !!(department && department.trim()),
          include: [
            {
              model: Department,
              as: 'department',
              where: department && department.trim() ? { name: department.trim() } : undefined,
              required: !!(department && department.trim())
            }
          ]
        },
        {
          model: EmployeeSalaryStructure,
          as: 'salaryStructure',
          where: salaryWhere,
          required: true
        }
      ],
      order: [['id', 'ASC']]
    });

    // Helper to escape CSV cell
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const value = String(str).replace(/"/g, '""');
      return `"${value}"`;
    };

    const headers = [
      'ID',
      'Name',
      'Email',
      'Country',
      'Department',
      'Designation',
      'Currency',
      'Basic Salary',
      'Allowances',
      'Deductions',
      'Gross Salary',
      'Net Salary',
      'Effective From'
    ];

    const rows = records.map(empInstance => {
      const r = empInstance.toJSON();
      const s = r.salary || {};
      return [
        r.id,
        escapeCsv(r.name),
        escapeCsv(r.email),
        escapeCsv(r.country || r.countryDetails?.name || ''),
        escapeCsv(r.department || ''),
        escapeCsv(r.designation || r.designationDetails?.name || ''),
        escapeCsv(s.currency || r.currency || ''),
        s.basicSalary !== undefined ? s.basicSalary : 0,
        s.allowances !== undefined ? s.allowances : 0,
        s.deductions !== undefined ? s.deductions : 0,
        s.grossSalary !== undefined ? s.grossSalary : 0,
        s.netSalary !== undefined ? s.netSalary : 0,
        escapeCsv(s.effectiveFrom || '')
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }
}

module.exports = new ReportService();
