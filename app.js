const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csrf');
const { admin, bucket } = require('./config/firebase');
const rateLimit = require('./middleware/rateLimit'); // Importar el middleware de limitación de velocidad

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para seguridad
app.use(helmet());
app.disable('x-powered-by');

// Middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Configurar el middleware CSRF
const tokens = new csrf();
const csrfSecret = process.env.CSRF_SECRET;

app.use((req, res, next) => {
  if (req.method === 'GET') {
    const token = tokens.create(csrfSecret);
    res.cookie('csrf-token', token);
    res.locals.csrfToken = token;
  } else {
    const token = req.cookies['csrf-token'];
    try {
      tokens.verify(csrfSecret, token);
    } catch (e) {
      return res.status(403).send('Form tampered with.');
    }
  }
  next();
});

// Middleware para manejar errores CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).send('Form tampered with.');
  } else {
    next(err);
  }
});

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/books', rateLimit, require('./routes/books'));
app.use('/api/auth', rateLimit, require('./routes/auth'));

// Ruta para obtener el token CSRF
app.get('/form', (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));