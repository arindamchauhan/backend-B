# Order Invoice Backend

Express backend for generating PDF invoices with jsPDF, storing them in MongoDB Atlas, and returning a public invoice URL for the frontend to use with EmailJS.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
PORT=5000
MONGODB_URI=
PUBLIC_BASE_URL=
```

3. Start the server:

```bash
npm start
```

## Notes

- The backend stores invoice PDFs directly in MongoDB Atlas.
- `PUBLIC_BASE_URL` should be the public URL of this backend, for example `https://your-backend.example.com`.
- If `PUBLIC_BASE_URL` is not set, the API falls back to a relative invoice URL.

## API

### POST /api/order

Example request:

```json
{
  "id": "12345",
  "name": "John Doe",
  "email": "john@example.com",
  "items": [
    { "name": "Product A", "quantity": 1, "price": 499 },
    { "name": "Product B", "quantity": 1, "price": 500 }
  ],
  "total": 999,
  "date": "2026-05-05T10:00:00.000Z"
}
```

Response:

```json
{
  "success": true,
  "invoiceUrl": "https://..."
}
```
