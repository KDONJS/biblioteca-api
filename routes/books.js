const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rutas para libros
router.get('/', auth, bookController.getBooks);
router.post('/', auth, upload.single('file'), bookController.addBook);
router.put('/:id', auth, upload.single('file'), bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);

// Ruta para obtener información del libro con comentarios y contabilizar visualizaciones
router.get('/:id/details', auth, bookController.getBookWithComments);

// Rutas para comentarios
router.post('/:id/comments', auth, bookController.addComment);
router.get('/:id/comments', auth, bookController.getComments);
router.put('/:id/comments/:commentId', auth, bookController.updateComment);
router.delete('/:id/comments/:commentId', auth, bookController.deleteComment);

module.exports = router;