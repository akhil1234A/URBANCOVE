const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');



dotenv.config();

const app = express();
const routes = require('./routes')

//Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));    



//DB Connection
connectDB()

//Health Check Up
app.get('/health', (req, res) => { res.status(200).send('API '); });

//Routes
app.use('/api',routes);


//Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
