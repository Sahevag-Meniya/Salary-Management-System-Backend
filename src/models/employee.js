'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasOne(models.Salary, {
        foreignKey: 'employee_id',
        as: 'salary',
        onDelete: 'CASCADE'
      });
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
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false
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
