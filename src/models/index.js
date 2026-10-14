'use strict';

const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {};

// Import models
db.Department = require('./department')(sequelize, Sequelize.DataTypes);
db.Designation = require('./designation')(sequelize, Sequelize.DataTypes);
db.Employee = require('./employee')(sequelize, Sequelize.DataTypes);
db.Salary = require('./salary')(sequelize, Sequelize.DataTypes);

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
