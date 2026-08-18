# Field CRM Backend

This backend is the MySQL-backed API for the Field Sales CRM.

## Setup

1. Copy `.env.example` to `.env` and fill in your MySQL credentials.
2. Create the database and tables using `backend/schema.sql`.
3. Install dependencies:

```bash
npm install
```

4. Start the API:

```bash
npm run dev
```

## Environment

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=field_crm
CORS_ORIGIN=http://localhost:5173
```

## API

- `GET /api/businesses`
- `POST /api/businesses`
- `PUT /api/businesses`
- `DELETE /api/businesses/:id`
- `GET /api/visits`
- `POST /api/visits`
- `PUT /api/visits`
- `DELETE /api/visits/:id`
- `POST /api/ai-summary`

## Importing existing localStorage data

Use the shape exported by the frontend:

```json
{
  "businesses": [...],
  "visits": [...],
  "exportedAt": "2026-01-01T00:00:00.000Z"
}
```

Then map each record into the `businesses` and `visits` tables using the schema in `backend/schema.sql`.
