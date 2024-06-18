const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['admin', 'lector', 'escritor'], default: 'lector' } // Campo para el rol del usuario
});

module.exports = mongoose.model('User', UserSchema); 