const path = require('path');

// Función para validar la ruta del archivo
function isValidPath(filePath) {
  const uploadsDir = path.resolve(__dirname, '../uploads');
  const resolvedPath = path.resolve(filePath);
  return resolvedPath.startsWith(uploadsDir);
}

// Función para sanitizar la ruta del archivo
function sanitizePath(filePath) {
  return path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
}

module.exports = {
  isValidPath,
  sanitizePath
};