import type { KnowledgeArticle } from "./types/knowledge.types";

export type KnowledgeDetailItem = {
  title: string;
  summary?: string;
  bullets?: string[];
};

export type KnowledgeDetailSection = {
  title: string;
  summary?: string;
  items: KnowledgeDetailItem[];
};

export type KnowledgeDetail = {
  overview: string;
  sections: KnowledgeDetailSection[];
};

const companyProfileDetail: KnowledgeDetail = {
  overview:
    "Company Profile adalah aset kredibilitas dan funnel kontak. Sales perlu menjualnya sebagai alat bantu closing, bukan sekadar website profil.",
  sections: [
    {
      title: "Kapan Ditawarkan",
      items: [
        {
          title: "Lead yang cocok",
          bullets: [
            "Bisnis sudah punya layanan/produk jelas tetapi belum punya website yang meyakinkan.",
            "Owner sering diminta company profile, portofolio, katalog, atau link resmi oleh calon klien.",
            "Tim sales butuh halaman yang menjelaskan value, testimoni, layanan, dan CTA WhatsApp/form.",
            "Brand ingin terlihat lebih profesional sebelum pitching, tender, atau campaign digital.",
          ],
        },
        {
          title: "Pertanyaan discovery awal",
          bullets: [
            "Siapa target pembeli dan apa alasan mereka harus percaya?",
            "Produk atau layanan mana yang paling ingin didorong untuk closing?",
            "Apa bukti kredibilitas yang tersedia: klien, testimoni, sertifikasi, portfolio, case study?",
            "CTA utama apa yang paling penting: WhatsApp, form, booking meeting, katalog, atau marketplace?",
          ],
        },
      ],
    },
    {
      title: "Paket Website",
      items: [
        {
          title: "Starter - Rp 1.000.000",
          bullets: [
            "Landing page 1-3 halaman untuk validasi profil bisnis.",
            "Mobile responsive, micro-animation halus, domain dan hosting termasuk.",
            "Cocok untuk bisnis yang butuh online presence cepat dengan materi yang sudah siap.",
          ],
        },
        {
          title: "Profesional - Rp 5.000.000",
          bullets: [
            "5-8 halaman custom untuk profil, layanan, portfolio, kontak, dan halaman pendukung.",
            "Copywriting dasar dibantu tim GiLabs agar pesan bisnis lebih rapi.",
            "Cocok untuk bisnis yang ingin tampil serius dan siap menjalankan campaign.",
          ],
        },
        {
          title: "Brand Identity - Rp 10.000.000",
          bullets: [
            "Struktur halaman lebih fleksibel sesuai kebutuhan bisnis dan strategi konten.",
            "Narasi brand, CTA, trust element, dan interaksi visual dirancang untuk konversi.",
            "Cocok untuk lead yang perlu website sebagai aset sales jangka panjang.",
          ],
        },
      ],
    },
    {
      title: "SOP Kualitas",
      items: [
        {
          title: "Alur pengerjaan",
          bullets: [
            "Discovery brand, target audiens, layanan utama, kompetitor, dan CTA.",
            "Penyusunan sitemap, flow konten, wireframe, dan arahan copy.",
            "Desain responsif, implementasi, review internal, testing mobile/desktop, lalu deployment.",
            "Handover akses dan opsi maintenance agar website tetap aman dan relevan.",
          ],
        },
        {
          title: "Manfaat yang bisa dijual",
          bullets: [
            "Klien tidak hanya mendapat tampilan, tetapi struktur pesan yang membantu calon pembeli paham lebih cepat.",
            "Testing responsive mengurangi risiko website terlihat rusak saat dibuka dari HP calon klien.",
            "Maintenance membuat aset digital tetap hidup setelah launching.",
          ],
        },
      ],
    },
    {
      title: "Objection Handling",
      items: [
        {
          title: "Klien bilang sudah punya Instagram",
          bullets: [
            "Instagram bagus untuk awareness, tetapi website lebih kuat untuk kredibilitas, tender, SEO, dan link resmi.",
            "Website bisa merangkum semua bukti kepercayaan dalam satu halaman yang mudah dikirim sales.",
          ],
        },
        {
          title: "Klien takut revisi tidak terkendali",
          bullets: [
            "Jelaskan batas revisi: minor untuk teks/foto/warna, middle untuk satu halaman, major untuk perubahan struktur besar.",
            "SOP review bertahap membuat klien bisa validasi sebelum masuk implementasi penuh.",
          ],
        },
      ],
    },
  ],
};

const salesViewDetail: KnowledgeDetail = {
  overview:
    "SalesView diposisikan sebagai suite modular. Sales sebaiknya mulai dari pain point operasional paling terasa, lalu menawarkan modul yang paling relevan.",
  sections: [
    {
      title: "Modul dan Pain Point",
      items: [
        {
          title: "POS",
          bullets: [
            "Untuk restoran, cafe, retail, atau outlet yang perlu transaksi lebih rapi.",
            "Floor layout dan self order QR membantu mengurangi antrean dan kesalahan input pesanan.",
            "Angle closing: owner bisa memantau transaksi dan operasional outlet lebih tertib.",
          ],
        },
        {
          title: "CRM",
          bullets: [
            "Untuk tim sales yang follow-up masih tersebar di chat pribadi atau spreadsheet.",
            "Pipeline, histori interaksi, dan aktivitas prospek membantu tim lebih disiplin closing.",
            "Angle closing: peluang tidak mudah hilang karena follow-up lebih terlihat.",
          ],
        },
        {
          title: "ERP",
          bullets: [
            "Untuk bisnis yang punya proses lintas divisi, approval, stok, operasional, dan reporting.",
            "Cocok saat owner sulit melihat status pekerjaan atau data antar divisi tidak sinkron.",
            "Angle closing: kontrol proses lebih rapi tanpa menunggu laporan manual.",
          ],
        },
        {
          title: "HR dan Finance",
          bullets: [
            "HR membantu data karyawan, absensi, dan administrasi SDM lebih tertata.",
            "Finance membantu pencatatan arus kas, monitoring pembayaran, dan ringkasan operasional.",
            "Angle closing: administrasi internal lebih siap untuk scale.",
          ],
        },
      ],
    },
    {
      title: "Discovery SalesView",
      items: [
        {
          title: "Pertanyaan kunci",
          bullets: [
            "Proses apa yang paling sering telat, salah, atau sulit dipantau?",
            "Berapa jumlah user, outlet, tim, atau divisi yang akan memakai sistem?",
            "Data apa yang saat ini masih manual dan laporan apa yang paling dibutuhkan owner?",
            "Modul mana yang paling mendesak untuk fase pertama?",
          ],
        },
        {
          title: "SOP implementasi",
          bullets: [
            "Mapping kebutuhan modul, konfigurasi role, setup data awal, demo, training, UAT, dan go-live.",
            "Mulai dari modul prioritas agar klien cepat melihat value sebelum scale ke modul lain.",
            "Evaluasi adoption setelah live untuk memastikan sistem benar-benar dipakai tim.",
          ],
        },
      ],
    },
  ],
};

const websiteAppDetail: KnowledgeDetail = {
  overview:
    "Website dan aplikasi sederhana cocok untuk kebutuhan digital yang lebih praktis dari custom enterprise, tetapi tetap perlu scope rapi agar cepat live dan mudah dikembangkan.",
  sections: [
    {
      title: "Cakupan Umum",
      items: [
        {
          title: "Website, portal, dan dashboard ringan",
          bullets: [
            "Katalog, booking, dashboard dasar, form internal, tracking sederhana, atau portal informasi.",
            "Budget ideal mulai Rp15 juta untuk scope yang sudah cukup jelas.",
            "Cocok untuk MVP atau digitalisasi proses kecil yang ingin dibuktikan dulu.",
          ],
        },
        {
          title: "Aplikasi sederhana",
          bullets: [
            "Perlu user role, alur kerja, data utama, notifikasi, dan laporan yang jelas.",
            "Jika banyak integrasi, approval kompleks, atau migrasi data besar, arahkan ke custom software.",
            "Pisahkan nice-to-have dari must-have agar fase pertama tetap realistis.",
          ],
        },
      ],
    },
    {
      title: "SOP Kualitas",
      items: [
        {
          title: "Kontrol scope",
          bullets: [
            "Discovery singkat untuk kebutuhan, role pengguna, flow, data, integrasi, dan prioritas fitur.",
            "Scope fase pertama ditulis jelas agar estimasi tidak melebar tanpa kendali.",
            "Setiap fitur punya acceptance criteria sederhana: input, proses, output, dan siapa yang memakai.",
          ],
        },
        {
          title: "Delivery",
          bullets: [
            "Desain flow atau wireframe disetujui sebelum development.",
            "Development bertahap, QA fungsional, staging, UAT klien, lalu deployment.",
            "Handover mencakup cara pakai, akses, dan catatan pengembangan berikutnya.",
          ],
        },
      ],
    },
    {
      title: "Angle Closing",
      items: [
        {
          title: "Cara menjelaskan ke klien",
          bullets: [
            "Mulai dari masalah: pekerjaan manual, data tercecer, follow-up lambat, atau laporan terlambat.",
            "Tawarkan fase pertama yang menyelesaikan masalah paling penting, bukan semua fitur sekaligus.",
            "Tekankan bahwa SOP membantu produk cepat live tanpa mengorbankan kualitas dasar.",
          ],
        },
      ],
    },
  ],
};

const customSoftwareDetail: KnowledgeDetail = {
  overview:
    "Custom software, ERP, dan sistem kompleks harus diproses melalui discovery mendalam karena menyangkut proses bisnis, integrasi, stakeholder, dan risiko operasional.",
  sections: [
    {
      title: "Kriteria Lead",
      items: [
        {
          title: "Lead yang cocok",
          bullets: [
            "Klien punya proses khusus yang tidak cukup diselesaikan oleh template atau software generik.",
            "Ada banyak role, approval, cabang/outlet, integrasi pihak ketiga, atau laporan manajemen.",
            "Masalah manual sudah berdampak pada biaya, waktu, akurasi data, atau pengalaman pelanggan.",
          ],
        },
        {
          title: "Red flag yang perlu dicatat",
          bullets: [
            "Klien meminta semua fitur langsung tanpa prioritas fase.",
            "Tidak ada PIC pengambil keputusan atau proses internal belum jelas.",
            "Budget sangat jauh di bawah kompleksitas tetapi ekspektasi enterprise.",
          ],
        },
      ],
    },
    {
      title: "Discovery Wajib",
      items: [
        {
          title: "Data yang harus digali sales",
          bullets: [
            "Masalah bisnis utama dan dampaknya ke revenue, biaya, waktu, atau risiko.",
            "Proses as-is, target to-be, stakeholder, user role, modul prioritas, dan laporan penting.",
            "Integrasi, migrasi data, compliance, timeline target, budget range, dan risiko operasional.",
            "Definisi sukses: kapan klien menganggap sistem berhasil.",
          ],
        },
      ],
    },
    {
      title: "SOP Delivery",
      items: [
        {
          title: "Tahapan proyek",
          bullets: [
            "Discovery dan requirement document sebelum estimasi final.",
            "Scope freeze per fase agar perubahan tidak merusak timeline.",
            "Architecture review, sprint planning, development, code review, QA, staging, UAT, deployment.",
            "Training, dokumentasi, support awal, dan rencana improvement setelah live.",
          ],
        },
        {
          title: "Manfaat ke klien",
          bullets: [
            "Risiko salah bangun turun karena kebutuhan divalidasi sebelum produksi.",
            "Progress lebih mudah dipantau karena proyek dibagi ke fase dan milestone.",
            "Estimasi lebih bertanggung jawab karena mengacu pada scope dan kompleksitas nyata.",
          ],
        },
      ],
    },
  ],
};

const sopSoftwareDetail: KnowledgeDetail = {
  overview:
    "SOP standard software development GiLabs adalah pegangan sales untuk menjelaskan bahwa produk dibangun dengan proses terukur dari discovery sampai maintenance.",
  sections: [
    {
      title: "Tahapan SOP",
      items: [
        {
          title: "1. Discovery dan requirement alignment",
          bullets: [
            "Memahami tujuan bisnis, masalah utama, user role, proses, data, integrasi, dan target timeline.",
            "Menyamakan definisi sukses agar tim GiLabs dan klien tidak menebak-nebak ekspektasi.",
            "Output: ringkasan kebutuhan, prioritas fitur, risiko awal, dan rekomendasi fase.",
          ],
        },
        {
          title: "2. Scope, estimasi, dan planning",
          bullets: [
            "Fitur diprioritaskan menjadi must-have, should-have, dan next phase.",
            "Scope disepakati sebelum produksi agar budget dan timeline tetap realistis.",
            "Output: estimasi, milestone, acceptance criteria, dan alur komunikasi proyek.",
          ],
        },
        {
          title: "3. Design, development, dan review",
          bullets: [
            "Flow, wireframe, atau UI disiapkan untuk validasi sebelum development penuh.",
            "Development berjalan bertahap dengan review internal dan code review.",
            "Perubahan besar diarahkan ke change request agar proyek tetap terkendali.",
          ],
        },
        {
          title: "4. QA, staging, UAT, dan deployment",
          bullets: [
            "QA mengecek fungsi utama, error umum, responsifitas, dan skenario penting.",
            "Staging dipakai untuk validasi klien sebelum live.",
            "UAT memastikan fitur sesuai kebutuhan operasional sebelum deployment.",
          ],
        },
        {
          title: "5. Handover dan maintenance",
          bullets: [
            "Klien mendapat arahan penggunaan, akses, dan dokumentasi seperlunya.",
            "Maintenance menjaga sistem tetap stabil, aman, dan bisa ditingkatkan sesuai kebutuhan baru.",
            "Support awal membantu tim klien lebih cepat beradaptasi setelah go-live.",
          ],
        },
      ],
    },
    {
      title: "Cara Menjual SOP",
      items: [
        {
          title: "Pesan utama untuk sales",
          bullets: [
            "SOP bukan istilah teknis; SOP adalah cara GiLabs menjaga proyek agar tidak asal cepat.",
            "Setiap tahap mengurangi risiko: salah scope, bug kritis, miskomunikasi, dan ekspektasi yang tidak jelas.",
            "Klien membeli kepastian proses, bukan hanya baris kode atau tampilan aplikasi.",
          ],
        },
        {
          title: "Script singkat",
          summary:
            "Di GiLabs, kami mulai dari discovery supaya kebutuhan bisnisnya jelas. Setelah scope disepakati, tim masuk ke desain, development, testing, UAT, lalu deployment. Jadi klien bisa melihat progress bertahap dan kualitasnya divalidasi sebelum live.",
        },
      ],
    },
  ],
};

export function getKnowledgeDetail(article: KnowledgeArticle): KnowledgeDetail | null {
  switch (article.id) {
    case "knw-salesview":
      return salesViewDetail;
    case "knw-company-profile":
      return companyProfileDetail;
    case "knw-website-app":
      return websiteAppDetail;
    case "knw-custom-software":
      return customSoftwareDetail;
    case "knw-sop-software-development":
      return sopSoftwareDetail;
    default:
      return null;
  }
}
