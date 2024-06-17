const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const upload = require('../middleware/upload');

router.get('/', bookController.getBooks);
router.post('/', upload, bookController.addBook);

module.exports = router;