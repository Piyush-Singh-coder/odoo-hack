const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware.js');
const approvalController = require('../controllers/approvalController');

router.use(authenticate);

router.post('/rules', authorize('admin'), approvalController.createApprovalRule);
router.get('/rules', authorize('admin', 'manager'), approvalController.getApprovalRules);
router.put('/rules/:ruleId', authorize('admin'), approvalController.updateApprovalRule);

module.exports = router;