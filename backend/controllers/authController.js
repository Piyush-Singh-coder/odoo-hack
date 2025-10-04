const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database.js');
const { getCountryCurrency } = require('../utils/currency.js');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

exports.signup = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { email, password, firstName, lastName, companyName, country } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !companyName || !country) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Get currency for country
    const currency = await getCountryCurrency(country);

    // Create company
    const [companyResult] = await connection.query(
      'INSERT INTO companies (name, country, currency) VALUES (?, ?, ?)',
      [companyName, country, currency]
    );

    const companyId = companyResult.insertId;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [userResult] = await connection.query(
      'INSERT INTO users (company_id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [companyId, email, hashedPassword, firstName, lastName, 'admin']
    );

    const userId = userResult.insertId;

    await connection.commit();

    const token = generateToken({ id: userId, email, role: 'admin' });

    res.status(201).json({
      message: 'Company and admin user created successfully',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'admin',
        companyId,
        currency
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  } finally {
    connection.release();
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await db.query(
      'SELECT u.*, c.currency FROM users u JOIN companies c ON u.company_id = c.id WHERE u.email = ? AND u.is_active = true',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        managerId: user.manager_id,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};