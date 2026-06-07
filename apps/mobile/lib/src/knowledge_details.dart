import 'models.dart';

class KnowledgeDetailItem {
  const KnowledgeDetailItem({
    required this.title,
    this.summary,
    this.bullets = const [],
  });

  final String title;
  final String? summary;
  final List<String> bullets;
}

class KnowledgeDetailSection {
  const KnowledgeDetailSection({
    required this.title,
    this.summary,
    this.items = const [],
  });

  final String title;
  final String? summary;
  final List<KnowledgeDetailItem> items;
}

class KnowledgeDetail {
  const KnowledgeDetail({required this.overview, required this.sections});

  final String overview;
  final List<KnowledgeDetailSection> sections;
}

KnowledgeDetail? getKnowledgeDetail(KnowledgeArticle article) {
  switch (article.id) {
    case 'knw-salesview':
      return const KnowledgeDetail(
        overview:
            'SalesView bisa diposisikan sebagai suite modular yang dibicarakan sesuai kebutuhan operasional klien.',
        sections: [
          KnowledgeDetailSection(
            title: 'Modul SalesView',
            items: [
              KnowledgeDetailItem(
                title: 'POS',
                bullets: [
                  'Floor layout untuk mengatur tempat duduk dan area meja',
                  'Self order via QR di tiap meja agar pelanggan bisa scan dan memesan langsung',
                  'Cocok untuk restoran, cafe, dan outlet dengan dine-in',
                ],
              ),
              KnowledgeDetailItem(
                title: 'ERP',
                bullets: [
                  'Kontrol proses bisnis lintas divisi',
                  'Cocok untuk operasi dengan workflow dan approval rapi',
                ],
              ),
              KnowledgeDetailItem(
                title: 'CRM',
                bullets: [
                  'Kelola prospek, follow-up, pipeline, dan histori interaksi',
                  'Cocok untuk tim sales yang ingin tracking closing lebih disiplin',
                ],
              ),
              KnowledgeDetailItem(
                title: 'HR',
                bullets: [
                  'Data karyawan, absensi, dan administrasi SDM',
                  'Cocok untuk bisnis yang mulai butuh struktur HR digital',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Finance',
                bullets: [
                  'Pencatatan keuangan dan monitoring arus kas operasional',
                  'Cocok untuk owner yang ingin dashboard finansial lebih rapi',
                ],
              ),
            ],
          ),
        ],
      );
    case 'knw-company-profile':
      return const KnowledgeDetail(
        overview:
            'Layanan company profile GiLabs menekankan kualitas hasil, copywriting kontekstual, arsitektur scalable, dan maintenance yang jelas.',
        sections: [
          KnowledgeDetailSection(
            title: 'Paket Website',
            items: [
              KnowledgeDetailItem(
                title: 'Starter - Rp 1.000.000',
                bullets: [
                  'Landing page 1-3 halaman',
                  'Micro-animation halus',
                  'Domain dan hosting termasuk',
                  'Mobile responsive',
                  'Storytelling dasar',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Profesional - Rp 5.000.000',
                bullets: [
                  '5-8 halaman custom',
                  'Animasi scroll dan interaksi polished',
                  'Storytelling penuh untuk nilai bisnis',
                  'Copywriting dasar dibantu tim GiLabs',
                  'Arsitektur scalable',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Brand Identity - Rp 10.000.000',
                bullets: [
                  'Halaman tidak terbatas sesuai kebutuhan bisnis',
                  'Custom animasi dan interaksi premium',
                  'Narasi brand penuh dan mendalam',
                  'Strategi konten dan CTA dirancang untuk konversi',
                  'Arsitektur scalable plus dokumentasi teknis',
                ],
              ),
            ],
          ),
          KnowledgeDetailSection(
            title: 'Ecommerce Landing Page',
            items: [
              KnowledgeDetailItem(
                title: 'Starter - Rp 2.000.000',
                bullets: [
                  '1 long-form landing page',
                  'Showcase maksimal 6 produk',
                  'CTA ke WhatsApp atau marketplace',
                  'Micro-animation ringan',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Profesional - Rp 5.000.000',
                bullets: [
                  'Landing page plus halaman detail produk',
                  'Showcase sampai 20 item',
                  'Integrasi WhatsApp klik order',
                  'Trust elements seperti testimoni, rating, badge',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Full Ecommerce - Rp 10.000.000',
                bullets: [
                  'Multi halaman lengkap',
                  'Manajemen produk oleh klien',
                  'Keranjang belanja dan payment gateway',
                  'SEO dasar dan hosting premium',
                ],
              ),
            ],
          ),
          KnowledgeDetailSection(
            title: 'Ketentuan Revisi',
            items: [
              KnowledgeDetailItem(
                title: 'Minor',
                summary:
                    'Perubahan pada 1 section tanpa mengubah struktur halaman.',
                bullets: [
                  'Contoh: ganti headline, foto hero, warna tombol CTA',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Middle',
                summary:
                    'Perubahan 1 halaman penuh, termasuk layout atau urutan konten.',
                bullets: [
                  'Contoh: redesign About, ubah urutan section, tambah halaman baru',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Major',
                summary:
                    'Mayoritas website berubah secara desain, struktur, atau konten.',
                bullets: [
                  'Contoh: ganti tema visual seluruh website, restruktur semua halaman',
                ],
              ),
            ],
          ),
          KnowledgeDetailSection(
            title: 'Maintenance Tahunan',
            items: [
              KnowledgeDetailItem(
                title: 'Basic - Rp 1.000.000 / tahun',
                bullets: [
                  'Update minor maksimal 2x per bulan',
                  'Hosting dan domain aktif',
                  'Response time maksimal 3x24 jam',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Pro - Rp 2.000.000 / tahun',
                bullets: [
                  'Update konten 2x per bulan',
                  'Tambah 2 artikel per bulan',
                  'Revisi minor 1x per bulan',
                  'Response time maksimal 2x24 jam',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Premium - Rp 5.000.000 / tahun',
                bullets: [
                  'Update konten tanpa batas',
                  'Blog tanpa batas dari materi klien',
                  'Revisi major 1x per bulan',
                  'Maksimal 1 halaman baru per bulan',
                  'Response prioritas 1x24 jam',
                ],
              ),
            ],
          ),
        ],
      );
    case 'knw-website-app':
      return const KnowledgeDetail(
        overview:
            'Kategori ini cocok untuk lead yang butuh produk digital lebih ringan dari custom enterprise, tapi tetap butuh implementasi rapi.',
        sections: [
          KnowledgeDetailSection(
            title: 'Cakupan Umum',
            items: [
              KnowledgeDetailItem(
                title: 'Website dan portal ringan',
                bullets: [
                  'Katalog, booking, dashboard dasar, dan integrasi standar',
                  'Budget ideal mulai Rp15 juta',
                ],
              ),
              KnowledgeDetailItem(
                title: 'Aplikasi sederhana',
                bullets: [
                  'Cocok untuk MVP, dashboard internal, atau sistem operasional awal',
                  'Perlu scope fitur, user role, dan alur approval yang cukup jelas',
                ],
              ),
            ],
          ),
        ],
      );
    case 'knw-custom-software':
      return const KnowledgeDetail(
        overview:
            'Lead custom software perlu discovery lebih dalam sebelum estimasi final, terutama saat menyentuh banyak proses bisnis atau integrasi.',
        sections: [
          KnowledgeDetailSection(
            title: 'Yang perlu digali',
            items: [
              KnowledgeDetailItem(
                title: 'Discovery',
                bullets: [
                  'Proses bisnis saat ini',
                  'Stakeholder dan user utama',
                  'Integrasi yang dibutuhkan',
                  'Timeline target',
                  'Risiko dan kendala operasional',
                ],
              ),
            ],
          ),
        ],
      );
    default:
      return null;
  }
}
