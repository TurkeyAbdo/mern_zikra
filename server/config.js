import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const serverRoot = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(serverRoot, '.env'), quiet: true });
export const uploadDir = process.env.UPLOAD_DIR || path.join(serverRoot, 'uploads');
export const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alzikrayat';
export const production = process.env.NODE_ENV === 'production';
