import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { serverRoot, uploadDir } from './config.js';
import authRoutes from './routes/authRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { httpError, errorHandler } from './middleware/errorHandler.js';

export const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  // Cross-origin form submissions cannot set this header. The app uses a same-origin API.
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.get('X-Alzikrayat-Request') !== '1'
  ) {
    return next(
      httpError(403, 'Use the Alzikrayat client to send this request.'),
    );
  }
  next();
});
app.use(express.json({ limit: '32kb' }));
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes, commentRoutes);
app.use('/api', (req, res, next) =>
  next(httpError(404, 'API route not found.')),
);
app.use(
  '/uploads',
  express.static(uploadDir, { fallthrough: false, index: false }),
);
const dist = path.join(serverRoot, '../client/dist');
if (existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist));
  app.get('/{*rest}', (req, res) =>
    res.sendFile(path.join(dist, 'index.html')),
  );
}
app.use(errorHandler);
