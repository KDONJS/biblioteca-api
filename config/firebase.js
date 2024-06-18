const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Decodificar la clave de cuenta de servicio de base64
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };