//Defining Model
// - Javascript representation of the items table
// - Allows for interaction of databased with Javascript objects
// - Serves as a Schema

const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
    tableName: 'items',
    timestamps: true,
  });

module.exports = Item;
