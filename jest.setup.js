const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/biblioteca_test', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});