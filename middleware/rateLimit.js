const rateLimit = require('express-rate-limit');

// Configuración de limitación de velocidad
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 solicitudes por ventana de tiempo
  message: 'Too many requests from this IP, please try again later.'
});

module.exports = limiter;