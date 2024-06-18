const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  publisher: { type: String, required: true },
  tags: [String],
  categories: [String],
  files: [FileSchema],
  comments: [CommentSchema],
  views: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Campo para almacenar el ID del usuario propietario
  isPublic: { type: Boolean, default: true } // Campo para determinar si el libro es público o privado
});

module.exports = mongoose.model('Book', BookSchema);