# Alzikrayat — MERN Edition

Alzikrayat is a shared photo journal. Visitors can browse a gallery in grid or list view and read the story and comments behind each photograph. Registered users can upload images, comment on any photo, and delete their own uploads.

## Run locally

Install **Node.js 22.12 or later** with npm. Start a local MongoDB service, or obtain a MongoDB Atlas connection string for a database you control. Run the commands below from the project folder containing this README.

1. Run `npm ci` to install the client and server dependencies from the lockfile.
2. Copy `server/.env.example` to `server/.env`. On Windows PowerShell run `Copy-Item server/.env.example server/.env`. On macOS or Linux run `cp server/.env.example server/.env`.
3. For local MongoDB, the example uses `mongodb://127.0.0.1:27017/alzikrayat`. For Atlas, set `MONGODB_URI` in your copy to your database URI, including the database name. The database user needs read/write access, and the cluster must accept connections from your machine.
4. Optionally run `npm run seed` for four Sudan-inspired sample images. The seed uses stable filenames and can be run again without duplicating records. The sample pictures are AI-generated illustrations of the locations and objects. Register your own account to contribute.
5. Run `npm run dev`. Open **http://localhost:5173** or the Local address Vite prints. Press Ctrl+C to stop both processes.

Use `npm run dev:client` and `npm run dev:server` in separate terminals to see each process's logs. The client proxies `/api` and `/uploads` to Express.

| Server setting | Purpose |
| --- | --- |
| `MONGODB_URI` | Database connection. Defaults to the local URI above. |
| `PORT` | Express port. Defaults to 4000. The development proxy reads the same setting. |
| `UPLOAD_DIR` | Optional absolute directory for stored image files. Defaults to `server/uploads`. |
| `NODE_ENV` | Set to `production` behind HTTPS to enable secure session cookies. Leave unset for local HTTP. |
| `TEST_MONGODB_URI` | Optional MongoDB connection for automated tests. Defaults to local port 27017. The test creates a uniquely named temporary database. |

If startup reports a MongoDB error, confirm the service is running and the URI is correct. If the API works but photos return 404, check that the server and seed use the same upload directory.

## Project structure

| Location | Responsibility |
| --- | --- |
| `client/src/pages/` | Home, Gallery, PhotoDetail, LoginRegister, Upload |
| `client/src/components/` | Navigation, photo cards, comment form, feedback and icons |
| `client/src/api.js` | Fetch wrapper and cancellable loading/error state |
| `server/routes/` | Express resource routes and middleware order |
| `server/controllers/` | Authentication, ownership checks, upload and comment handling |
| `server/middleware/` | Joi input validation, session lookup, HTTP errors |
| `server/models/` | Mongoose schemas for users, photos, comments and expiring sessions |
| `server/uploads/` | Runtime image files, excluded from Git |
| `server/test/` | Integration test against real MongoDB |

React Router handles client navigation. Selecting a photo loads its ID from the route and fetches its metadata, photographer and comments. Posting a comment appends the server's response to React state so the detail view updates immediately.

## REST API

Write requests use the header `X-Alzikrayat-Request: 1`. Auth and comment endpoints receive JSON. The upload endpoint accepts multipart form data. The browser sends the session cookie automatically on same-origin requests.

| Method and route | Input or behavior | Success |
| --- | --- | --- |
| POST `/api/auth/register` | Required firstName, lastName, email, password. Optional location, occupation, description. Creates an account and session. | 201, public profile |
| POST `/api/auth/login` | email, password | 200, public profile and session cookie |
| GET `/api/auth/me` | Restore the current user's profile after a reload | 200, public profile |
| POST `/api/auth/logout` | End the current session | 204 |
| GET `/api/photos` | Gallery, newest first | 200, photo array |
| POST `/api/photos` | Multipart fields photo (file), title, optional description. Login required. | 201, photo and Location header |
| GET `/api/photos/:id` | Photo metadata, photographer and chronological comments | 200, photo with comments |
| POST `/api/photos/:id/comments` | comment. Login required. | 201, saved comment and author |
| DELETE `/api/photos/:id` | Owner only. Removes image, metadata and related comments. | 204 |

Validation errors return 400. An expired or missing session returns 401. An ownership failure returns 403. A missing photo returns 404, a duplicate registration returns 409, and an oversized file returns 413. JSON errors have an `error` message.

Passwords use bcrypt hashing with a work factor of 12. The client holds the public profile in React state. The server stores a digest of each random session token with a seven-day expiry, checks expiry on each authenticated request and derives ownership from the session. The session cookie is HTTP-only. Gallery and comment responses include the author's name and ID.

Multer limits uploads to 8 MB. Sharp decodes JPEG, PNG and WebP images, applies orientation, removes metadata and writes a JPEG up to 3200 pixels on its longest side. MongoDB holds the filename and metadata. A deletion marker lets the server resume interrupted file and comment cleanup on restart.

## Demonstrate the project

1. Open Gallery as a visitor. Switch between grid and list, search for a photo, then open its detail page.
2. Select Share a photo while signed out. Register, upload a photograph, and add a caption. The toolbar greets you by first name and the app opens your new photo.
3. Open a private browser window, register a second account, and comment on the first account's photo. The new comment appears immediately. The second account has no delete control.
4. Refresh the first window to see the second account's comment. Delete your photo and confirm. Verify that it disappears from the gallery.
5. Log out. The toolbar returns to Please Login.

Run `npm test` with MongoDB running to repeat the two-account API workflow. The test checks password hashing, login/logout, input errors, file persistence, owner-only deletion, and removal of related comments. It removes its temporary database and upload directory when finished.

## Production build and submission

Run `npm run build`, then `npm start`. Express serves the compiled React app, API and uploaded files together at **http://localhost:4000** by default. For a hosted deployment, use a Node host with a persistent volume for `UPLOAD_DIR`, a reachable MongoDB instance and HTTPS. The client URL is the service origin and the photo API is available at `/api/photos`.

The ZIP includes the Git repository and its implementation history. To publish it for submission, create an empty GitHub repository in your account. In the extracted project, run the following with your own repository URL.

```sh
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git push -u origin main
```

Submit the resulting GitHub URL. Include live URLs if you deploy the app. The repository ignores local environment files, dependencies, build output and uploaded images.
