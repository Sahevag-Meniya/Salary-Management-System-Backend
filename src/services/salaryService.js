const { Op } = require('sequelize');
const { Employee, Salary, sequelize } = require('../models');
const { calculateSalary, validateSalaryInput } = require('../utils/calculations');

class SalaryService {
  /**
   * Retrieves paginated, filtered, and sorted employee salary records.
   */
  async getSalaryRecords({
    search = '',
    country = '',
    department = '',
    designation = '',
    currency = '',
    minSalary,
    maxSalary,
    sortBy = 'id',
    sortOrder = 'ASC',
    page = 1,
    limit = 25
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const offset = (pageNum - 1) * limitNum;

    // Build employee where clause
    const employeeWhere = {};

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      employeeWhere[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { email: { [Op.like]: searchTerm } }
      ];
    }

    if (country && country.trim()) {
      employeeWhere.country = country.trim();
    }

    if (department && department.trim()) {
      employeeWhere.department = department.trim();
    }

    if (designation && designation.trim()) {
      employeeWhere.designation = designation.trim();
    }

    if (currency && currency.trim()) {
      employeeWhere.currency = currency.trim().toUpperCase();
    }

    // Build salary where clause
    const salaryWhere = {};
    if (minSalary !== undefined && minSalary !== '' && !isNaN(minSalary)) {
      salaryWhere.netSalary = { ...(salaryWhere.netSalary || {}), [Op.gte]: parseFloat(minSalary) };
    }
    if (maxSalary !== undefined && maxSalary !== '' && !isNaN(maxSalary)) {
      salaryWhere.netSalary = { ...(salaryWhere.netSalary || {}), [Op.lte]: parseFloat(maxSalary) };
    }

    // Handle dynamic sorting
    let orderClause = [['id', 'ASC']];
    const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    if (sortBy === 'name') {
      orderClause = [['name', direction]];
    } else if (sortBy === 'country') {
      orderClause = [['country', direction]];
    } else if (sortBy === 'department') {
      orderClause = [['department', direction]];
    } else if (sortBy === 'basicSalary' || sortBy === 'basic_salary') {
      orderClause = [[{ model: Salary, as: 'salary' }, 'basic_salary', direction]];
    } else if (sortBy === 'netSalary' || sortBy === 'net_salary') {
      orderClause = [[{ model: Salary, as: 'salary' }, 'net_salary', direction]];
    } else if (sortBy === 'grossSalary' || sortBy === 'gross_salary') {
      orderClause = [[{ model: Salary, as: 'salary' }, 'gross_salary', direction]];
    }

    const { count, rows } = await Employee.findAndCountAll({
      where: employeeWhere,
      include: [
        {
          model: Salary,
          as: 'salary',
          where: Object.keys(salaryWhere).length > 0 ? salaryWhere : undefined,
          required: true
        }
      ],
      order: orderClause,
      limit: limitNum,
      offset,
      distinct: true
    });

    return {
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
      data: rows
    };
  }

  /**
   * Fetch a single employee record with salary details.
   */
  async getSalaryById(id) {
    const employee = await Employee.findByPk(id, {
      include: [{ model: Salary, as: 'salary', required: false }]
    });

    if (!employee) {
      throw new Error(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  /**
   * Create a new employee with their salary breakdown.
   */
  async createSalaryRecord(data) {
    const validation = validateSalaryInput(data);
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    const calculated = calculateSalary({
      basicSalary: data.basicSalary,
      allowances: data.allowances,
      deductions: data.deductions
    });

    const transaction = await sequelize.transaction();

    try {
      const employee = await Employee.create({
        name: data.name.trim(),
        email: data.email.trim(),
        country: data.country.trim(),
        department: data.department.trim(),
        designation: data.designation.trim(),
        currency: data.currency.trim().toUpperCase()
      }, { transaction });

      const salary = await Salary.create({
        employeeId: employee.id,
        basicSalary: calculated.basicSalary,
        allowances: calculated.allowances,
        deductions: calculated.deductions,
        grossSalary: calculated.grossSalary,
        netSalary: calculated.netSalary,
        currency: data.currency.trim().toUpperCase(),
        effectiveFrom: data.effectiveFrom || new Date().toISOString().split('T')[0]
      }, { transaction });

      await transaction.commit();

      return {
        ...employee.toJSON(),
        salary: salary.toJSON()
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Update an existing employee and salary breakdown.
   */
  async updateSalaryRecord(id, data) {
    const employee = await Employee.findByPk(id, {
      include: [{ model: Salary, as: 'salary' }]
    });

    if (!employee) {
      const error = new Error(`Employee with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    const transaction = await sequelize.transaction();

    try {
      // Update employee fields if provided
      if (data.name) employee.name = data.name.trim();
      if (data.email) employee.email = data.email.trim();
      if (data.country) employee.country = data.country.trim();
      if (data.department) employee.department = data.department.trim();
      if (data.designation) employee.designation = data.designation.trim();
      if (data.currency) employee.currency = data.currency.trim().toUpperCase();

      await employee.save({ transaction });

      // Update salary if salary fields exist
      if (employee.salary) {
        const basicSalary = data.basicSalary !== undefined ? data.basicSalary : employee.salary.basicSalary;
        const allowances = data.allowances !== undefined ? data.allowances : employee.salary.allowances;
        const deductions = data.deductions !== undefined ? data.deductions : employee.salary.deductions;

        const calculated = calculateSalary({ basicSalary, allowances, deductions });

        employee.salary.basicSalary = calculated.basicSalary;
        employee.salary.allowances = calculated.allowances;
        employee.salary.deductions = calculated.deductions;
        employee.salary.grossSalary = calculated.grossSalary;
        employee.salary.netSalary = calculated.netSalary;
        if (data.currency) employee.salary.currency = data.currency.trim().toUpperCase();
        if (data.effectiveFrom) employee.salary.effectiveFrom = data.effectiveFrom;

        await employee.salary.save({ transaction });
      }

      await transaction.commit();

      return await this.getSalaryById(id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Delete an employee record (cascade deletes salary).
   */
  async deleteSalaryRecord(id) {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      const error = new Error(`Employee with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    await employee.destroy();
    return { success: true, message: `Employee with ID ${id} deleted successfully` };
  }

  /**
   * Return distinct values for filter dropdowns.
   */
  async getFilterOptions() {
    const [countries, departments, designations, currencies] = await Promise.all([
      Employee.findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('country')), 'country']], raw: true }),
      Employee.findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('department')), 'department']], raw: true }),
      Employee.findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('designation')), 'designation']], raw: true }),
      Employee.findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('currency')), 'currency']], raw: true })
    ]);

    return {
      countries: countries.map(c => c.country).filter(Boolean).sort(),
      departments: departments.map(d => d.department).filter(Boolean).sort(),
      designations: designations.map(d => d.designation).filter(Boolean).sort(),
      currencies: currencies.map(c => c.currency).filter(Boolean).sort()
    };
  }
}

module.exports = new SalaryService();
