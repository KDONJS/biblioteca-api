const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const rateLimit = require('../middleware/rateLimit');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload'); // Asegúrate de que esto está correcto

const checkRole = require('../middleware/auth').checkRole;

// Registro de usuario
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').not().isEmpty()
  ],
  rateLimit,
  authController.register
);

// Inicio de sesión de usuario
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  rateLimit,
  authController.login
);

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