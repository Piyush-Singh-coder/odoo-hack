const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware.js');
const userController = require('../controllers/userController');

router.use(authenticate);

router.post('/', authorize('admin'), userController.createUser);
router.get('/', authorize('admin', 'manager'), userController.getAllUsers);
router.put('/:userId', authorize('admin'), userController.updateUser);
router.delete('/:userId', authorize('admin'), userController.deleteUser);

module.exports = router;