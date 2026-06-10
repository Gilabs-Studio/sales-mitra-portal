import type { Locale } from "@/i18n/routing";

export type ResourceSection = {
  title: string;
  body?: string;
  bullets?: string[];
};

export type PartnerResource = {
  slug: string;
  title: string;
  tag: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  sections: ResourceSection[];
};

const partnershipAgreementText = `SURAT PERJANJIAN KERJASAMA
MITRA SALES/AFFILIATE MARKETING/SALES AGENT

Yang bertanda tangan di bawah ini:

PIHAK PERTAMA
Nama Perusahaan : GRIYA INNOVATION LABS (GILABS)
Alamat : Semarang
Nama Penanggung Jawab 1: Irfan Amar
Jabatan : Chief Executive Officer
Nama Penanggung Jawab 2: Yohanes Kevin
Jabatan : Founder & Chief Product Officer
Nama Penanggung Jawab 3: Vicky
Jabatan : Chief Technology Officer
Selanjutnya disebut sebagai PIHAK PERTAMA.

PIHAK KEDUA
Nama : 
Alamat : 
No. KTP :
No. HP :
Email :
Selanjutnya disebut sebagai PIHAK KEDUA.

Kedua belah pihak sepakat untuk mengadakan Perjanjian Kerjasama Mitra Sales/Affiliate Marketing/Sales Agent dengan ketentuan sebagai berikut:

PASAL 1
Ruang Lingkup Kerjasama
1. PIHAK KEDUA bertugas membantu memasarkan produk/jasa milik PIHAK PERTAMA.
2. Bentuk pemasaran dapat dilakukan secara online maupun offline.
3. PIHAK KEDUA bukan merupakan karyawan tetap PIHAK PERTAMA melainkan mitra independen.

PASAL 2
Sistem Komisi dan Pembayaran
1. PIHAK KEDUA berhak memperoleh komisi sebesar 30% dari setiap transaksi yang berhasil.
2. Komisi dihitung berdasarkan pembayaran yang telah diterima PIHAK PERTAMA.
3. Komisi bisa bertambah sesuai kesepakatan apabila penjualan PIHAK KEDUA meningkat.
4. PIHAK PERTAMA berhak memberikan bonus tambahan apabila penjualan PIHAK KEDUA meningkat.
5. Pembayaran komisi dilakukan setiap:
   - komisi 1x payment diawal transaksi
6. Pembayaran dilakukan melalui transfer bank/e-wallet ke rekening milik PIHAK KEDUA.

Data pembayaran PIHAK KEDUA:
Nama Bank/E-Wallet : ____________________
Nomor Rekening : _______________________
Atas Nama : ____________________________

PASAL 3
Hak dan Kewajiban PIHAK PERTAMA
1. Menyediakan informasi produk/jasa yang benar dan jelas.
2. Memberikan materi promosi apabila diperlukan.
3. Membayar komisi sesuai kesepakatan.
4. Berhak mengevaluasi performa PIHAK KEDUA.

PASAL 4
Hak dan Kewajiban PIHAK KEDUA
1. Memasarkan produk/jasa dengan itikad baik.
2. Tidak memberikan informasi palsu atau menyesatkan.
3. Menjaga nama baik PIHAK PERTAMA.
4. Tidak diperkenankan mengatasnamakan perusahaan tanpa izin tertulis.

PASAL 5
Kerahasiaan
PIHAK KEDUA wajib menjaga kerahasiaan data perusahaan, pelanggan, harga, strategi pemasaran, dan informasi lain milik PIHAK PERTAMA selama maupun setelah masa kerjasama berakhir.

PASAL 6
Jangka Waktu Kerjasama
1. Perjanjian ini berlaku sejak tanggal 11/05/2026 sampai dengan 11/11/2026.
2. Kerjasama dapat diperpanjang berdasarkan kesepakatan kedua belah pihak.

PASAL 7
Pengakhiran Kerjasama
1. Salah satu pihak dapat mengakhiri kerjasama dengan pemberitahuan tertulis minimal 14 hari sebelumnya.
2. Kerjasama dapat dihentikan sewaktu-waktu apabila salah satu pihak melanggar isi perjanjian.

PASAL 8
Penyelesaian Perselisihan
Apabila terjadi perselisihan, kedua belah pihak sepakat menyelesaikannya secara musyawarah terlebih dahulu. Jika tidak tercapai kesepakatan, maka akan diselesaikan sesuai hukum yang berlaku di Republik Indonesia.

PASAL 9
Penutup
Perjanjian ini dibuat dalam keadaan sadar, tanpa paksaan dari pihak manapun, dan disepakati oleh kedua belah pihak.

Demikian surat perjanjian ini dibuat untuk dipergunakan sebagaimana mestinya.

Jakarta, 11 Mei 2026

PIHAK PERTAMA                                      PIHAK KEDUA

Materai

(_________________)                                (_________________)`;

const resourcesId: PartnerResource[] = [
  {
    slug: "panduan-kemitraan-kalkulator-komisi",
    title: "Panduan Kemitraan & Kalkulator Komisi",
    tag: "Dokumentasi",
    description:
      "Ringkasan cara kerja referral GiLabs, skema komisi, dan contoh hitungan agar calon mitra langsung paham peluangnya.",
    ctaLabel: "Daftar sebagai mitra",
    ctaHref: "/register",
    sections: [
      {
        title: "Cara kerja referral",
        bullets: [
          "Daftar akun mitra, lalu submit data prospek melalui dashboard.",
          "Tim GiLabs meninjau lead, menghubungi prospek, melakukan discovery, dan mengirim proposal.",
          "Mitra dapat memantau status lead dari dashboard: submitted, qualified, contacted, won, lost, atau rejected.",
          "Komisi dibayarkan setelah pembayaran dari klien diterima dan tervalidasi oleh tim GiLabs.",
        ],
      },
      {
        title: "Kalkulator komisi cepat",
        bullets: [
          "Rumus dasar: nilai pembayaran klien x persentase komisi = komisi mitra.",
          "Contoh: deal Rp10.000.000 dengan komisi 30% menghasilkan Rp3.000.000.",
          "Contoh: deal Rp25.000.000 dengan komisi 30% menghasilkan Rp7.500.000.",
          "Jika pembayaran klien bertahap, komisi mengikuti pembayaran yang sudah diterima GiLabs.",
        ],
      },
      {
        title: "Lead yang paling mudah diproses",
        bullets: [
          "Prospek punya PIC jelas dan bisa dihubungi.",
          "Kebutuhan bisnis sudah bisa dijelaskan singkat: website, aplikasi, CRM, ERP, POS, atau sistem custom.",
          "Ada indikasi budget, timeline, dan alasan bisnis kenapa sistem dibutuhkan.",
          "Prospek bersedia mengikuti sesi discovery agar scope dan estimasi tidak menebak-nebak.",
        ],
      },
    ],
  },
  {
    slug: "studi-kasus-crm-pt-nusa",
    title: "Studi Kasus: Sistem CRM PT Nusa",
    tag: "Studi Kasus",
    description:
      "Contoh narasi studi kasus CRM yang bisa dipakai sales untuk menjelaskan value sistem pipeline dan follow-up.",
    sections: [
      {
        title: "Situasi awal",
        bullets: [
          "Tim sales PT Nusa mencatat prospek di spreadsheet dan chat pribadi.",
          "Follow-up sering terlewat karena tidak ada reminder dan histori percakapan yang rapi.",
          "Manajemen kesulitan melihat pipeline aktif, deal tertunda, dan alasan lost.",
        ],
      },
      {
        title: "Solusi yang ditawarkan",
        bullets: [
          "CRM pipeline untuk mencatat lead, status, prioritas, PIC, dan jadwal follow-up.",
          "Dashboard ringkas untuk melihat peluang aktif, aktivitas sales, dan bottleneck.",
          "Histori interaksi agar proses handover antar anggota tim lebih mudah.",
          "Notifikasi follow-up untuk mengurangi prospek yang dingin karena terlambat dihubungi.",
        ],
      },
      {
        title: "Angle closing untuk mitra",
        bullets: [
          "CRM bukan sekadar database, tetapi alat agar peluang tidak hilang dari radar.",
          "Owner mendapat visibilitas pipeline tanpa menunggu laporan manual.",
          "Tim sales lebih disiplin karena setiap lead punya status dan next action.",
          "Jika prospek punya proses unik, arahkan ke discovery untuk custom workflow.",
        ],
      },
    ],
  },
  {
    slug: "formulir-discovery-requirement",
    title: "Formulir Discovery Requirement (untuk referralmu)",
    tag: "Alat Mitra",
    description:
      "Checklist pertanyaan sebelum submit lead agar tim GiLabs bisa menilai kebutuhan, budget, dan urgensi lebih cepat.",
    ctaLabel: "Submit lead di dashboard",
    ctaHref: "/login",
    sections: [
      {
        title: "Identitas prospek",
        bullets: [
          "Nama perusahaan, bidang usaha, kota, website atau media sosial.",
          "Nama PIC, jabatan, nomor HP/WhatsApp, dan email aktif.",
          "Hubungan mitra dengan prospek: kenalan, client lama, komunitas, atau referral dari pihak lain.",
        ],
      },
      {
        title: "Kebutuhan bisnis",
        bullets: [
          "Masalah utama yang ingin diselesaikan.",
          "Jenis solusi yang dicari: company profile, website/app sederhana, CRM, POS, ERP, atau custom software.",
          "Proses kerja saat ini dan dampak masalahnya ke biaya, waktu, revenue, atau pelayanan.",
          "User yang akan memakai sistem dan laporan yang dibutuhkan owner/manajemen.",
        ],
      },
      {
        title: "Kualifikasi awal",
        bullets: [
          "Budget range atau batas maksimum yang realistis.",
          "Timeline target: segera, 1-3 bulan, 3-6 bulan, atau masih eksplorasi.",
          "Apakah prospek bersedia meeting discovery dengan tim GiLabs.",
          "Catatan risiko: integrasi pihak ketiga, migrasi data, approval kompleks, atau kebutuhan compliance.",
        ],
      },
    ],
  },
  {
    slug: "kebijakan-privasi-keamanan-data-lead",
    title: "Kebijakan Privasi & Keamanan Data Lead",
    tag: "Kepatuhan",
    description:
      "Panduan perlakuan data lead agar mitra dan tim GiLabs menjaga kepercayaan prospek sejak kontak pertama.",
    sections: [
      {
        title: "Prinsip penggunaan data",
        bullets: [
          "Data lead digunakan untuk proses kualifikasi, discovery, proposal, negosiasi, dan administrasi komisi.",
          "Data kontak tidak boleh digunakan untuk spam, dijual ulang, atau dibagikan ke pihak yang tidak berkepentingan.",
          "Mitra wajib memberikan informasi prospek dengan itikad baik dan tidak memalsukan identitas.",
        ],
      },
      {
        title: "Data yang perlu dijaga",
        bullets: [
          "Nama PIC, nomor telepon, email, alamat, dokumen kebutuhan, dan informasi internal prospek.",
          "Informasi budget, strategi bisnis, harga, proses operasional, dan integrasi sistem.",
          "Histori komunikasi antara prospek, mitra, dan tim GiLabs.",
        ],
      },
      {
        title: "Praktik aman untuk mitra",
        bullets: [
          "Kirim data lead hanya melalui dashboard atau channel resmi GiLabs.",
          "Hindari menyebarkan screenshot dashboard atau detail prospek ke grup publik.",
          "Jika salah input data, segera koreksi atau hubungi tim GiLabs.",
          "Jangan menjanjikan akses, harga final, atau timeline tanpa konfirmasi tim GiLabs.",
        ],
      },
    ],
  },
  {
    slug: "syarat-ketentuan-kemitraan-gilabs",
    title: "Syarat dan Ketentuan Kemitraan GiLabs",
    tag: "Legalitas",
    description:
      "Dokumen legalitas sementara yang tersedia saat ini: Surat Perjanjian Kerjasama Mitra Sales/Affiliate Marketing/Sales Agent.",
    sections: [
      {
        title: "Catatan",
        body:
          "Untuk saat ini, legalitas yang tersedia adalah naskah perjanjian di bawah. Data PIHAK KEDUA dan data pembayaran dapat dilengkapi sesuai mitra yang menandatangani.",
      },
      {
        title: "Naskah perjanjian",
        body: partnershipAgreementText,
      },
    ],
  },
];

const resourcesEn: PartnerResource[] = [
  {
    slug: "partnership-guide-commission-calculator",
    title: "Partnership Guide & Commission Calculator",
    tag: "Documentation",
    description:
      "A practical overview of how GiLabs referrals work, how commission is calculated, and what makes a lead easier to process.",
    ctaLabel: "Register as partner",
    ctaHref: "/register",
    sections: resourcesId[0].sections,
  },
  {
    slug: "case-study-crm-pt-nusa",
    title: "Case Study: CRM System for PT Nusa",
    tag: "Case Study",
    description:
      "A CRM case study narrative partners can use to explain pipeline visibility, follow-up discipline, and sales management value.",
    sections: resourcesId[1].sections,
  },
  {
    slug: "discovery-requirements-form",
    title: "Discovery Requirements Form (for your referral)",
    tag: "Partner Tools",
    description:
      "A referral checklist that helps GiLabs qualify needs, budget, urgency, and project complexity faster.",
    ctaLabel: "Submit lead from dashboard",
    ctaHref: "/login",
    sections: resourcesId[2].sections,
  },
  {
    slug: "lead-privacy-data-security-policy",
    title: "Lead Privacy & Data Security Policy",
    tag: "Compliance",
    description:
      "A guide for handling lead data carefully so partners and GiLabs keep prospect trust from the first interaction.",
    sections: resourcesId[3].sections,
  },
  {
    slug: "gilabs-partnership-terms-conditions",
    title: "GiLabs Partnership Terms & Conditions",
    tag: "Legal",
    description:
      "Current available legal document: Sales Partner/Affiliate Marketing/Sales Agent Cooperation Agreement.",
    sections: resourcesId[4].sections,
  },
];

export function getPartnerResources(locale: Locale | string) {
  return locale === "en" ? resourcesEn : resourcesId;
}

export function getPartnerResource(locale: Locale | string, slug: string) {
  return getPartnerResources(locale).find((resource) => resource.slug === slug);
}

export function getAllResourceStaticParams() {
  return [
    ...resourcesId.map((resource) => ({ locale: "id", slug: resource.slug })),
    ...resourcesEn.map((resource) => ({ locale: "en", slug: resource.slug })),
  ];
}
