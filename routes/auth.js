const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Registro de usuario
router.post('/register', authController.register);

// Inicio de sesión de usuario
router.post('/login', authController.login);

// Cerrar sesión de usuario
router.post('/logout', auth, authController.logout);

// Obtener perfil de usuario
router.get('/profile', auth, authController.getProfile);

// Actualizar perfil de usuario
router.put('/profile', auth, upload.single('file'), authController.updateProfile);

module.exports = router;