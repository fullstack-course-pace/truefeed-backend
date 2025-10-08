# TrueFeed Backend

Node.js / Express API server for TrueFeed. The backend follows a Layered Architecture (controllers, services, models) to keep business logic testable and decoupled from HTTP concerns.

Quick start

1. Install dependencies:

   npm install

2. Create an environment file `.env.local` with values such as:

   PORT=4000
   DATABASE_URL=mongodb://localhost:27017/truefeed
   JWT_SECRET=your_jwt_secret

3. Start the server (example):

   node src/server.js

Project structure (recommended)

```
src/
├── controllers/   # HTTP handlers (call services)
├── services/      # Business logic
├── models/        # Database schema/ORM models
├── routes/        # Route definitions
├── middleware/    # Auth, logging, CORS, etc.
├── config/        # DB connection and config
└── server.ts      # App entry point
```

Notes

- Keep controllers thin and test services independently.
- Add tests under `src/tests/` and use a test runner like Jest for unit/integration tests.
