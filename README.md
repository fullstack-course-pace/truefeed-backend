# TrueFeed Backend

Node.js / Express API server for TrueFeed. The backend follows a Layered Architecture (controllers, services, models) to keep business logic testable and decoupled from HTTP concerns.

Quick start

1. Install dependencies:

   npm install

2. Start the server (example):

   npm start

Project structure (recommended)

```
src/
├── controllers/   # HTTP handlers (call services)
├── services/      # Business logic
├── models/        # Database schema/ORM models
├── routes/        # Route definitions
├── middleware/    # Auth, logging, CORS, etc.
├── config/        # DB connection and config
└── server.js      # App entry point
```

Notes

- Keep controllers thin and test services independently.
- Add tests under `src/tests/` and use a test runner like Jest for unit/integration tests.

Routing notes

- The primary routing entrypoint is now `src/routes/api.js` which initializes
  and mounts versioned routes under `/api/v1/*`.
- Legacy route files have been archived under `src/routes/archived/legacy-2025-10-12/`.
  The original top-level route files were removed and the active routing entrypoint is `src/routes/api.js`.

## API Endpoints

The server exposes a small set of versioned API endpoints under `/api/v1`.
Below is a concise reference for the currently supported routes, their HTTP methods,
expected inputs, authentication requirements and typical responses.

Auth (public)

- POST /api/v1/auth/register

  - Description: Register a new user and start a session.
  - Body (application/json): { name?: string, email: string, password: string }
  - Responses:
    - 201: JSON user object (created). Session cookie is set.
    - 400: { error: "email and password are required" }
    - 409: { error: "User already exists" }
    - 500: { error: "Internal server error" }

- POST /api/v1/auth/login

  - Description: Authenticate and establish a session.
  - Body (application/json): { email: string, password: string }
  - Responses:
    - 200: { message: "Logged in" } and session cookie is set.
    - 400: { error: "email and password are required" }
    - 401: { error: "Invalid credentials" }
    - 500: { error: "Internal server error" }

- POST /api/v1/auth/logout
  - Description: Destroy the current session and clear the session cookie.
  - Responses:
    - 200: { message: "Logged out" }
    - 500: { error: "Could not log out" }

Profile (authenticated)

- GET /api/v1/profile
  - Description: Return the current authenticated user's public profile (reads session).
  - Auth: requires a valid session cookie (server-side session).
  - Responses:
    - 200: { user: { /_ user object without password _/ } }
    - 401: { error: "Not authenticated" }
    - 404: { error: "User not found" }
    - 500: { error: "Internal server error" }

Logs (admin-only)

All routes under `/api/v1/logs` are guarded by an admin middleware. The middleware
checks the session role and will reject non-admin requests.

- GET /api/v1/logs

  - Description: List available log files.
  - Auth: admin session required.
  - Responses:
    - 200: { logs: [ "YYYY-MM-DD.log", ... ] }
    - 401/403: when not authenticated or not an admin (handled by middleware)

- GET /api/v1/logs/:date

  - Description: Download log file for a given date. `:date` must be YYYY-MM-DD.
  - Params: date (string, required) — format: YYYY-MM-DD
  - Auth: admin session required.
  - Responses:
    - 200: file download attachment named `:date.log`
    - 400: { error: "date must be in YYYY-MM-DD format" }
    - 404: { error: "log not found" }
    - 500: on read/send failures

- GET /api/v1/logs/:date/stream?follow=1
  - Description: Stream the log contents to the client. When `?follow=1` the
    server keeps the connection open and streams appended lines in realtime.
  - Query: follow (optional) — values: `1` or `true` to enable follow mode.
  - Auth: admin session required.
  - Responses:
    - 200: text/plain stream of the log contents
    - 400: { error: "date must be in YYYY-MM-DD format" }
    - 404: { error: "log not found" }
    - 500: on read/watch failures

Notes & next steps

- The endpoints rely on server-side sessions (cookie named `connect.sid` by default). Make
  sure your client (browser or fetch client) sends cookies on requests (e.g., with fetch: { credentials: 'include' }).
- Consider adding an OpenAPI/Swagger spec and request/response examples for better integration.
- If you'd like, I can also add example curl commands or a Postman collection.
