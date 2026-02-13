const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.signup);
router.post('/activate', authController.activateAccount);
router.post('/pre-register', authController.preRegisterUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
