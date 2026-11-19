import Comment from '../models/Comment.js';
import Photo from '../models/Photo.js';
import { active, authorFields } from './photoController.js';
import { httpError } from '../middleware/errorHandler.js';

export async function create(req, res) {
  const photoId = req.params.id;
  const query = { _id: photoId, ...active };
  if (!(await Photo.exists(query))) throw httpError(404, 'This photo could not be found.');
  const comment = await Comment.create({ photoId, userId: req.user._id, comment: req.body.comment });
  // A concurrent delete may have started after the initial lookup.
  if (!(await Photo.exists(query))) {
    await comment.deleteOne();
    throw httpError(404, 'This photo has been removed.');
  }
  await comment.populate('userId', authorFields);
  res.status(201).json(comment);
}
