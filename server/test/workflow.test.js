import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

test('two accounts share a photo, comment and enforce ownership', async (t) => {
  const uploads = await mkdtemp(path.join(tmpdir(), 'alzikrayat-test-'));
  process.env.UPLOAD_DIR = uploads;
  const { app } = await import('../app.js');
  const { default: User } = await import('../models/User.js');
  const { default: Comment } = await import('../models/Comment.js');
  const { default: Photo } = await import('../models/Photo.js');
  const dbName = 'alzikrayat_test_' + randomUUID().replaceAll('-', '');
  let server;
  t.after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.name === dbName)
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await rm(uploads, { force: true, recursive: true });
  });
  const uri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.init()),
  );
  server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  async function request(route, method = 'GET', body, cookie) {
    const headers = { 'X-Alzikrayat-Request': '1' };
    if (cookie) headers.Cookie = cookie;
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    return fetch(base + route, { method, headers, body });
  }
  const profile = {
    firstName: 'Mona',
    lastName: 'Ali',
    email: 'mona@example.org',
    password: 'sample-pass-2026',
  };
  const login = { email: profile.email, password: profile.password };
  const cookieOf = (response) =>
    response.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/auth/register', 'POST', {})).status, 400);
  const registered = await request('/api/auth/register', 'POST', profile);
  assert.equal(registered.status, 201);
  assert.equal((await registered.json()).password, undefined);
  assert.match(registered.headers.get('set-cookie'), /HttpOnly/i);
  const stored = await User.findOne({ email: profile.email }).select(
    '+password',
  );
  assert.equal(await bcrypt.compare(profile.password, stored.password), true);
  assert.equal(
    (await request('/api/auth/register', 'POST', profile)).status,
    409,
  );
  assert.equal(
    (
      await request('/api/auth/login', 'POST', {
        ...login,
        password: 'different',
      })
    ).status,
    401,
  );
  const signedIn = await request('/api/auth/login', 'POST', login);
  assert.equal(signedIn.status, 200);
  const owner = cookieOf(signedIn);
  assert.equal(
    (await (await request('/api/auth/me', 'GET', undefined, owner)).json())
      .firstName,
    'Mona',
  );
  const guest = cookieOf(
    await request('/api/auth/register', 'POST', {
      ...profile,
      firstName: 'Amir',
      email: 'amir@example.org',
    }),
  );
  assert.equal((await request('/api/photos', 'POST')).status, 401);
  const data = await readFile(new URL('../sample/clay.jpg', import.meta.url));
  function form(bytes, title = 'Courtyard') {
    const values = new FormData();
    values.set(
      'photo',
      new Blob([bytes], { type: 'image/jpeg' }),
      'memory.jpg',
    );
    values.set('title', title);
    values.set('description', 'Evening light');
    return values;
  }
  assert.equal(
    (await request('/api/photos', 'POST', form('bad image'), owner)).status,
    400,
  );
  assert.equal(
    (await request('/api/photos', 'POST', form(data, '   '), owner)).status,
    400,
  );
  const created = await request('/api/photos', 'POST', form(data), owner);
  assert.equal(created.status, 201);
  const photo = await created.json();
  const photoPath = '/api/photos/' + photo._id;
  assert.equal(created.headers.get('location'), photoPath);
  const asset = '/uploads/' + photo.fileName;
  assert.ok((await stat(path.join(uploads, photo.fileName))).size > 0);
  assert.equal((await request(asset)).status, 200);
  const gallery = await (await request('/api/photos')).json();
  assert.deepEqual(
    gallery.map((p) => p._id),
    [photo._id],
  );
  assert.equal(gallery[0].userId.email, undefined);
  assert.equal(
    (await request(photoPath, 'DELETE', undefined, guest)).status,
    403,
  );
  assert.equal(
    (await request(photoPath + '/comments', 'POST', { comment: 'hello' }))
      .status,
    401,
  );
  assert.equal(
    (await request(photoPath + '/comments', 'POST', { comment: ' ' }, guest))
      .status,
    400,
  );
  const comment = await request(
    photoPath + '/comments',
    'POST',
    { comment: 'Beautiful light.' },
    guest,
  );
  assert.equal(comment.status, 201);
  assert.equal((await comment.json()).userId.firstName, 'Amir');
  const detail = await (await request(photoPath)).json();
  assert.equal(detail.comments[0].comment, 'Beautiful light.');
  assert.ok(Date.parse(detail.comments[0].dateTime));
  assert.equal(
    (await request(photoPath, 'DELETE', undefined, owner)).status,
    204,
  );
  assert.equal((await request(asset)).status, 404);
  assert.equal((await request(photoPath)).status, 404);
  assert.equal(await Photo.countDocuments(), 0);
  assert.equal(await Comment.countDocuments(), 0);
  assert.equal((await request('/api/photos/not-an-id')).status, 400);
  assert.equal(
    (await request('/api/auth/logout', 'POST', undefined, owner)).status,
    204,
  );
  assert.equal(
    (await request('/api/auth/me', 'GET', undefined, owner)).status,
    401,
  );
});
