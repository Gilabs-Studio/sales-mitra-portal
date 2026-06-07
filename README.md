# GiLabs Mitra Sales Portal

Monorepo partner portal dengan:

- `apps/web`: Next.js App Router, React Query, Zustand, Zod, React Hook Form, Tailwind CSS v4.
- `apps/api`: Go Gin API, JWT auth, SQLite local storage, standardized response/error handling.
- `apps/mobile`: Flutter mobile app dengan inbox lead partner/admin, chat WhatsApp-like, add lead, detail lead, dan knowledge center.

## Menjalankan Lokal

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
pnpm install
pnpm dev
```

Default auth dibuat oleh seeder dari env `ADMIN_USERNAME`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD` di `apps/api/.env`

Demo mitra opsional dibuat jika `DEMO_PARTNER_EMAIL` dan `DEMO_PARTNER_PASSWORD` tersedia di env

Jika binary `go` dari Snap bermasalah, jalankan API dengan path langsung:

```bash
cd apps/api
/snap/go/current/bin/go run ./cmd/server
```

Atau untuk workflow normal per package:

```bash
cd apps/api
pnpm dev
```

```bash
cd apps/web
pnpm dev
```

Mobile Flutter:

```bash
cd apps/mobile
cp .env.example .env
flutter run --dart-define-from-file=.env
```

Isi `API_BASE_URL` di `apps/mobile/.env`. Untuk Android emulator gunakan `10.0.2.2`, untuk desktop runner atau simulator lokal gunakan `localhost`, dan untuk device fisik gunakan alamat LAN mesin yang menjalankan API/proxy lokal.

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

## Menjalankan Dengan Docker

Semua akses browser masuk lewat `http://localhost:8089`.

```bash
docker compose up --build
```

Arsitektur container:

- `web`: Next.js, exposed ke host pada port `8089`
- `api`: Gin API, hanya dipakai internal network Compose
- `api_data`: volume untuk persist SQLite

Web memanggil API lewat path relatif `/api/v1`, lalu Next me-rewrite request itu ke service `api` di dalam Docker network.
