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