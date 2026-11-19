import mongoose from 'mongoose';
import { mkdir } from 'node:fs/promises';
import { app } from './app.js';
import { mongoUri, uploadDir } from './config.js';
import Photo from './models/Photo.js';
import { finishDeletion } from './controllers/photoController.js';

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  await mkdir(uploadDir, { recursive: true });
  for await (const photo of Photo.find({ deleting: true }).cursor()) await finishDeletion(photo);
  const port = Number(process.env.PORT || 4000);
  const server = app.listen(port, () => console.log('Alzikrayat is listening on port ' + port));
  const stop = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
} catch (err) {
  console.error('Startup failed. Check MongoDB, the upload directory and server/.env.', err.name);
  process.exit(1);
}
