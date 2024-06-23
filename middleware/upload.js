const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../config/firebase');

// Multer storage configuration to use Firebase Storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit the file size to 5MB
  fileFilter: (req, file, cb) => {
    // Accept any file type
    cb(null, true);
  }
});

// Function to upload file to Firebase Storage
const uploadToFirebase = async (file) => {
  const blob = bucket.file(uuidv4() + '-' + file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { upload, uploadToFirebase };