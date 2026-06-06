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
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8089/api/v1
```

Default `API_BASE_URL` sudah memakai `http://10.0.2.2:8089/api/v1`, cocok untuk Android emulator saat Docker/web proxy berjalan di host. Untuk iOS simulator atau device fisik, isi URL sesuai host yang bisa dijangkau device.

## Validasi

```bash
flutter analyze
flutter test
```
