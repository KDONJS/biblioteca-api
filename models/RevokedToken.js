const mongoose = require('mongoose');

const RevokedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' } // El token se eliminará automáticamente después de una hora
});

module.exports = mongoose.model('RevokedToken', RevokedTokenSchema);