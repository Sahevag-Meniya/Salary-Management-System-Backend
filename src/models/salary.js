'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Salary extends Model {
    static associate(models) {
      Salary.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });
    }
  }

  Salary.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'employee_id'
    },
    basicSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'basic_salary',
      get() {
        const val = this.getDataValue('basicSalary');
        return val === null ? null : parseFloat(val);
      }
    },
    allowances: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'allowances',
      get() {
        const val = this.getDataValue('allowances');
        return val === null ? 0 : parseFloat(val);
      }
    },
    deductions: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'deductions',
      get() {
        const val = this.getDataValue('deductions');
        return val === null ? 0 : parseFloat(val);
      }
    },
    grossSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'gross_salary',
      get() {
        const val = this.getDataValue('grossSalary');
        return val === null ? null : parseFloat(val);
      }
    },
    netSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'net_salary',
      get() {
        const val = this.getDataValue('netSalary');
        return val === null ? null : parseFloat(val);
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    effectiveFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'effective_from'
    }
  }, {
    sequelize,
    modelName: 'Salary',
    tableName: 'salaries',
    underscored: true,
    timestamps: true
  });

  return Salary;
};
