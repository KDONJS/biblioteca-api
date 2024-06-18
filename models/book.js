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
  comments: [CommentSchema]
});

module.exports = mongoose.model('Book', BookSchema);
