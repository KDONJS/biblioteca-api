const fs = require('fs');
const path = require('path');
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

    const filePath = path.join(__dirname, '../', book.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Book.findByIdAndDelete(id);

    res.json({ msg: 'Book and file removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    const newComment = {
      text
    };

    book.comments.unshift(newComment);
    await book.save();

    res.json(book.comments);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    res.json(book.comments);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { text } = req.body;

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    const comment = book.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    comment.text = text;
    await book.save();

    res.json(book.comments);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    const comment = book.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    book.comments.pull(commentId);
    await book.save();

    res.json(book.comments);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};