import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import Product from '../models/product.model.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Product.deleteMany({});
});

describe('Product comments API', () => {
  test('GET comments returns empty for new product', async () => {
    const p = await Product.create({ name: 'T', description: 'd', image: '/img', price: 10, category: 'c', quantity: 5 });
    const res = await request(app).get(`/api/products/${p._id}/comments`);
    expect(res.status).toBe(200);
    expect(res.body.comments).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  test('POST comment requires auth (401) when no token', async () => {
    const p = await Product.create({ name: 'T', description: 'd', image: '/img', price: 10, category: 'c', quantity: 5 });
    const res = await request(app).post(`/api/products/${p._id}/comments`).send({ rating: 5, text: 'Nice' });
    expect(res.status).toBe(401);
  });

  // We can stub auth middleware by signing a token with known secret
  test('POST comment works with auth and then GET returns it', async () => {
    // create a product
    const p = await Product.create({ name: 'T', description: 'd', image: '/img', price: 10, category: 'c', quantity: 5 });
    // create a fake JWT using same secret
    const jwt = (await import('jsonwebtoken')).default;
    const payload = { id: 'user1', name: 'Tester', email: 't@example.com' };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'testsecret');

    const post = await request(app)
      .post(`/api/products/${p._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, text: 'Good' });

    expect([200,201]).toContain(post.status);
    const get = await request(app).get(`/api/products/${p._id}/comments`);
    expect(get.status).toBe(200);
    expect(get.body.total).toBe(1);
    expect(get.body.comments[0].text).toBe('Good');
  });
});
