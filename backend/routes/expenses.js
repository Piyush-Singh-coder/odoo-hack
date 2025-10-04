const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middlewares/authMiddleware.js');
const expenseController = require('../controllers/expenseController.js');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG) and PDFs are allowed'));
    }
  }
});

router.use(authenticate);

// Employee routes
router.post('/', authorize('employee', 'manager', 'admin'), upload.single('receipt'), expenseController.createExpense);
router.post('/ocr', authorize('employee', 'manager', 'admin'), upload.single('receipt'), expenseController.createExpenseWithOCR);
router.get('/my-expenses', authorize('employee', 'manager', 'admin'), expenseController.getEmployeeExpenses);

// Manager/Admin routes
router.get('/pending-approvals', authorize('manager', 'admin'), expenseController.getPendingApprovals);
router.post('/:expenseId/approve-reject', authorize('manager', 'admin'), expenseController.approveOrRejectExpense);

// Admin routes
router.get('/all', authorize('admin'), expenseController.getAllExpenses);

module.exports = router;