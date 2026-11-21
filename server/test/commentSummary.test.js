import { test } from 'node:test';
import assert from 'node:assert/strict';
import Comment from '../models/Comment.js';
import Photo from '../models/Photo.js';
import { summarize } from '../controllers/commentSummary.js';

test('photo summaries use stored comments, bound requests, and handle provider errors', async (t) => {
  const originalKey = process.env.OPENAI_API_KEY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  });
  const req = { params: { id: 'photo-A' }, user: { _id: 'reader-A' } };
  const res = {
    status(code) { this.code = code; return this; },
    json(body) { return body; },
  };
  t.mock.method(Photo, 'exists', async () => true);
  let rows = [];
  t.mock.method(Comment, 'find', (filter, projection) => {
    assert.deepEqual(filter, { photoId: 'photo-A' });
    assert.equal(projection, 'comment -_id');
    return {
      sort(order) { assert.deepEqual(order, { dateTime: -1, _id: -1 }); return this; },
      limit(count) { assert.equal(count, 20); return this; },
      async lean() { return [...rows]; },
    };
  });
  let upstreamStatus = 200;
  const provider = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const body = JSON.parse(options.body);
    assert.deepEqual(JSON.parse(body.input), ['Evening light', 'Love the shadows']);
    assert.equal(body.store, false);
    return Response.json({
      status: 'completed',
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'Readers discuss light and shadow.' }] }],
    }, { status: upstreamStatus });
  });
  await assert.rejects(summarize(req, res), { status: 422 });
  rows = [{ comment: 'Love the shadows' }, { comment: 'Evening light' }];
  delete process.env.OPENAI_API_KEY;
  await summarize(req, res);
  assert.equal(res.code, 503);
  assert.equal(provider.mock.callCount(), 0);
  process.env.OPENAI_API_KEY = 'test-only';
  assert.deepEqual(await summarize(req, res), {
    summary: 'Readers discuss light and shadow.', commentCount: 2,
  });
  await assert.rejects(summarize(req, res), { status: 429 });
  assert.equal(provider.mock.callCount(), 1);
  req.user._id = 'reader-B';
  upstreamStatus = 429;
  await summarize(req, res);
  assert.equal(res.code, 429);
  req.user._id = 'reader-C';
  upstreamStatus = 500;
  await summarize(req, res);
  assert.equal(res.code, 503);
});
