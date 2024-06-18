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

// Eliminar cuenta de usuario
router.delete('/profile', auth, authController.deleteAccount);

// Desactivar cuenta de usuario
router.post('/profile/deactivate', auth, authController.deactivateAccount);

// Activar cuenta de usuario
router.post('/profile/activate', auth, authController.activateAccount);

module.exports = router;