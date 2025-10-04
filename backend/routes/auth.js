const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.post('/signup', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('country').notEmpty().withMessage('Country is required')
], authController.signup);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

module.exports = router;