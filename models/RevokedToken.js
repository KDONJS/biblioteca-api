const mongoose = require('mongoose');

const RevokedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  revokedAt: { type: Date, default: Date.now, expires: '1h' }
});

module.exports = mongoose.model('RevokedToken', RevokedTokenSchema);