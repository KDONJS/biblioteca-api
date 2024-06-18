const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken'); // Importar el modelo de tokens revocados

module.exports = async function(req, res, next) {
  // Leer el token del header
  const token = req.header('x-auth-token');

  // Revisar si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verificar token
  try {
    // Verificar si el token está revocado
    const revokedToken = await RevokedToken.findOne({ token });
    if (revokedToken) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};