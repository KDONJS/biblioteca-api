const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const helmet = require('helmet');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para seguridad
app.use(helmet());
app.disable('x-powered-by');

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/books', require('./routes/books'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));