const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');
const { bucket } = require('../config/firebase');

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addBook = async (req, res) => {
  const { title, author, year, publisher, tags, categories } = req.body;
  const filePath = req.file.path;
  const fileName = req.file.filename;

  try {
    await bucket.upload(filePath, {
      destination: `uploads/${fileName}`,
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    const fileUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/uploads/${fileName}`;

    const newBook = new Book({
      title,
      author,
      year,
      publisher,
      tags,
      categories,
      files: [{ fileUrl }]
    });

    const book = await newBook.save();

    fs.unlinkSync(filePath);

    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, year, publisher, tags, categories } = req.body;

  const updateFields = { title, author, year, publisher, tags, categories };

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (req.file) {
      const filePath = req.file.path;
      const fileName = req.file.filename;

      // Subir el nuevo archivo
      await bucket.upload(filePath, {
        destination: `uploads/${fileName}`,
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });

      const fileUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/uploads/${fileName}`;
      
      // Marcar el archivo actual como eliminado
      book.files.forEach(file => file.isDeleted = true);

      // Añadir el nuevo archivo al historial
      book.files.unshift({ fileUrl });

      // Eliminar el archivo local
      fs.unlinkSync(filePath);
    }

    // Actualizar los campos del libro
    Object.assign(book, updateFields);

    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err.message);
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

    // Eliminar archivos del bucket de Firebase Storage
    for (let file of book.files) {
      const fileName = path.basename(file.fileUrl);
      await bucket.file(`uploads/${fileName}`).delete();
    }

    await Book.findByIdAndDelete(id);

    res.json({ msg: 'Book and files removed' });
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