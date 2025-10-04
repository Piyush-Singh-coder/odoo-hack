const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, managerId } = req.body;
    const companyId = req.user.company_id;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    if (!['employee', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be employee or manager' });
    }

    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // If managerId provided, verify manager exists and belongs to same company
    if (managerId) {
      const [manager] = await db.query(
        'SELECT id FROM users WHERE id = ? AND company_id = ? AND role IN ("manager", "admin")',
        [managerId, companyId]
      );

      if (manager.length === 0) {
        return res.status(400).json({ error: 'Invalid manager ID' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (company_id, email, password, first_name, last_name, role, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [companyId, email, hashedPassword, firstName, lastName, role, managerId || null]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        role,
        managerId
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error while creating user' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const [users] = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.manager_id, u.is_active,
              m.first_name as manager_first_name, m.last_name as manager_last_name
       FROM users u
       LEFT JOIN users m ON u.manager_id = m.id
       WHERE u.company_id = ?
       ORDER BY u.role, u.last_name`,
      [companyId]
    );

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, role, managerId, isActive } = req.body;
    const companyId = req.user.company_id;

    // Verify user belongs to same company
    const [user] = await db.query(
      'SELECT id FROM users WHERE id = ? AND company_id = ?',
      [userId, companyId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (firstName) {
      updates.push('first_name = ?');
      values.push(firstName);
    }
    if (lastName) {
      updates.push('last_name = ?');
      values.push(lastName);
    }
    if (role && ['employee', 'manager', 'admin'].includes(role)) {
      updates.push('role = ?');
      values.push(role);
    }
    if (managerId !== undefined) {
      if (managerId) {
        const [manager] = await db.query(
          'SELECT id FROM users WHERE id = ? AND company_id = ? AND role IN ("manager", "admin")',
          [managerId, companyId]
        );
        if (manager.length === 0) {
          return res.status(400).json({ error: 'Invalid manager ID' });
        }
      }
      updates.push('manager_id = ?');
      values.push(managerId || null);
    }
    if (typeof isActive === 'boolean') {
      updates.push('is_active = ?');
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(userId);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error while updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.user.company_id;

    // Verify user belongs to same company and is not an admin
    const [user] = await db.query(
      'SELECT id, role FROM users WHERE id = ? AND company_id = ?',
      [userId, companyId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user[0].role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin user' });
    }

    // Soft delete by setting is_active to false
    await db.query('UPDATE users SET is_active = false WHERE id = ?', [userId]);

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
};