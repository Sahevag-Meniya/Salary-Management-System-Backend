'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmployeeSalaryStructure extends Model {
    static associate(models) {
      EmployeeSalaryStructure.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee',
        onDelete: 'CASCADE'
      });
      EmployeeSalaryStructure.hasMany(models.EmployeeSalaryComponent, {
        foreignKey: 'structure_id',
        as: 'components',
        onDelete: 'CASCADE'
      });
      EmployeeSalaryStructure.hasMany(models.SalarySlip, {
        foreignKey: 'salary_structure_id',
        as: 'salarySlips',
        onDelete: 'RESTRICT'
      });
    }
  }

  EmployeeSalaryStructure.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
    effectiveFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'effective_from'
    },
    effectiveTo: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'effective_to'
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_current'
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
      allowNull: true,
      defaultValue: 'USD'
    },
    revisionReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'revision_reason'
    }
  }, {
    sequelize,
    modelName: 'EmployeeSalaryStructure',
    tableName: 'employee_salary_structures',
    underscored: true,
    timestamps: true
  });

  return EmployeeSalaryStructure;
};
