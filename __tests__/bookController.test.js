const request = require('supertest');
const app = require('../app'); // Asegúrate de que esto apunta al archivo principal de configuración de express
const User = require('../models/User');
const Book = require('../models/Book');
const mongoose = require('mongoose');

describe('Book Controller', () => {
  let token;

  beforeEach(async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: 'writer'
      });

    token = userRes.body.token;
  });

  it('should add a new book', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('x-auth-token', token)
      .field('title', 'Test Book')
      .field('author', 'Test Author')
      .field('year', 2021)
      .field('publisher', 'Test Publisher')
      .field('tags', 'test')
      .field('categories', 'test')
      .field('isPublic', true)
      .attach('file', '__tests__/testfile.pdf'); // Asegúrate de tener un archivo de prueba en esta ruta

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Test Book');
  });

  it('should get all public books', async () => {
    await request(app)
      .post('/api/books')
      .set('x-auth-token', token)
      .field('title', 'Test Book')
      .field('author', 'Test Author')
      .field('year', 2021)
      .field('publisher', 'Test Publisher')
      .field('tags', 'test')
      .field('categories', 'test')
      .field('isPublic', true)
      .attach('file', '__tests__/testfile.pdf'); // Asegúrate de tener un archivo de prueba en esta ruta

    const res = await request(app)
      .get('/api/books/public');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a book', async () => {
    const addRes = await request(app)
      .post('/api/books')
      .set('x-auth-token', token)
      .field('title', 'Test Book')
      .field('author', 'Test Author')
      .field('year', 2021)
      .field('publisher', 'Test Publisher')
      .field('tags', 'test')
      .field('categories', 'test')
      .field('isPublic', true)
      .attach('file', '__tests__/testfile.pdf'); // Asegúrate de tener un archivo de prueba en esta ruta

    const bookId = addRes.body._id;

    const updateRes = await request(app)
      .put(`/api/books/${bookId}`)
      .set('x-auth-token', token)
      .send({
        title: 'Updated Test Book',
        author: 'Updated Test Author'
      });

    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body).toHaveProperty('title', 'Updated Test Book');
  });

  it('should delete a book', async () => {
    const addRes = await request(app)
      .post('/api/books')
      .set('x-auth-token', token)
      .field('title', 'Test Book')
      .field('author', 'Test Author')
      .field('year', 2021)
      .field('publisher', 'Test Publisher')
      .field('tags', 'test')
      .field('categories', 'test')
      .field('isPublic', true)
      .attach('file', '__tests__/testfile.pdf'); // Asegúrate de tener un archivo de prueba en esta ruta

    const bookId = addRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/books/${bookId}`)
      .set('x-auth-token', token);

    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body).toHaveProperty('msg', 'Book and files removed');
  });
});