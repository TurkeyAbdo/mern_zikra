import { createHash, randomBytes } from 'node:crypto';
import Session from '../models/Session.js';
import { production } from '../config.js';
import { httpError } from './errorHandler.js';

const cookieName = 'alzikrayat_session';
const lifetime = 7 * 24 * 60 * 60 * 1000;
const options = { httpOnly: true, sameSite: 'lax', secure: production, path: '/' };
const digest = token => createHash('sha256').update(token).digest('hex');

function currentKey(req) {
  const item = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='));
  const token = item?.slice(cookieName.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? digest(token) : null;
}
export async function startSession(req, res, userId) {
  const old = currentKey(req);
  if (old) await Session.deleteOne({ _id: old });
  const token = randomBytes(32).toString('hex');
  await Session.create({ _id: digest(token), userId, expiresAt: new Date(Date.now() + lifetime) });
  res.cookie(cookieName, token, { ...options, maxAge: lifetime });
}
export async function endSession(req, res) {
  const key = currentKey(req);
  if (key) await Session.deleteOne({ _id: key });
  res.clearCookie(cookieName, options);
}
export async function requireUser(req, res, next) {
  const key = currentKey(req);
  const session = key && await Session.findOne({ _id: key, expiresAt: { $gt: new Date() } }).populate('userId');
  if (!session?.userId) throw httpError(401, 'Please log in to continue.');
  req.user = session.userId;
  next();
}
