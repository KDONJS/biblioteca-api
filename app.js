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

app.set('trust proxy', 1);

connectDB();

app.use(helmet());
app.disable('x-powered-by');

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { upload } = require('./middleware/upload');
app.use('/api/books', rateLimit, require('./routes/books'));
app.use('/api/auth', rateLimit, require('./routes/auth'));

app.get('/form', (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

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

// Servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Monitor de solicitudes
const requests = [];

app.use((req, res, next) => {
  const requestDetails = {
    method: req.method,
    url: req.url,
    time: new Date()
  };
  requests.push(requestDetails);
  if (requests.length > 10) requests.shift(); // Mantener solo las últimas 10 solicitudes
  next();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
