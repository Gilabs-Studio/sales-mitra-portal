# GiLabs Mitra Portal Web

Frontend Next.js App Router untuk partner portal GiLabs.

```bash
npm install
npm run dev
```

Default API URL:

```text
NEXT_PUBLIC_API_URL=/api/v1
API_INTERNAL_URL=http://localhost:8080
```

`NEXT_PUBLIC_API_URL` dipakai di browser. Jika nilainya `/api/v1`, request browser tetap terlihat menuju domain frontend lalu diteruskan oleh rewrite Next.js.

`API_INTERNAL_URL` dipakai oleh Next.js server sebagai tujuan rewrite untuk `/api/*` dan `/uploads/*`.
