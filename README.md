# GiLabs Mitra Sales Portal

Monorepo partner portal dengan:

- `apps/web`: Next.js App Router, React Query, Zustand, Zod, React Hook Form, Tailwind CSS v4.
- `apps/api`: Go Gin API, JWT auth, SQLite local storage, standardized response/error handling.

## Menjalankan Lokal

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
npm install
npm run dev:api
npm run dev:web
```

Demo credential:

- Admin: `admin@gilabs.local` / `admin12345`
- Mitra: `mitra@gilabs.local` / `mitra12345`

Jika binary `go` dari Snap bermasalah, jalankan API dengan path langsung:

```bash
cd apps/api
/snap/go/current/bin/go run ./cmd/server
```

## API Response

Semua endpoint mengembalikan envelope:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validasi gagal",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "details": "Field wajib diisi"
  }
}
```

Dashboard dan list admin memakai query agregat/JOIN, bukan loop request per lead atau per mitra.
