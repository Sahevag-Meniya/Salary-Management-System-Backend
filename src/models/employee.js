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
