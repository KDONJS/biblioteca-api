const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const upload = require('../middleware/upload');

router.get('/', bookController.getBooks);
router.post('/', upload, bookController.addBook);
router.put('/:id', upload, bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

// Rutas para comentarios
router.post('/:id/comments', bookController.addComment);
router.get('/:id/comments', bookController.getComments);
router.put('/:id/comments/:commentId', bookController.updateComment);
router.delete('/:id/comments/:commentId', bookController.deleteComment);

module.exports = router;