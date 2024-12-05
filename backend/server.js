const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const morgan  = require('morgan');
const logger = require('./services/logger')


dotenv.config();

const app = express();
const routes = require('./routes')

//Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));    

// Use Morgan for HTTP request logging
app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()), // Pipe Morgan logs into Winston
      },
    })
  );

//DB Connection
connectDB()

//Routes
app.use('/',routes);


//Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
