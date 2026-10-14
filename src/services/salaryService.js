const { Op } = require('sequelize');
const { Employee, EmployeeSalaryStructure, EmployeeSalaryComponent, SalaryComponent, Country, Designation, Department, sequelize } = require('../models');
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

    // Build salary where clause
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

    // Country where clause
    const countryWhere = {};
    if (country && country.trim()) {
      countryWhere.name = country.trim();
    }

    // Designation and Department filter where clauses
    const designationWhere = {};
    if (designation && designation.trim()) {
      designationWhere.name = designation.trim();
    }

    const departmentWhere = {};
    if (department && department.trim()) {
      departmentWhere.name = department.trim();
    }

    // Handle dynamic sorting
    let orderClause = [['id', 'ASC']];
    const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    if (sortBy === 'name') {
      orderClause = [['name', direction]];
    } else if (sortBy === 'country') {
      orderClause = [[{ model: Country, as: 'country' }, 'name', direction]];
    } else if (sortBy === 'department') {
      orderClause = [[{ model: Designation, as: 'designation' }, { model: Department, as: 'department' }, 'name', direction]];
    } else if (sortBy === 'designation') {
      orderClause = [[{ model: Designation, as: 'designation' }, 'name', direction]];
    } else if (sortBy === 'basicSalary' || sortBy === 'basic_salary') {
      orderClause = [[{ model: EmployeeSalaryStructure, as: 'salaryStructure' }, 'gross_salary', direction]];
    } else if (sortBy === 'netSalary' || sortBy === 'net_salary') {
      orderClause = [[{ model: EmployeeSalaryStructure, as: 'salaryStructure' }, 'net_salary', direction]];
    } else if (sortBy === 'grossSalary' || sortBy === 'gross_salary') {
      orderClause = [[{ model: EmployeeSalaryStructure, as: 'salaryStructure' }, 'gross_salary', direction]];
    }

    const { count, rows } = await Employee.findAndCountAll({
      where: employeeWhere,
      include: [
        {
          model: Country,
          as: 'country',
          where: Object.keys(countryWhere).length > 0 ? countryWhere : undefined,
          required: Object.keys(countryWhere).length > 0
        },
        {
          model: Designation,
          as: 'designation',
          where: Object.keys(designationWhere).length > 0 ? designationWhere : undefined,
          required: Object.keys(designationWhere).length > 0 || Object.keys(departmentWhere).length > 0,
          include: [
            {
              model: Department,
              as: 'department',
              where: Object.keys(departmentWhere).length > 0 ? departmentWhere : undefined,
              required: Object.keys(departmentWhere).length > 0
            }
          ]
        },
        {
          model: EmployeeSalaryStructure,
          as: 'salaryStructure',
          where: salaryWhere,
          required: true,
          include: [
            {
              model: EmployeeSalaryComponent,
              as: 'components',
              required: false,
              include: [{ model: SalaryComponent, as: 'component' }]
            }
          ]
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
      include: [
        { model: Country, as: 'country' },
        {
          model: Designation,
          as: 'designation',
          include: [{ model: Department, as: 'department' }]
        },
        {
          model: EmployeeSalaryStructure,
          as: 'salaryStructure',
          where: { isCurrent: true },
          required: false,
          include: [
            {
              model: EmployeeSalaryComponent,
              as: 'components',
              required: false,
              include: [{ model: SalaryComponent, as: 'component' }]
            }
          ]
        }
      ]
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
      // 1. Resolve country_id
      let resolvedCountryId = data.countryId;
      if (!resolvedCountryId && data.country) {
        const countryRow = await Country.findOne({
          where: { name: data.country.trim() },
          transaction
        });
        if (countryRow) resolvedCountryId = countryRow.id;
      }
      if (!resolvedCountryId) {
        const defaultCountry = await Country.findOne({ transaction });
        resolvedCountryId = defaultCountry?.id || 1;
      }

      // 2. Resolve designation_id
      let resolvedDesignationId = data.designationId;
      if (!resolvedDesignationId && data.designation && data.department) {
        const desigRow = await Designation.findOne({
          where: { name: data.designation.trim() },
          include: [{ model: Department, as: 'department', where: { name: data.department.trim() } }],
          transaction
        });
        if (desigRow) resolvedDesignationId = desigRow.id;
      } else if (!resolvedDesignationId && data.designation) {
        const desigRow = await Designation.findOne({
          where: { name: data.designation.trim() },
          transaction
        });
        if (desigRow) resolvedDesignationId = desigRow.id;
      }
      if (!resolvedDesignationId) {
        const defaultDesig = await Designation.findOne({ transaction });
        resolvedDesignationId = defaultDesig?.id || 1;
      }

      // Fetch country for currency
      const countryObj = await Country.findByPk(resolvedCountryId, { transaction });
      const currency = data.currency ? data.currency.trim().toUpperCase() : (countryObj?.currencyCode || 'USD');

      const employee = await Employee.create({
        name: data.name.trim(),
        email: data.email.trim(),
        countryId: resolvedCountryId,
        designationId: resolvedDesignationId
      }, { transaction });

      const structure = await EmployeeSalaryStructure.create({
        employeeId: employee.id,
        grossSalary: calculated.grossSalary,
        totalDeductions: calculated.deductions,
        netSalary: calculated.netSalary,
        currency,
        effectiveFrom: data.effectiveFrom || new Date().toISOString().split('T')[0],
        isCurrent: true,
        revisionReason: 'Initial Package'
      }, { transaction });

      // Find BASIC component ID if available to record line item
      const basicComp = await SalaryComponent.findOne({ where: { code: 'BASIC' }, transaction });
      if (basicComp) {
        await EmployeeSalaryComponent.create({
          structureId: structure.id,
          componentId: basicComp.id,
          amount: calculated.basicSalary
        }, { transaction });
      }

      await transaction.commit();

      return await this.getSalaryById(employee.id);
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
      include: [
        {
          model: EmployeeSalaryStructure,
          as: 'salaryStructure',
          where: { isCurrent: true },
          required: false
        }
      ]
    });

    if (!employee) {
      const error = new Error(`Employee with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    const transaction = await sequelize.transaction();

    try {
      if (data.name) employee.name = data.name.trim();
      if (data.email) employee.email = data.email.trim();

      if (data.countryId) {
        employee.countryId = data.countryId;
      } else if (data.country) {
        const cRow = await Country.findOne({ where: { name: data.country.trim() }, transaction });
        if (cRow) employee.countryId = cRow.id;
      }

      if (data.designationId) {
        employee.designationId = data.designationId;
      } else if (data.designation && data.department) {
        const dRow = await Designation.findOne({
          where: { name: data.designation.trim() },
          include: [{ model: Department, as: 'department', where: { name: data.department.trim() } }],
          transaction
        });
        if (dRow) employee.designationId = dRow.id;
      } else if (data.designation) {
        const dRow = await Designation.findOne({ where: { name: data.designation.trim() }, transaction });
        if (dRow) employee.designationId = dRow.id;
      }

      await employee.save({ transaction });

      // Update salary structure if salary fields exist
      const activeStructure = employee.salaryStructure;
      if (activeStructure) {
        const currentGross = Number(activeStructure.grossSalary);
        const currentDeduct = Number(activeStructure.totalDeductions);
        const currentBasic = Math.round(currentGross * 0.5);
        const currentAllow = currentGross - currentBasic;

        const basicSalary = data.basicSalary !== undefined ? data.basicSalary : currentBasic;
        const allowances = data.allowances !== undefined ? data.allowances : currentAllow;
        const deductions = data.deductions !== undefined ? data.deductions : currentDeduct;

        const calculated = calculateSalary({ basicSalary, allowances, deductions });

        activeStructure.grossSalary = calculated.grossSalary;
        activeStructure.totalDeductions = calculated.deductions;
        activeStructure.netSalary = calculated.netSalary;
        if (data.currency) activeStructure.currency = data.currency.trim().toUpperCase();
        if (data.effectiveFrom) activeStructure.effectiveFrom = data.effectiveFrom;
        if (data.revisionReason) activeStructure.revisionReason = data.revisionReason.trim();

        await activeStructure.save({ transaction });

        // Synchronize BASIC component amount if structure components are present
        const basicComp = await SalaryComponent.findOne({ where: { code: 'BASIC' }, transaction });
        if (basicComp) {
          const empComp = await EmployeeSalaryComponent.findOne({
            where: { structureId: activeStructure.id, componentId: basicComp.id },
            transaction
          });
          if (empComp) {
            empComp.amount = calculated.basicSalary;
            await empComp.save({ transaction });
          }
        }
      }

      await transaction.commit();

      return await this.getSalaryById(id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Delete an employee record (cascade deletes salary structure).
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
      Country.findAll({ attributes: ['id', 'name', 'code', 'currencyCode', 'currencySymbol'], order: [['name', 'ASC']], raw: true }),
      Department.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']], raw: true }),
      Designation.findAll({
        attributes: ['id', 'name', 'department_id'],
        include: [{ model: Department, as: 'department', attributes: ['name'] }],
        order: [['name', 'ASC']]
      }),
      EmployeeSalaryStructure.findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('currency')), 'currency']], raw: true })
    ]);

    const distinctDesignationNames = [...new Set(designations.map(d => d.name))].sort();

    return {
      countries: countries.map(c => c.name).sort(),
      departments: departments.map(d => d.name).sort(),
      designations: distinctDesignationNames,
      currencies: currencies.map(c => c.currency).filter(Boolean).sort(),
      countryList: countries,
      departmentList: departments,
      designationList: designations.map(d => ({
        id: d.id,
        name: d.name,
        departmentId: d.department_id || d.departmentId,
        departmentName: d.department?.name || ''
      }))
    };
  }
}

module.exports = new SalaryService();
