import { randomUUID } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import Photo from '../models/Photo.js';
import Comment from '../models/Comment.js';
import { uploadDir } from '../config.js';
import { httpError } from '../middleware/errorHandler.js';

export const active = { deleting: { $ne: true } };
export const authorFields = 'firstName lastName';
const missing = () => httpError(404, 'This photo could not be found.');

export async function getAll(req, res) {
  const photos = await Photo.find(active)
    .sort({ dateTime: -1, _id: -1 })
    .populate('userId', authorFields);
  res.json(photos);
}
export async function getOne(req, res) {
  const photo = await Photo.findOne({ _id: req.params.id, ...active }).populate(
    'userId',
    authorFields,
  );
  if (!photo) throw missing();
  const comments = await Comment.find({ photoId: photo._id })
    .sort({ dateTime: 1, _id: 1 })
    .populate('userId', authorFields);
  res.json({ ...photo.toObject(), comments });
}
export async function create(req, res) {
  if (!req.file) throw httpError(400, 'Choose an image to upload.');
  const image = sharp(req.file.buffer, {
    limitInputPixels: 40_000_000,
    failOn: 'warning',
  });
  let jpeg;
  try {
    const metadata = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format))
      throw new Error('format');
    jpeg = await image
      .rotate()
      .resize({
        width: 3200,
        height: 3200,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch {
    throw httpError(
      400,
      'Choose a valid JPEG, PNG, or WebP image up to 40 megapixels.',
    );
  }
  const fileName = randomUUID() + '.jpg';
  const destination = path.join(uploadDir, fileName);
  await writeFile(destination, jpeg, { flag: 'wx' });
  let photo;
  try {
    photo = await Photo.create({ ...req.body, fileName, userId: req.user._id });
  } catch (err) {
    await rm(destination, { force: true });
    throw err;
  }
  await photo.populate('userId', authorFields);
  res
    .location('/api/photos/' + photo.id)
    .status(201)
    .json(photo);
}

// The marker makes interrupted cascades resumable on standalone MongoDB.
export async function finishDeletion(photo) {
  await Comment.deleteMany({ photoId: photo._id });
  await rm(path.join(uploadDir, photo.fileName), { force: true });
  await Photo.deleteOne({ _id: photo._id, deleting: true });
}
export async function remove(req, res) {
  const photo = await Photo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { deleting: true },
    { new: true },
  );
  if (!photo) {
    if (await Photo.exists({ _id: req.params.id, ...active }))
      throw httpError(403, 'Only the photographer can delete this photo.');
    throw missing();
  }
  await finishDeletion(photo);
  res.sendStatus(204);
}
