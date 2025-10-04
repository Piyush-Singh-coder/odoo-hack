const db = require('../config/database');
const { convertCurrency } = require('../utils/currency.js');
const { extractReceiptData } = require('../utils/ocr.js');

exports.createExpense = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { amount, currency, category, description, expenseDate, approvalRuleId } = req.body;
    const employeeId = req.user.id;
    const companyId = req.user.company_id;
    const companyCurrency = req.user.company_currency;

    // Validate required fields
    if (!amount || !currency || !category || !expenseDate) {
      return res.status(400).json({ error: 'Amount, currency, category, and date are required' });
    }

    // Convert amount to company currency
    const convertedAmount = await convertCurrency(amount, currency, companyCurrency);

    // Get receipt path if uploaded
    const receiptPath = req.file ? req.file.path : null;

    // Create expense
    const [expenseResult] = await connection.query(
      `INSERT INTO expenses (company_id, employee_id, approval_rule_id, amount, currency, converted_amount, category, description, expense_date, receipt_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, employeeId, approvalRuleId || null, amount, currency, convertedAmount, category, description, expenseDate, receiptPath]
    );

    const expenseId = expenseResult.insertId;

    // Get approval rule if specified
    let approvalRule = null;
    if (approvalRuleId) {
      const [rules] = await connection.query(
        'SELECT * FROM approval_rules WHERE id = ? AND company_id = ? AND is_active = true',
        [approvalRuleId, companyId]
      );
      approvalRule = rules[0];
    }

    // Create approval workflow
    const approvers = [];

    // Add manager as first approver if rule specifies
    if (!approvalRule || approvalRule.is_manager_approver) {
      const [employee] = await connection.query(
        'SELECT manager_id FROM users WHERE id = ?',
        [employeeId]
      );

      if (employee[0].manager_id) {
        approvers.push({ id: employee[0].manager_id, order: 1 });
      }
    }

    // Add sequential approvers from rule
    if (approvalRule && (approvalRule.rule_type === 'sequential' || approvalRule.rule_type === 'hybrid')) {
      const [steps] = await connection.query(
        'SELECT approver_id, step_order FROM approval_steps WHERE approval_rule_id = ? ORDER BY step_order',
        [approvalRuleId]
      );

      const startOrder = approvers.length + 1;
      steps.forEach((step, index) => {
        approvers.push({ id: step.approver_id, order: startOrder + index });
      });
    }

    // Create approval records
    for (const approver of approvers) {
      await connection.query(
        'INSERT INTO expense_approvals (expense_id, approver_id, step_order, status) VALUES (?, ?, ?, ?)',
        [expenseId, approver.id, approver.order, approver.order === 1 ? 'pending' : 'pending']
      );
    }

    // Set current step to 1 if there are approvers
    if (approvers.length > 0) {
      await connection.query(
        'UPDATE expenses SET current_step = 1 WHERE id = ?',
        [expenseId]
      );
    }

    // Log action
    await connection.query(
      'INSERT INTO audit_logs (expense_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [expenseId, employeeId, 'CREATED', `Expense created for ${category}`]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Expense created successfully',
      expenseId,
      convertedAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Server error while creating expense' });
  } finally {
    connection.release();
  }
};

exports.createExpenseWithOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Receipt image is required' });
    }

    // Extract data from receipt
    const extractedData = await extractReceiptData(req.file.path);

    res.json({
      message: 'Receipt processed successfully',
      extractedData: {
        amount: extractedData.amount,
        date: extractedData.date,
        description: extractedData.description,
        merchantName: extractedData.merchantName,
        receiptPath: req.file.path
      }
    });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
};

exports.getEmployeeExpenses = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT e.*, 
             GROUP_CONCAT(CONCAT(ea.step_order, ':', ea.status, ':', u.first_name, ' ', u.last_name) ORDER BY ea.step_order SEPARATOR '|') as approval_chain
      FROM expenses e
      LEFT JOIN expense_approvals ea ON e.id = ea.expense_id
      LEFT JOIN users u ON ea.approver_id = u.id
      WHERE e.employee_id = ?
    `;

    const params = [employeeId];

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    query += ' GROUP BY e.id ORDER BY e.created_at DESC';

    const [expenses] = await db.query(query, params);

    // Parse approval chain
    expenses.forEach(expense => {
      if (expense.approval_chain) {
        expense.approvals = expense.approval_chain.split('|').map(item => {
          const [order, status, name] = item.split(':');
          return { order: parseInt(order), status, approverName: name };
        });
      } else {
        expense.approvals = [];
      }
      delete expense.approval_chain;
    });

    res.json({ expenses });
  } catch (error) {
    console.error('Get employee expenses error:', error);
    res.status(500).json({ error: 'Server error while fetching expenses' });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const approverId = req.user.id;

    const [approvals] = await db.query(
      `SELECT e.*, ea.id as approval_id, ea.step_order, ea.comments,
              u.first_name as employee_first_name, u.last_name as employee_last_name, u.email as employee_email
       FROM expense_approvals ea
       JOIN expenses e ON ea.expense_id = e.id
       JOIN users u ON e.employee_id = u.id
       WHERE ea.approver_id = ? AND ea.status = 'pending' AND e.status = 'pending'
       ORDER BY e.created_at DESC`,
      [approverId]
    );

    res.json({ approvals });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Server error while fetching approvals' });
  }
};

exports.approveOrRejectExpense = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { expenseId } = req.params;
    const { action, comments } = req.body;
    const approverId = req.user.id;

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be approve or reject' });
    }

    // Get expense details
    const [expenses] = await connection.query(
      'SELECT * FROM expenses WHERE id = ? AND status = "pending"',
      [expenseId]
    );

    if (expenses.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Expense not found or already processed' });
    }

    const expense = expenses[0];

    // Get approval record
    const [approvals] = await connection.query(
      'SELECT * FROM expense_approvals WHERE expense_id = ? AND approver_id = ? AND status = "pending"',
      [expenseId, approverId]
    );

    if (approvals.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'You are not authorized to approve this expense or it has already been processed' });
    }

    const approval = approvals[0];

    // Update approval record
    await connection.query(
      'UPDATE expense_approvals SET status = ?, comments = ?, approved_at = NOW() WHERE id = ?',
      [action === 'approve' ? 'approved' : 'rejected', comments, approval.id]
    );

    // Log action
    await connection.query(
      'INSERT INTO audit_logs (expense_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [expenseId, approverId, action.toUpperCase(), comments || `Expense ${action}d`]
    );

    if (action === 'reject') {
      // Reject the expense
      await connection.query(
        'UPDATE expenses SET status = "rejected" WHERE id = ?',
        [expenseId]
      );

      await connection.commit();
      return res.json({ message: 'Expense rejected successfully' });
    }

    // Check approval rule
    const [rules] = await connection.query(
      'SELECT * FROM approval_rules WHERE id = ?',
      [expense.approval_rule_id]
    );

    const rule = rules.length > 0 ? rules[0] : null;

    // Check if specific approver rule applies
    if (rule && (rule.rule_type === 'specific_approver' || rule.rule_type === 'hybrid')) {
      if (approverId === rule.specific_approver_id) {
        await connection.query(
          'UPDATE expenses SET status = "approved" WHERE id = ?',
          [expenseId]
        );
        await connection.commit();
        return res.json({ message: 'Expense approved successfully (specific approver)' });
      }
    }

    // Check percentage rule
    if (rule && (rule.rule_type === 'percentage' || rule.rule_type === 'hybrid')) {
      const [allApprovals] = await connection.query(
        'SELECT COUNT(*) as total, SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved FROM expense_approvals WHERE expense_id = ?',
        [expenseId]
      );

      const approvalPercentage = (allApprovals[0].approved / allApprovals[0].total) * 100;

      if (approvalPercentage >= rule.percentage_threshold) {
        await connection.query(
          'UPDATE expenses SET status = "approved" WHERE id = ?',
          [expenseId]
        );
        await connection.commit();
        return res.json({ message: 'Expense approved successfully (percentage threshold met)' });
      }
    }

    // Sequential approval - move to next step
    const [nextApprovals] = await connection.query(
      'SELECT * FROM expense_approvals WHERE expense_id = ? AND step_order > ? AND status = "pending" ORDER BY step_order LIMIT 1',
      [expenseId, approval.step_order]
    );

    if (nextApprovals.length > 0) {
      // Move to next step
      await connection.query(
        'UPDATE expenses SET current_step = ? WHERE id = ?',
        [nextApprovals[0].step_order, expenseId]
      );
    } else {
      // All approvals complete
      await connection.query(
        'UPDATE expenses SET status = "approved" WHERE id = ?',
        [expenseId]
      );
    }

    await connection.commit();
    res.json({ message: 'Expense approved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Approve/reject expense error:', error);
    res.status(500).json({ error: 'Server error while processing approval' });
  } finally {
    connection.release();
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { status, employeeId } = req.query;

    let query = `
      SELECT e.*, 
             u.first_name as employee_first_name, u.last_name as employee_last_name, u.email as employee_email
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE e.company_id = ?
    `;

    const params = [companyId];

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (employeeId) {
      query += ' AND e.employee_id = ?';
      params.push(employeeId);
    }

    query += ' ORDER BY e.created_at DESC';

    const [expenses] = await db.query(query, params);

    res.json({ expenses });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ error: 'Server error while fetching expenses' });
  }
};