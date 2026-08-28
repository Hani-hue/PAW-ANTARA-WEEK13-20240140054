const sequelize = require('../config/database');
const Product = require('./product.model');
const Order = require('./order.model');
const User = require('./user.model');

module.exports = { sequelize, Product, Order, User };