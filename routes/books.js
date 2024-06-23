const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const rateLimit = require('../middleware/rateLimit');

const checkRole = require('../middleware/auth').checkRole;

router.get('/', auth, checkRole(['admin', 'lector', 'escritor']), rateLimit, bookController.getUserBooks);
router.get('/public', rateLimit, bookController.getPublicBooks);
router.post('/', auth, checkRole(['admin', 'escritor']), rateLimit, upload.single('file'), bookController.addBook);
router.put('/:id', auth, checkRole(['admin', 'escritor']), rateLimit, upload.single('file'), bookController.updateBook);
router.delete('/:id', auth, checkRole(['admin', 'escritor']), rateLimit, bookController.deleteBook);

router.get('/:id/details', auth, checkRole(['admin', 'lector', 'escritor']), rateLimit, bookController.getBookWithComments);

router.post('/:id/comments', auth, checkRole(['admin', 'lector', 'escritor']), rateLimit, bookController.addComment);
router.get('/:id/comments', auth, checkRole(['admin', 'lector', 'escritor']), rateLimit, bookController.getComments);
router.put('/:id/comments/:commentId', auth, checkRole(['admin', 'escritor']), rateLimit, bookController.updateComment);
router.delete('/:id/comments/:commentId', auth, checkRole(['admin', 'escritor']), rateLimit, bookController.deleteComment);

module.exports = router;