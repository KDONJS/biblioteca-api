const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const checkRole = require('../middleware/auth').checkRole;

// Registro de usuario
router.post('/register', authController.register);

// Inicio de sesión de usuario
router.post('/login', authController.login);

// Cerrar sesión de usuario
router.post('/logout', auth, authController.logout);

// Obtener perfil de usuario
router.get('/profile', auth, authController.getProfile);

// Actualizar perfil de usuario (propio)
router.put('/profile', auth, upload.single('file'), authController.updateProfile);

// Actualizar perfil de otro usuario (solo admin)
router.put('/profile/:userId', auth, checkRole(['admin']), upload.single('file'), authController.updateUserProfile);

// Eliminar cuenta de usuario (solo admin)
router.delete('/profile/:userId', auth, checkRole(['admin']), authController.deleteAccount);

// Desactivar cuenta de usuario (propio)
router.post('/profile/deactivate', auth, authController.deactivateAccount);

// Activar cuenta de usuario (propio)
router.post('/profile/activate', auth, authController.activateAccount);

module.exports = router;