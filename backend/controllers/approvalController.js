const db = require('../config/database');

exports.createApprovalRule = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      ruleName,
      isManagerApprover,
      ruleType,
      percentageThreshold,
      specificApproverId,
      approvers
    } = req.body;

    const companyId = req.user.company_id;

    // Validate required fields
    if (!ruleName || !ruleType) {
      return res.status(400).json({ error: 'Rule name and type are required' });
    }

    // Validate rule type
    const validRuleTypes = ['sequential', 'percentage', 'specific_approver', 'hybrid'];
    if (!validRuleTypes.includes(ruleType)) {
      return res.status(400).json({ error: 'Invalid rule type' });
    }

    // Validate percentage threshold for percentage-based rules
    if ((ruleType === 'percentage' || ruleType === 'hybrid') && !percentageThreshold) {
      return res.status(400).json({ error: 'Percentage threshold required for this rule type' });
    }

    // Validate specific approver for specific_approver rules
    if ((ruleType === 'specific_approver' || ruleType === 'hybrid') && !specificApproverId) {
      return res.status(400).json({ error: 'Specific approver required for this rule type' });
    }

    // Create approval rule
    const [ruleResult] = await connection.query(
      `INSERT INTO approval_rules (company_id, rule_name, is_manager_approver, rule_type, percentage_threshold, specific_approver_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        ruleName,
        isManagerApprover !== false,
        ruleType,
        percentageThreshold || null,
        specificApproverId || null
      ]
    );

    const ruleId = ruleResult.insertId;

    // Add approval steps for sequential or hybrid rules
    if ((ruleType === 'sequential' || ruleType === 'hybrid') && approvers && approvers.length > 0) {
      for (let i = 0; i < approvers.length; i++) {
        const approverId = approvers[i];
        
        // Verify approver exists and belongs to company
        const [approver] = await connection.query(
          'SELECT id FROM users WHERE id = ? AND company_id = ?',
          [approverId, companyId]
        );

        if (approver.length === 0) {
          await connection.rollback();
          return res.status(400).json({ error: `Invalid approver ID: ${approverId}` });
        }

        await connection.query(
          'INSERT INTO approval_steps (approval_rule_id, step_order, approver_id) VALUES (?, ?, ?)',
          [ruleId, i + 1, approverId]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Approval rule created successfully',
      ruleId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create approval rule error:', error);
    res.status(500).json({ error: 'Server error while creating approval rule' });
  } finally {
    connection.release();
  }
};

exports.getApprovalRules = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const [rules] = await db.query(
      `SELECT ar.*, 
              u.first_name as specific_approver_first_name, 
              u.last_name as specific_approver_last_name
       FROM approval_rules ar
       LEFT JOIN users u ON ar.specific_approver_id = u.id
       WHERE ar.company_id = ? AND ar.is_active = true
       ORDER BY ar.created_at DESC`,
      [companyId]
    );

    // Get approval steps for each rule
    for (let rule of rules) {
      const [steps] = await db.query(
        `SELECT ast.step_order, ast.approver_id, u.first_name, u.last_name, u.email
         FROM approval_steps ast
         JOIN users u ON ast.approver_id = u.id
         WHERE ast.approval_rule_id = ?
         ORDER BY ast.step_order`,
        [rule.id]
      );
      rule.approvalSteps = steps;
    }

    res.json({ rules });
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ error: 'Server error while fetching approval rules' });
  }
};

exports.updateApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const { isActive } = req.body;
    const companyId = req.user.company_id;

    // Verify rule belongs to company
    const [rule] = await db.query(
      'SELECT id FROM approval_rules WHERE id = ? AND company_id = ?',
      [ruleId, companyId]
    );

    if (rule.length === 0) {
      return res.status(404).json({ error: 'Approval rule not found' });
    }

    if (typeof isActive === 'boolean') {
      await db.query(
        'UPDATE approval_rules SET is_active = ? WHERE id = ?',
        [isActive, ruleId]
      );
    }

    res.json({ message: 'Approval rule updated successfully' });
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({ error: 'Server error while updating approval rule' });
  }
};