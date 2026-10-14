'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.belongsTo(models.Country, {
        foreignKey: 'country_id',
        as: 'country'
      });
      Employee.belongsTo(models.Designation, {
        foreignKey: 'designation_id',
        as: 'designation'
      });
      Employee.hasMany(models.EmployeeSalaryStructure, {
        foreignKey: 'employee_id',
        as: 'salaryStructures',
        onDelete: 'CASCADE'
      });
      Employee.hasOne(models.EmployeeSalaryStructure, {
        foreignKey: 'employee_id',
        as: 'salaryStructure'
      });
      Employee.hasMany(models.SalarySlip, {
        foreignKey: 'employee_id',
        as: 'salarySlips',
        onDelete: 'RESTRICT'
      });
    }

    toJSON() {
      const values = { ...this.get() };

      // Flatten country details for instant UI access & backward compatibility
      if (this.country && typeof this.country === 'object') {
        values.countryDetails = this.country;
        values.country = this.country.name;
        values.currency = this.country.currencyCode;
        values.currencySymbol = this.country.currencySymbol;
      }

      // Flatten designation & department for instant UI access & backward compatibility
      if (this.designation && typeof this.designation === 'object') {
        values.designationDetails = this.designation;
        values.designation = this.designation.name;
        values.department = this.designation.department ? this.designation.department.name : '';
        values.departmentId = this.designation.departmentId;
      }

      // Flatten active salary structure for table & detail modal compatibility
      const struct = this.salaryStructure || (this.salaryStructures && Array.isArray(this.salaryStructures) ? (this.salaryStructures.find(s => s.isCurrent) || this.salaryStructures[0]) : null);
      if (struct) {
        let basic = 0;
        let allowances = 0;
        let deductions = Number(struct.totalDeductions || 0);

        if (struct.components && Array.isArray(struct.components)) {
          const basicComp = struct.components.find(c => c.component?.code === 'BASIC');
          if (basicComp) {
            basic = Number(basicComp.amount || 0);
          } else {
            basic = Math.round(Number(struct.grossSalary || 0) * 0.5);
          }
          allowances = Math.max(0, Number(struct.grossSalary || 0) - basic);
        } else {
          basic = Math.round(Number(struct.grossSalary || 0) * 0.5);
          allowances = Math.max(0, Number(struct.grossSalary || 0) - basic);
        }

        values.salary = {
          id: struct.id,
          employeeId: struct.employeeId,
          basicSalary: basic,
          allowances: allowances,
          deductions: deductions,
          grossSalary: Number(struct.grossSalary || 0),
          netSalary: Number(struct.netSalary || 0),
          currency: struct.currency || values.currency || 'USD',
          effectiveFrom: struct.effectiveFrom,
          revisionReason: struct.revisionReason,
          isCurrent: struct.isCurrent,
          components: struct.components || []
        };
        values.grossSalary = Number(struct.grossSalary || 0);
        values.netSalary = Number(struct.netSalary || 0);
        values.totalDeductions = deductions;
        values.salaryStructure = struct;
      }

      return values;
    }
  }

  Employee.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'country_id',
      references: {
        model: 'countries',
        key: 'id'
      }
    },
    designationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'designation_id',
      references: {
        model: 'designations',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    underscored: true,
    timestamps: true
  });

  return Employee;
};
