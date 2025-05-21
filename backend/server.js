const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const requestLogger = require('./middlewares/requestLogger');

dotenv.config();
const app = express();
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(requestLogger); 

// DB Connection
connectDB();

// Health Check
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).send('API is healthy');
});

// Routes
app.use('/api', routes);

//404 Not Found Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
