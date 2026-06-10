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
    case 'knw-company-profile':
      return _companyProfileDetail;
    case 'knw-salesview':
      return _salesViewDetail;
    case 'knw-website-app':
      return _websiteAppDetail;
    case 'knw-custom-software':
      return _customSoftwareDetail;
    case 'knw-sop-software-development':
      return _sopSoftwareDetail;
    default:
      return null;
  }
}

const _companyProfileDetail = KnowledgeDetail(
  overview:
      'Company Profile adalah aset kredibilitas dan funnel kontak. Sales menjualnya sebagai alat bantu closing, bukan sekadar website profil.',
  sections: [
    KnowledgeDetailSection(
      title: 'Kapan Ditawarkan',
      items: [
        KnowledgeDetailItem(
          title: 'Lead yang cocok',
          bullets: [
            'Bisnis punya layanan/produk jelas tetapi belum punya website yang meyakinkan.',
            'Owner sering diminta company profile, portofolio, katalog, atau link resmi.',
            'Tim sales butuh halaman yang menjelaskan value, testimoni, layanan, dan CTA.',
            'Brand ingin terlihat profesional sebelum pitching, tender, atau campaign digital.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Pertanyaan discovery awal',
          bullets: [
            'Siapa target pembeli dan apa alasan mereka harus percaya?',
            'Produk atau layanan mana yang paling ingin didorong untuk closing?',
            'Apa bukti kredibilitas yang tersedia: klien, testimoni, sertifikasi, atau portfolio?',
            'CTA utama apa yang paling penting: WhatsApp, form, booking meeting, katalog, atau marketplace?',
          ],
        ),
      ],
    ),
    KnowledgeDetailSection(
      title: 'Paket Website',
      items: [
        KnowledgeDetailItem(
          title: 'Starter - Rp 1.000.000',
          bullets: [
            'Landing page 1-3 halaman untuk validasi profil bisnis.',
            'Mobile responsive, micro-animation halus, domain dan hosting termasuk.',
            'Cocok untuk bisnis yang butuh online presence cepat dengan materi siap.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Profesional - Rp 5.000.000',
          bullets: [
            '5-8 halaman custom untuk profil, layanan, portfolio, kontak, dan halaman pendukung.',
            'Copywriting dasar dibantu tim GiLabs agar pesan bisnis lebih rapi.',
            'Cocok untuk bisnis yang ingin tampil serius dan siap menjalankan campaign.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Brand Identity - Rp 10.000.000',
          bullets: [
            'Struktur halaman lebih fleksibel sesuai kebutuhan bisnis dan strategi konten.',
            'Narasi brand, CTA, trust element, dan interaksi visual dirancang untuk konversi.',
            'Cocok untuk lead yang perlu website sebagai aset sales jangka panjang.',
          ],
        ),
      ],
    ),
    KnowledgeDetailSection(
      title: 'SOP Kualitas',
      items: [
        KnowledgeDetailItem(
          title: 'Alur pengerjaan',
          bullets: [
            'Discovery brand, target audiens, layanan utama, kompetitor, dan CTA.',
            'Sitemap, flow konten, wireframe, dan arahan copy disiapkan sebelum implementasi.',
            'Desain responsif, review internal, testing mobile/desktop, deployment, dan handover.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Objection handling',
          bullets: [
            'Jika klien sudah punya Instagram, jelaskan website lebih kuat untuk kredibilitas, tender, SEO, dan link resmi.',
            'Jika takut revisi, jelaskan review bertahap dan batas minor/middle/major agar ekspektasi jelas.',
          ],
        ),
      ],
    ),
  ],
);

const _salesViewDetail = KnowledgeDetail(
  overview:
      'SalesView adalah suite modular. Mulai dari pain point operasional paling terasa, lalu tawarkan modul yang paling relevan.',
  sections: [
    KnowledgeDetailSection(
      title: 'Modul dan Pain Point',
      items: [
        KnowledgeDetailItem(
          title: 'POS',
          bullets: [
            'Untuk restoran, cafe, retail, atau outlet yang perlu transaksi lebih rapi.',
            'Floor layout dan self order QR membantu mengurangi antrean dan kesalahan input.',
            'Angle closing: owner bisa memantau transaksi dan operasional outlet lebih tertib.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'CRM',
          bullets: [
            'Untuk tim sales yang follow-up masih tersebar di chat pribadi atau spreadsheet.',
            'Pipeline dan histori interaksi membantu tim lebih disiplin closing.',
            'Angle closing: peluang tidak mudah hilang karena follow-up lebih terlihat.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'ERP',
          bullets: [
            'Untuk bisnis dengan proses lintas divisi, approval, stok, operasional, dan reporting.',
            'Cocok saat owner sulit melihat status pekerjaan atau data antar divisi tidak sinkron.',
            'Angle closing: kontrol proses lebih rapi tanpa menunggu laporan manual.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'HR dan Finance',
          bullets: [
            'HR membantu data karyawan, absensi, dan administrasi SDM lebih tertata.',
            'Finance membantu pencatatan arus kas, monitoring pembayaran, dan ringkasan operasional.',
            'Angle closing: administrasi internal lebih siap untuk scale.',
          ],
        ),
      ],
    ),
    KnowledgeDetailSection(
      title: 'Discovery SalesView',
      items: [
        KnowledgeDetailItem(
          title: 'Pertanyaan kunci',
          bullets: [
            'Proses apa yang paling sering telat, salah, atau sulit dipantau?',
            'Berapa jumlah user, outlet, tim, atau divisi yang akan memakai sistem?',
            'Data apa yang masih manual dan laporan apa yang paling dibutuhkan owner?',
            'Modul mana yang paling mendesak untuk fase pertama?',
          ],
        ),
        KnowledgeDetailItem(
          title: 'SOP implementasi',
          bullets: [
            'Mapping kebutuhan modul, konfigurasi role, setup data awal, demo, training, UAT, dan go-live.',
            'Mulai dari modul prioritas agar klien cepat melihat value sebelum scale.',
            'Evaluasi adoption setelah live untuk memastikan sistem dipakai tim.',
          ],
        ),
      ],
    ),
  ],
);

const _websiteAppDetail = KnowledgeDetail(
  overview:
      'Website dan aplikasi sederhana cocok untuk kebutuhan digital yang praktis, tetapi tetap perlu scope rapi agar cepat live dan mudah dikembangkan.',
  sections: [
    KnowledgeDetailSection(
      title: 'Cakupan Umum',
      items: [
        KnowledgeDetailItem(
          title: 'Website, portal, dan dashboard ringan',
          bullets: [
            'Katalog, booking, dashboard dasar, form internal, tracking sederhana, atau portal informasi.',
            'Budget ideal mulai Rp15 juta untuk scope yang sudah cukup jelas.',
            'Cocok untuk MVP atau digitalisasi proses kecil yang ingin dibuktikan dulu.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Aplikasi sederhana',
          bullets: [
            'Perlu user role, alur kerja, data utama, notifikasi, dan laporan yang jelas.',
            'Jika banyak integrasi, approval kompleks, atau migrasi data besar, arahkan ke custom software.',
            'Pisahkan nice-to-have dari must-have agar fase pertama tetap realistis.',
          ],
        ),
      ],
    ),
    KnowledgeDetailSection(
      title: 'SOP Kualitas',
      items: [
        KnowledgeDetailItem(
          title: 'Kontrol scope',
          bullets: [
            'Discovery singkat untuk kebutuhan, role pengguna, flow, data, integrasi, dan prioritas fitur.',
            'Scope fase pertama ditulis jelas agar estimasi tidak melebar tanpa kendali.',
            'Setiap fitur punya acceptance criteria sederhana: input, proses, output, dan siapa yang memakai.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Delivery',
          bullets: [
            'Desain flow atau wireframe disetujui sebelum development.',
            'Development bertahap, QA fungsional, staging, UAT klien, lalu deployment.',
            'Handover mencakup cara pakai, akses, dan catatan pengembangan berikutnya.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Angle closing',
          bullets: [
            'Mulai dari masalah: pekerjaan manual, data tercecer, follow-up lambat, atau laporan terlambat.',
            'Tawarkan fase pertama yang menyelesaikan masalah paling penting, bukan semua fitur sekaligus.',
            'Tekankan SOP membantu produk cepat live tanpa mengorbankan kualitas dasar.',
          ],
        ),
      ],
    ),
  ],
);

const _customSoftwareDetail = KnowledgeDetail(
  overview:
      'Custom software, ERP, dan sistem kompleks harus melalui discovery mendalam karena menyangkut proses bisnis, integrasi, stakeholder, dan risiko operasional.',
  sections: [
    KnowledgeDetailSection(
      title: 'Kriteria Lead',
      items: [
        KnowledgeDetailItem(
          title: 'Lead yang cocok',
          bullets: [
            'Klien punya proses khusus yang tidak cukup diselesaikan oleh template atau software generik.',
            'Ada banyak role, approval, cabang/outlet, integrasi pihak ketiga, atau laporan manajemen.',
            'Masalah manual berdampak pada biaya, waktu, akurasi data, atau pengalaman pelanggan.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Red flag',
          bullets: [
            'Klien meminta semua fitur langsung tanpa prioritas fase.',
            'Tidak ada PIC pengambil keputusan atau proses internal belum jelas.',
            'Budget sangat jauh di bawah kompleksitas tetapi ekspektasi enterprise.',
          ],
        ),
      ],
    ),
    KnowledgeDetailSection(
      title: 'Discovery Wajib',
      items: [
        KnowledgeDetailItem(
          title: 'Data yang harus digali sales',
          bullets: [
            'Masalah bisnis utama dan dampaknya ke revenue, biaya, waktu, atau risiko.',
            'Proses as-is, target to-be, stakeholder, user role, modul prioritas, dan laporan penting.',
            'Integrasi, migrasi data, compliance, timeline target, budget range, dan risiko operasional.',
            'Definisi sukses: kapan klien menganggap sistem berhasil.',
          ],
        ),
      ],
    ),
    KnowledgeDetailSection(
      title: 'SOP Delivery',
      items: [
        KnowledgeDetailItem(
          title: 'Tahapan proyek',
          bullets: [
            'Discovery dan requirement document sebelum estimasi final.',
            'Scope freeze per fase agar perubahan tidak merusak timeline.',
            'Architecture review, sprint planning, development, code review, QA, staging, UAT, deployment.',
            'Training, dokumentasi, support awal, dan rencana improvement setelah live.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Manfaat ke klien',
          bullets: [
            'Risiko salah bangun turun karena kebutuhan divalidasi sebelum produksi.',
            'Progress lebih mudah dipantau karena proyek dibagi ke fase dan milestone.',
            'Estimasi lebih bertanggung jawab karena mengacu pada scope dan kompleksitas nyata.',
          ],
        ),
      ],
    ),
  ],
);

const _sopSoftwareDetail = KnowledgeDetail(
  overview:
      'SOP standard software development GiLabs adalah pegangan sales untuk menjelaskan bahwa produk dibangun dengan proses terukur dari discovery sampai maintenance.',
  sections: [
    KnowledgeDetailSection(
      title: 'Tahapan SOP',
      items: [
        KnowledgeDetailItem(
          title: '1. Discovery dan requirement alignment',
          bullets: [
            'Memahami tujuan bisnis, masalah utama, user role, proses, data, integrasi, dan target timeline.',
            'Menyamakan definisi sukses agar tim GiLabs dan klien tidak menebak ekspektasi.',
            'Output: ringkasan kebutuhan, prioritas fitur, risiko awal, dan rekomendasi fase.',
          ],
        ),
        KnowledgeDetailItem(
          title: '2. Scope, estimasi, dan planning',
          bullets: [
            'Fitur diprioritaskan menjadi must-have, should-have, dan next phase.',
            'Scope disepakati sebelum produksi agar budget dan timeline tetap realistis.',
            'Output: estimasi, milestone, acceptance criteria, dan alur komunikasi proyek.',
          ],
        ),
        KnowledgeDetailItem(
          title: '3. Design, development, dan review',
          bullets: [
            'Flow, wireframe, atau UI disiapkan untuk validasi sebelum development penuh.',
            'Development berjalan bertahap dengan review internal dan code review.',
            'Perubahan besar diarahkan ke change request agar proyek tetap terkendali.',
          ],
        ),
        KnowledgeDetailItem(
          title: '4. QA, staging, UAT, dan deployment',
          bullets: [
            'QA mengecek fungsi utama, error umum, responsifitas, dan skenario penting.',
            'Staging dipakai untuk validasi klien sebelum live.',
            'UAT memastikan fitur sesuai kebutuhan operasional sebelum deployment.',
          ],
        ),
        KnowledgeDetailItem(
          title: '5. Handover dan maintenance',
          bullets: [
            'Klien mendapat arahan penggunaan, akses, dan dokumentasi seperlunya.',
            'Maintenance menjaga sistem tetap stabil, aman, dan bisa ditingkatkan sesuai kebutuhan baru.',
            'Support awal membantu tim klien lebih cepat beradaptasi setelah go-live.',
          ],
        ),
      ],
    ),
    KnowledgeDetailSection(
      title: 'Cara Menjual SOP',
      items: [
        KnowledgeDetailItem(
          title: 'Pesan utama untuk sales',
          bullets: [
            'SOP bukan istilah teknis; SOP adalah cara GiLabs menjaga proyek agar tidak asal cepat.',
            'Setiap tahap mengurangi risiko salah scope, bug kritis, miskomunikasi, dan ekspektasi yang tidak jelas.',
            'Klien membeli kepastian proses, bukan hanya baris kode atau tampilan aplikasi.',
          ],
        ),
        KnowledgeDetailItem(
          title: 'Script singkat',
          summary:
              'Di GiLabs, kami mulai dari discovery supaya kebutuhan bisnisnya jelas. Setelah scope disepakati, tim masuk ke desain, development, testing, UAT, lalu deployment. Jadi klien bisa melihat progress bertahap dan kualitasnya divalidasi sebelum live.',
        ),
      ],
    ),
  ],
);
