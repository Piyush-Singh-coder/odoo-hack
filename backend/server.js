const express = require("express");
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const authRoute = require('./routes/auth.js')
const userRoute = require('./routes/users.js')
const approvalRoute = require('./routes/approval.js')
const expenseRoute = require('./routes/expenses.js')
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/receipts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',authRoute);
app.use('/api/users',userRoute);
app.use('/api/approvals',approvalRoute);
app.use('/api/expenses',expenseRoute);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Expense Management API is running' });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});