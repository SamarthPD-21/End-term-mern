import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.js';
import jwt from 'jsonwebtoken';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

import User from '../models/user.model.js';
import AdminAudit from '../models/adminAudit.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

test('admin flows: list users, promote, demote, audits', async () => {
  // create admin and normal user
  const admin = await User.create({ name: 'Admin', email: 'admin@test', password: 'x', isAdmin: true });
  const other = await User.create({ name: 'Other', email: 'other@test', password: 'x', isAdmin: false });

  const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET);

  // list users
  const listRes = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
  expect(listRes.status).toBe(200);
  expect(Array.isArray(listRes.body.users)).toBe(true);
  expect(listRes.body.users.length).toBe(2);

  // promote other
  const promoteRes = await request(app).post('/api/admin/make-admin').send({ email: other.email, reason: 'for tests' }).set('Authorization', `Bearer ${token}`);
  expect(promoteRes.status).toBe(200);
  const refreshed = await User.findOne({ email: other.email });
  expect(refreshed.isAdmin).toBe(true);

  // check audit entry
  const auditsAfterPromote = await AdminAudit.find({ targetEmail: other.email, action: 'promote' });
  expect(auditsAfterPromote.length).toBeGreaterThanOrEqual(1);

  // demote
  const demoteRes = await request(app).post('/api/admin/remove-admin').send({ email: other.email, reason: 'undo' }).set('Authorization', `Bearer ${token}`);
  expect(demoteRes.status).toBe(200);
  const refreshed2 = await User.findOne({ email: other.email });
  expect(refreshed2.isAdmin).toBe(false);

  const auditsAfterDemote = await AdminAudit.find({ targetEmail: other.email, action: 'demote' });
  expect(auditsAfterDemote.length).toBeGreaterThanOrEqual(1);

  // list audits endpoint
  const auditsList = await request(app).get('/api/admin/audits').set('Authorization', `Bearer ${token}`);
  expect(auditsList.status).toBe(200);
  expect(auditsList.body.items.length).toBeGreaterThanOrEqual(2);
});
