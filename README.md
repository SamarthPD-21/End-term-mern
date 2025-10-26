
# End-term MERN E‑commerce Project

This repository contains a full-stack MERN (MongoDB, Express, React/Next.js, Node.js) e‑commerce application for showcasing handcrafted and sustainable products (categories like copper, handicrafts, jewelry, leather, and sustainable goods). The project pairs a modern Next.js + TypeScript frontend with an Express API backend built using Mongoose, JWT authentication, and Cloudinary image uploads.

This README has been updated to match the current project configuration (scripts, env var names, and config behavior) discovered in the `server/` and `client/` packages.


# Admin Access
- Email: bestecom21@gmail.com
- Password: 123123123

## What changed (high level)

- Server package name: `spd-global-server` (see `server/package.json`).
- Server dev script uses `nodemon index.js` and tests run via Jest with an experimental vm flag.
- Server supports image uploads via Cloudinary and prefers a single `CLOUDINARY_URL` env var but falls back to separate `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` vars (see `server/config/cloudinary.js`).
- JWT signing uses `JWT_SECRET` (see `server/config/jwt.js`) and MongoDB connection expects `MONGODB_URI` (see `server/config/mongodb.js`).
- Frontend uses Next.js (v15+) with Turbopack in dev and contains TypeScript tooling and Tailwind dev deps.

## Key Features

- Category browsing, product listing and detail pages
- Product comments and basic rating functionality
- Cart, wishlist, and user profile pages (addresses, orders, settings)
- JWT authentication and role-based admin routes
- Cloudinary-backed image uploads (multer on server)
- Unit tests (Jest) and ESLint configuration

## Tech Stack

- Frontend: Next.js (v15+), React, Redux, TypeScript
- Backend: Node.js (ESM), Express 5, Mongoose
- Database: MongoDB (connects via `MONGODB_URI`)
- Images: Cloudinary
- Payments (dev deps present): Stripe and Razorpay packages are included in `server/package.json`

## Repo layout (top-level)

```
End-term/
  client/         # Next.js frontend (TypeScript)
  server/         # Express API (Node.js, ESM)
  README.md
  .gitignore
```

## Environment Variables (server)

Create a `.env` at `server/.env` with at least the following values used by the code:

- MONGODB_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret
- PORT=5000 (optional)

Cloudinary (preferred single URL):

- CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

or (fallback) set:

- CLOUDINARY_CLOUD_NAME=
- CLOUDINARY_API_KEY=
- CLOUDINARY_API_SECRET=

Client env (optional, typically `client/.env.local`):

- NEXT_PUBLIC_API_URL=http://localhost:5000/api

Note: The server explicitly looks for `CLOUDINARY_URL` first and will log a message describing which method it used.

## Install & Run (PowerShell)

Install dependencies and start both apps in separate terminals. From the project root:

```powershell
# Server
cd .\server
npm install
npm run dev

# In a separate terminal: Client
cd .\client
npm install
npm run dev
```

Important scripts found in the repo:

- Server (`server/package.json`)
  - `dev`: `nodemon index.js`
  - `start`: `node index.js`
  - `test`: runs Jest via node with `--experimental-vm-modules`
- Client (`client/package.json`)
  - `dev`: `next dev --turbopack`
  - `build`: `next build`
  - `start`: `next start`
  - `test`: `jest --passWithNoTests`

If the dev server fails to connect to MongoDB, verify `MONGODB_URI`. If Cloudinary logs a warning about missing vars, either provide `CLOUDINARY_URL` or the three separate vars.

## Testing & Linting

- Run server tests (from `server/`):

```powershell
cd .\server
npm test
```

- Run client tests / lint (from `client/`):

```powershell
cd .\client
npm test
npm run lint
```

## API Overview (common endpoints)

The backend exposes RESTful routes organized with `express.Router()` and controllers. Example endpoints (check `server/routes/` for complete list):

- `POST /api/auth/register` — register a user
- `POST /api/auth/login` — login and receive JWT
- `GET /api/products` — list products (supports query filters and pagination)
- `GET /api/products/:id` — single product details
- `POST /api/products` — (admin) create product
- `PUT /api/products/:id` — (admin) update product
- `DELETE /api/products/:id` — (admin) delete product

The server returns consistent JSON responses and appropriate HTTP status codes (2xx for success, 4xx for client errors, 5xx for server errors).

## Troubleshooting tips

- If the server fails to start: check `MONGODB_URI` and `JWT_SECRET` and ensure MongoDB is reachable.
- If images won't upload: confirm Cloudinary env vars and check the `server/config/cloudinary.js` file.
- Common runtime issues: missing `await` in async controllers, double `res.send()` calls, or incorrect model imports — search server logs to find exact stack traces.

## Deployment suggestions

- Build the Next.js app for production (`npm run build` in `client/`) and serve via Vercel or host static assets on a CDN.
- Deploy the Express API to services like Render, Heroku, or Azure App Service. Use environment variables for secrets and MongoDB Atlas for a production database.
- Use CI (GitHub Actions) to run tests and linting on pushes/PRs.

## Next steps / Improvements

- Integrate a payment gateway (Stripe/PayPal)
- Add server-side caching and CDN for static assets
- Expand automated tests (integration tests for API)
- Harden validation and role-based authorization checks

## License & Contact

This project is provided as-is for academic purposes. For questions or collaboration, contact the project author (details in repo metadata).

---

Thank you for reviewing this project — it's structured to demonstrate core MERN concepts (Express routing, REST APIs, proper HTTP status codes, middleware, Mongoose modeling, request validation, and debugging) end-to-end.
