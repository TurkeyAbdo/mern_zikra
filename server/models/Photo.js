import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  dateTime: { type: Date, default: Date.now, index: true },
  deleting: { type: Boolean, default: false, select: false },
});
export default mongoose.model('Photo', photoSchema);
