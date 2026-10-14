'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SalaryComponent extends Model {
    static associate(models) {
      SalaryComponent.belongsTo(models.SalaryComponent, {
        foreignKey: 'percentage_of_component_id',
        as: 'percentageOfComponent',
        onDelete: 'SET NULL'
      });
      SalaryComponent.hasMany(models.SalaryComponent, {
        foreignKey: 'percentage_of_component_id',
        as: 'dependentComponents',
        onDelete: 'SET NULL'
      });
      SalaryComponent.hasMany(models.EmployeeSalaryComponent, {
        foreignKey: 'component_id',
        as: 'employeeSalaryComponents',
        onDelete: 'RESTRICT'
      });
    }
  }

  SalaryComponent.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('earning', 'deduction'),
      allowNull: false,
      validate: {
        isIn: [['earning', 'deduction']]
      }
    },
    calculationType: {
      type: DataTypes.ENUM('fixed', 'percentage', 'remaining'),
      allowNull: false,
      defaultValue: 'fixed',
      field: 'calculation_type',
      validate: {
        isIn: [['fixed', 'percentage', 'remaining']]
      }
    },
    defaultValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'default_value'
    },
    percentageOfComponentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'percentage_of_component_id',
      references: {
        model: 'salary_components',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    sequelize,
    modelName: 'SalaryComponent',
    tableName: 'salary_components',
    underscored: true,
    timestamps: true
  });

  return SalaryComponent;
};
