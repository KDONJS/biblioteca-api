const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const rateLimit = require('../middleware/rateLimit');

const checkRole = require('../middleware/auth').checkRole;

// Registro de usuario
router.post('/register', rateLimit, authController.register);

// Inicio de sesión de usuario
router.post('/login', rateLimit, authController.login);

// Cerrar sesión de usuario
router.post('/logout', auth, rateLimit, authController.logout);

// Obtener perfil de usuario
router.get('/profile', auth, rateLimit, authController.getProfile);

// Actualizar perfil de usuario (propio)
router.put('/profile', auth, rateLimit, upload.single('file'), authController.updateProfile);

// Actualizar perfil de otro usuario (solo admin)
router.put('/profile/:userId', auth, checkRole(['admin']), rateLimit, upload.single('file'), authController.updateUserProfile);

// Eliminar cuenta de usuario (solo admin)
router.delete('/profile/:userId', auth, checkRole(['admin']), rateLimit, authController.deleteAccount);

// Desactivar cuenta de usuario (propio)
router.post('/profile/deactivate', auth, rateLimit, authController.deactivateAccount);

// Activar cuenta de usuario (propio)
router.post('/profile/activate', auth, rateLimit, authController.activateAccount);

module.exports = router;