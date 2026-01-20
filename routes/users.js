const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
router.get('/users', userController.getAllUsers);
router.get('/users/stats', userController.getUserStats);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.post('/users/seed-demo', userController.seedDemoData);

module.exports = router;
