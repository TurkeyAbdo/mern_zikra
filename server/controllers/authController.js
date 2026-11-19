import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { startSession, endSession } from '../middleware/session.js';
import { httpError } from '../middleware/errorHandler.js';

function profile(user) {
  const { _id, firstName, lastName, email, location, description, occupation } =
    user;
  return { _id, firstName, lastName, email, location, description, occupation };
}
export async function register(req, res) {
  const password = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({ ...req.body, password });
  await startSession(req, res, user._id);
  res.status(201).json(profile(user));
}
export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select(
    '+password',
  );
  if (
    !user ||
    Buffer.byteLength(req.body.password) > 72 ||
    !(await bcrypt.compare(req.body.password, user.password))
  ) {
    throw httpError(401, 'Email or password is incorrect.');
  }
  await startSession(req, res, user._id);
  res.json(profile(user));
}
export const me = (req, res) => res.json(profile(req.user));
export async function logout(req, res) {
  await endSession(req, res);
  res.sendStatus(204);
}
