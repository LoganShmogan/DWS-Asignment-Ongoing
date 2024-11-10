// App.js
// This is the area that includes
// - App Setup
// - Express Framework
// - Middleware
// - Error Handling
// - Server Listening
// - Other Application Setup Code

// *APP SETUP*
//Importation of Modules
const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const sequelize = require('./database');
const { Sequelize, DataTypes} = require('sequelize');
const session = require('express-session');

//Generates Instance of Express Application 
const app = express();
const PORT = process.env.PORT || 3005; //Creates the number the server will listen on

//Registers Handlebars engine with the Application
//Allows for .handlebars files
app.engine(
  "handlebars",
  engine({
    partialsDir: path.join(__dirname, "views/partials"), //Where partial files are found (reusable files)
  })
);
app.set("view engine", "handlebars"); //Sets Handlebars as the default veiw engine

app.set("views", path.join(__dirname, "views")); //Tells app where to find view directory

// *MIDDLEWARE*
//Serves static files (makes accesable to client)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Define Property model
const Property = sequelize.define('Property', {
  address: { type: DataTypes.STRING, allowNull: false },
  suburb: { type: DataTypes.STRING, allowNull: false },
  town_city: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  list_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image_name: { type: DataTypes.STRING, allowNull: false },
  bedrooms: { type: DataTypes.INTEGER, allowNull: false },
  ensuite: { type: DataTypes.BOOLEAN, allowNull: false },
  sold: { type: DataTypes.BOOLEAN, allowNull: false },
  featured: { type: DataTypes.BOOLEAN, allowNull: false },
  pool: { type: DataTypes.BOOLEAN, allowNull: false },
  active: { type: DataTypes.BOOLEAN, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, 
{
  tableName: 'properties',
  timestamps: false
});


const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
      next();
  } else {
      res.redirect('/login');
  }
};

// Home Page
app.get("/", async (req, res) => {
  try {
      
      const properties = await Property.findAll({
          where: { active: true },  
          order: sequelize.random(), 
          limit: 21 
      });

      
      const plainProperties = properties.map(prop => {
          const property = prop.get({ plain: true });
          property.image_url = `/images/houses/${property.image_name}`; 
          return property;
      });

      
      const suburbs = await Property.findAll({
          attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('suburb')), 'suburb']],
          where: { active: true }, 
          limit: 18 
      });
      const plainSuburbs = suburbs.map(suburb => suburb.get({ plain: true }));
      
      
      res.render("home", {
          layout: "main", 
          title: "Home", 
          properties: plainProperties, 
          suburbs: plainSuburbs
      });
  } catch (error) { 
      console.error('Error fetching properties:', error);
      res.status(500).send('Error');
  }
});

// Route Subrub
app.get("/filter/:suburb", async (req, res) => {
  try {
      const suburbName = req.params.suburb;
      let properties;

      
      if (suburbName === "All") {
          properties = await Property.findAll({
              limit: 21 
          });
      } else {
          properties = await Property.findAll({
              where: { suburb: suburbName },
              limit: 21 
          });
      }

      const plainProperties = properties.map(prop => {
          const property = prop.get({ plain: true });
          property.image_url = `/images/houses/${property.image_name}`;
          return property;
      });

      
      const suburbs = await Property.findAll({
          attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('suburb')), 'suburb']],
          order: [['suburb', 'ASC']],  
          limit: 21 
      });
      const plainSuburbs = [{ suburb: 'All' }, ...suburbs.map(suburb => suburb.get({ plain: true }))];
      
      
      res.render("home", {
          layout: "main", 
          title: "Home", 
          properties: plainProperties, 
          suburbs: plainSuburbs 
      });
  } catch (error) { 
      console.error('Error filtering properties: ', error);
      res.status(500).send('An error occurred while filtering properties');
  }
});

// Route Login 
app.get('/login', (req, res) => {
  res.render('login', 
      { 
          layout: "main", 
          title: "Login" 
      });
});

app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true
}));

// Route Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') { 
      req.session.user = username;
      res.redirect('/dashboard');
  } else {
      res.render('login', {
          layout: "main",  
          title: "Login", 
          error: "Invalid Login." 
      });
  }
});

// Route Dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', {
      user: req.session.user, 
      layout: "main", 
      title: "Dashboard" 
  });
});

// Start the server
app.listen(PORT, async () => {
  try {
      await sequelize.authenticate();
      console.log("Database connected successfully"); 
  } catch (error) {
      console.error("Unable to connect to the database:", error); 
  }
  console.log(`Server is running on http://localhost:${PORT}`); 
});