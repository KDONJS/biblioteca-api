const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csrf');
const path = require('path');
const rateLimit = require('./middleware/rateLimit');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configurar Express para que confíe en los proxies
app.set('trust proxy', 1);

// Conectar a la base de datos
connectDB();

// Middleware para seguridad
app.use(helmet());
app.disable('x-powered-by');

// Middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser());

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

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).send('Form tampered with.');
  } else {
    next(err);
  }
});

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const { upload } = require('./middleware/upload');
app.use('/api/books', rateLimit, require('./routes/books'));
app.use('/api/auth', rateLimit, require('./routes/auth'));

// Ruta para obtener el token CSRF
app.get('/form', (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

// Ruta de SSE
app.get('/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendStatus = () => {
    res.write(`data: ${JSON.stringify({ status: 'OK', message: 'Welcome to Biblioteca API SSE' })}\n\n`);
  };

  sendStatus();
  const intervalId = setInterval(sendStatus, 5000);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;