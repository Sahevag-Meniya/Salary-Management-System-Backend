'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Designation extends Model {
    static associate(models) {
      Designation.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'department'
      });
      Designation.hasMany(models.Employee, {
        foreignKey: 'designation_id',
        as: 'employees'
      });
    }
  }

  Designation.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id',
      references: {
        model: 'departments',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Designation',
    tableName: 'designations',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['department_id', 'name'],
        name: 'uk_dept_designation'
      }
    ]
  });

  return Designation;
};
