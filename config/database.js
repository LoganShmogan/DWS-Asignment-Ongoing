//Database.JS
//Responsible for connecting to our database
const { Sequelize } = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize('realestate', 'root', 'Wheatb1xb1te$', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
