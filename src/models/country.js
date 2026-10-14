'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    static associate(models) {
      Country.hasMany(models.Employee, {
        foreignKey: 'country_id',
        as: 'employees'
      });
    }
  }

  Country.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true
    },
    currencyCode: {
      type: DataTypes.STRING(3),
      allowNull: false,
      field: 'currency_code'
    },
    currencySymbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'currency_symbol'
    }
  }, {
    sequelize,
    modelName: 'Country',
    tableName: 'countries',
    underscored: true,
    timestamps: true
  });

  return Country;
};
