# GiLabs Mobile

Flutter app untuk mengelola lead partner/admin dari Mitra Sales Portal.

Fitur utama:

- Inbox lead ala WhatsApp mobile.
- Chat lead partner/admin dengan bubble pesan dan refresh manual.
- Tombol `+` untuk submit lead baru bagi role partner.
- Detail lead berisi kontak, kebutuhan, status, jadwal meeting, dan timeline.
- Update status lead untuk role admin.
- Knowledge center dan AI chatbot mitra.

## Menjalankan

```bash
cp .env.example .env
flutter run --dart-define-from-file=.env
```

Contoh `.env.example`:

```json
{
  "API_BASE_URL": "http://localhost:8089/api/v1"
}
```

Gunakan `10.0.2.2` untuk Android emulator, `localhost` untuk desktop runner atau simulator lokal, dan alamat LAN host untuk device fisik.

## Validasi

```bash
flutter analyze
flutter test
```
