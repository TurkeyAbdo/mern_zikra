import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { serverRoot, mongoUri, uploadDir } from './config.js';
import User from './models/User.js';
import Photo from './models/Photo.js';

const entries = [
  ['clay', 'Made of earth', 'Water jars catching the afternoon light in a quiet courtyard.'],
  ['meroe', 'First light at Meroë', 'The dunes turn copper as sunlight reaches the pyramid faces.'],
  ['coffee', 'Room for one more', 'A jebena and a few small cups, ready for the first pour.'],
  ['nile', 'Last sail on the Nile', 'A breeze fills the sail as the light fades along the riverbank.']
];
try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  await Promise.all([User.init(), Photo.init()]);
  await mkdir(uploadDir, { recursive: true });
  const archive = await User.findOneAndUpdate({ email: 'archive@alzikrayat.invalid' }, {
    $setOnInsert: { firstName: 'Alzikrayat', lastName: 'Archive', password: await bcrypt.hash(randomBytes(30).toString('hex'), 12) }
  }, { upsert: true, new: true, runValidators: true });
  for (const [index, [slug, title, description]] of entries.entries()) {
    const fileName = 'archive-' + slug + '.jpg';
    const source = path.join(serverRoot, slug === 'nile' ? '../client/public' : 'sample', slug + '.jpg');
    await copyFile(source, path.join(uploadDir, fileName));
    await Photo.updateOne({ fileName }, { $setOnInsert: {
      userId: archive._id, title, description, fileName,
      dateTime: new Date(Date.UTC(2026, 10, 12 - index, 16))
    } }, { upsert: true, runValidators: true });
  }
  console.log('Four sample memories are available in the gallery.');
} catch (err) {
  console.error('Seed failed:', err.name, '— check server/.env and your MongoDB service.');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
