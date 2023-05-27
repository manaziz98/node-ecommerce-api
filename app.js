const express = require('express')
const app = express();
require('dotenv').config();
const cors = require("cors");
const path = require("path");
const fs = require('fs');
const YAML = require('yaml');
const connectDB = require("./config/db")
const seedDB = require("./data/seedDB")
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use(express.json());
app.use(cors());

(async () => {
    await connectDB()
    // await seedDB()
})()

// Swagger configuration options
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Your API Documentation',
        version: '1.0.0',
        description: 'API documentation for your Express.js application',
      },
    },
    apis: ['./routes/*.js'], // Path to your route files
  };
  
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  
  fs.writeFileSync('swagger.yaml', YAML.stringify(swaggerSpec));
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/orders', orderRoutes);


// Catch-all route for handling "Not Found" requests
app.use((req, res, next) => {
    res.status(404).json({error: 'Not Found 404'});
});

app.listen(3000, () => {
    console.log("server running on port 3000");
});

module.exports = app;