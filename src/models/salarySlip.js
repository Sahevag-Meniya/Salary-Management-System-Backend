'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SalarySlip extends Model {
    static associate(models) {
      SalarySlip.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee',
        onDelete: 'RESTRICT'
      });
      SalarySlip.belongsTo(models.EmployeeSalaryStructure, {
        foreignKey: 'salary_structure_id',
        as: 'salaryStructure',
        onDelete: 'RESTRICT'
      });
    }
  }

  SalarySlip.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    slipNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'slip_number',
      validate: {
        notEmpty: true
      }
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    salaryStructureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'salary_structure_id',
      references: {
        model: 'employee_salary_structures',
        key: 'id'
      }
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000
      }
    },
    workingDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      field: 'working_days'
    },
    paidDays: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'paid_days'
    },
    unpaidDays: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'unpaid_days'
    },
    grossSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'gross_salary'
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'total_deductions'
    },
    netSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'net_salary'
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('draft', 'generated', 'paid'),
      allowNull: false,
      defaultValue: 'generated',
      validate: {
        isIn: [['draft', 'generated', 'paid']]
      }
    },
    salaryDetails: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'salary_details'
    }
  }, {
    sequelize,
    modelName: 'SalarySlip',
    tableName: 'salary_slips',
    underscored: true,
    timestamps: true
  });

  return SalarySlip;
};
