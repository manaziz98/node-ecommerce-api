const express = require('express')
const app = express();
require('dotenv').config();
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db")
const seedDB = require("./data/seedDB")
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(cors());

(async () => {
    await connectDB()
    // await seedDB()
})()

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/items', itemRoutes);


// Catch-all route for handling "Not Found" requests
app.use((req, res, next) => {
    res.status(404).json({error: 'Not Found 404'});
});

app.listen(3000, () => {
    console.log("server running on port 3000");
});