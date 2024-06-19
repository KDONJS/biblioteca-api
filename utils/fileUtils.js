const path = require('path');

// Función para validar la ruta del archivo
function isValidPath(filePath) {
  const uploadsDir = path.resolve(__dirname, '../uploads');
  const resolvedPath = path.resolve(filePath);
  return resolvedPath.startsWith(uploadsDir);
}

module.exports = {
  isValidPath
};