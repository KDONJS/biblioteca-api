const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');
const { bucket } = require('../config/firebase');

// Función para validar la ruta del archivo
function isValidPath(filePath) {
  const uploadsDir = path.resolve(__dirname, '../uploads');
  const resolvedPath = path.resolve(filePath);
  return resolvedPath.startsWith(uploadsDir);
}

// Obtener todos los libros públicos
exports.getPublicBooks = async (req, res) => {
  try {
    const books = await Book.find({ isPublic: true });
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Obtener todos los libros del usuario
exports.getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user.id });
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Añadir un nuevo libro
exports.addBook = async (req, res) => {
  const { title, author, year, publisher, tags, categories, isPublic } = req.body;
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
      files: [{ fileUrl }],
      user: req.user.id,
      isPublic: isPublic || true
    });

    const book = await newBook.save();

    if (isValidPath(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.error('Invalid file path detected:', filePath);
    }

    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Actualizar un libro
exports.updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, year, publisher, tags, categories, isPublic } = req.body;

  const updateFields = { title, author, year, publisher, tags, categories, isPublic };

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (book.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (req.file) {
      const filePath = req.file.path;
      const fileName = req.file.filename;

      await bucket.upload(filePath, {
        destination: `uploads/${fileName}`,
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });

      const fileUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/uploads/${fileName}`;

      book.files.forEach(file => file.isDeleted = true);

      book.files.unshift({ fileUrl });

      if (isValidPath(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.error('Invalid file path detected:', filePath);
      }
    }

    Object.assign(book, updateFields);

    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Eliminar un libro
exports.deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (book.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    for (let file of book.files) {
      const fileName = path.basename(file.fileUrl);
      const filePath = path.resolve(__dirname, '../uploads', fileName);
      await bucket.file(`uploads/${fileName}`).delete();

      if (isValidPath(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.error('Invalid file path detected:', filePath);
      }
    }

    await Book.findByIdAndDelete(id);

    res.json({ msg: 'Book and files removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Obtener información del libro con comentarios y contabilizar visualizaciones
exports.getBookWithComments = async (req, res) => {
  const { id } = req.params;

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (!book.isPublic && book.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    book.views += 1;
    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Añadir un comentario a un libro
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Obtener los comentarios de un libro
exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    let book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    res.json(book.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Actualizar un comentario
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Eliminar un comentario
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};