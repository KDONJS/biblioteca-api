const Book = require('../models/Book');

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.addBook = async (req, res) => {
  const { title, author, year, publisher, tags, categories } = req.body;
  const fileUrl = req.file.path;

  try {
    const newBook = new Book({
      title,
      author,
      year,
      publisher,
      tags,
      categories,
      fileUrl
    });

    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, year, publisher, tags, categories } = req.body;

  const updateFields = { title, author, year, publisher, tags, categories };

  if (req.file) {
    updateFields.fileUrl = req.file.path;
  }

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    book = await Book.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    res.json(book);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    await Book.findByIdAndDelete(id);

    res.json({ msg: 'Book removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};