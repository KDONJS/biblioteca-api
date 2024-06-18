const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const checkRole = require('../middleware/auth').checkRole;

// Rutas para libros
router.get('/', auth, checkRole(['admin', 'lector', 'escritor']), bookController.getUserBooks);
router.get('/public', bookController.getPublicBooks);
router.post('/', auth, checkRole(['admin', 'escritor']), upload.single('file'), bookController.addBook);
router.put('/:id', auth, checkRole(['admin', 'escritor']), upload.single('file'), bookController.updateBook);
router.delete('/:id', auth, checkRole(['admin', 'escritor']), bookController.deleteBook);

// Ruta para obtener información del libro con comentarios y contabilizar visualizaciones
router.get('/:id/details', auth, checkRole(['admin', 'lector', 'escritor']), bookController.getBookWithComments);

// Rutas para comentarios
router.post('/:id/comments', auth, checkRole(['admin', 'lector', 'escritor']), bookController.addComment);
router.get('/:id/comments', auth, checkRole(['admin', 'lector', 'escritor']), bookController.getComments);
router.put('/:id/comments/:commentId', auth, checkRole(['admin', 'escritor']), bookController.updateComment);
router.delete('/:id/comments/:commentId', auth, checkRole(['admin', 'escritor']), bookController.deleteComment);

module.exports = router;