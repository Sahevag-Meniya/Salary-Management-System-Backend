'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmployeeSalaryComponent extends Model {
    static associate(models) {
      EmployeeSalaryComponent.belongsTo(models.EmployeeSalaryStructure, {
        foreignKey: 'structure_id',
        as: 'structure',
        onDelete: 'CASCADE'
      });
      EmployeeSalaryComponent.belongsTo(models.SalaryComponent, {
        foreignKey: 'component_id',
        as: 'component',
        onDelete: 'RESTRICT'
      });
    }
  }

  EmployeeSalaryComponent.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    structureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'structure_id',
      references: {
        model: 'employee_salary_structures',
        key: 'id'
      }
    },
    componentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'component_id',
      references: {
        model: 'salary_components',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'EmployeeSalaryComponent',
    tableName: 'employee_salary_components',
    underscored: true,
    timestamps: true
  });

  return EmployeeSalaryComponent;
};
