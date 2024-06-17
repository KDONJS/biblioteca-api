const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const upload = require('../middleware/upload');

router.get('/', bookController.getBooks);
router.post('/', upload, bookController.addBook);
router.put('/:id', upload, bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router;