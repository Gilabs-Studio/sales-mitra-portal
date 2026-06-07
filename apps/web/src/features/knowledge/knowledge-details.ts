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
    "Layanan company profile GiLabs berfokus pada website yang serius dikerjakan: struktur jelas, copywriting kontekstual, arsitektur scalable, dan maintenance yang terukur.",
  sections: [
    {
      title: "Paket Website",
      items: [
        {
          title: "Starter - Rp 1.000.000",
          bullets: [
            "Landing page 1-3 halaman",
            "Micro-animation halus",
            "Domain dan hosting termasuk",
            "Mobile responsive",
            "Storytelling dasar",
          ],
        },
        {
          title: "Profesional - Rp 5.000.000",
          bullets: [
            "5-8 halaman custom",
            "Animasi scroll dan interaksi polished",
            "Storytelling penuh untuk nilai bisnis",
            "Copywriting dasar dibantu tim GiLabs",
            "Arsitektur scalable",
          ],
        },
        {
          title: "Brand Identity - Rp 10.000.000",
          bullets: [
            "Halaman tidak terbatas sesuai kebutuhan bisnis",
            "Custom animasi dan interaksi premium",
            "Narasi brand penuh dan mendalam",
            "Strategi konten dan CTA dirancang untuk konversi",
            "Arsitektur scalable plus dokumentasi teknis",
          ],
        },
      ],
    },
    {
      title: "Ecommerce Landing Page",
      items: [
        {
          title: "Starter - Rp 2.000.000",
          bullets: [
            "1 long-form landing page",
            "Showcase maksimal 6 produk",
            "CTA ke WhatsApp atau marketplace",
            "Micro-animation ringan",
          ],
        },
        {
          title: "Profesional - Rp 5.000.000",
          bullets: [
            "Landing page plus halaman detail produk",
            "Showcase sampai 20 item",
            "Integrasi WhatsApp klik order",
            "Trust elements seperti testimoni, rating, badge",
          ],
        },
        {
          title: "Full Ecommerce - Rp 10.000.000",
          bullets: [
            "Multi halaman lengkap",
            "Manajemen produk oleh klien",
            "Keranjang belanja dan payment gateway",
            "SEO dasar dan hosting premium",
          ],
        },
      ],
    },
    {
      title: "Ketentuan Revisi",
      items: [
        {
          title: "Minor",
          summary: "Perubahan pada 1 section tanpa ubah struktur halaman.",
          bullets: ["Contoh: ganti headline, foto hero, warna tombol CTA"],
        },
        {
          title: "Middle",
          summary: "Perubahan 1 halaman penuh, termasuk layout atau urutan konten.",
          bullets: ["Contoh: redesign About, ubah urutan section, tambah halaman baru"],
        },
        {
          title: "Major",
          summary: "Mayoritas website berubah secara desain, struktur, atau konten.",
          bullets: ["Contoh: ganti tema visual seluruh website, restruktur semua halaman"],
        },
      ],
    },
    {
      title: "Maintenance Tahunan",
      items: [
        {
          title: "Basic - Rp 1.000.000 / tahun",
          bullets: [
            "Update minor maksimal 2x per bulan",
            "Hosting dan domain aktif",
            "Response time maksimal 3x24 jam",
          ],
        },
        {
          title: "Pro - Rp 2.000.000 / tahun",
          bullets: [
            "Update konten 2x per bulan",
            "Tambah 2 artikel per bulan",
            "Revisi minor 1x per bulan",
            "Response time maksimal 2x24 jam",
          ],
        },
        {
          title: "Premium - Rp 5.000.000 / tahun",
          bullets: [
            "Update konten tanpa batas",
            "Blog tanpa batas dari materi klien",
            "Revisi major 1x per bulan",
            "Maksimal 1 halaman baru per bulan",
            "Response prioritas 1x24 jam",
          ],
        },
      ],
    },
  ],
};

const salesViewDetail: KnowledgeDetail = {
  overview:
    "SalesView dapat dijual sebagai suite modular. Setiap modul bisa dibicarakan sesuai kebutuhan operasional klien.",
  sections: [
    {
      title: "Modul SalesView",
      items: [
        {
          title: "POS",
          bullets: [
            "Floor layout untuk mengatur tempat duduk dan area meja",
            "Self order via QR di tiap meja agar pelanggan bisa scan dan memesan langsung",
            "Cocok untuk restoran, cafe, dan outlet dengan dine-in",
          ],
        },
        {
          title: "ERP",
          bullets: [
            "Kontrol proses bisnis lintas divisi",
            "Cocok untuk operasi yang butuh alur kerja dan approval rapi",
          ],
        },
        {
          title: "CRM",
          bullets: [
            "Kelola prospek, follow-up, pipeline, dan histori interaksi",
            "Cocok untuk tim sales yang ingin tracking closing lebih disiplin",
          ],
        },
        {
          title: "HR",
          bullets: [
            "Data karyawan, absensi, dan administrasi SDM",
            "Cocok untuk bisnis yang mulai butuh struktur HR digital",
          ],
        },
        {
          title: "Finance",
          bullets: [
            "Pencatatan keuangan dan monitoring arus kas operasional",
            "Cocok untuk owner yang ingin dashboard finansial lebih rapi",
          ],
        },
      ],
    },
  ],
};

const websiteAppDetail: KnowledgeDetail = {
  overview:
    "Kategori ini cocok untuk lead yang butuh produk digital lebih ringan dari custom enterprise, tapi tetap perlu implementasi yang rapi dan jelas.",
  sections: [
    {
      title: "Cakupan Umum",
      items: [
        {
          title: "Website dan portal ringan",
          bullets: [
            "Katalog, booking, dashboard dasar, dan integrasi standar",
            "Budget ideal mulai Rp15 juta",
          ],
        },
        {
          title: "Aplikasi sederhana",
          bullets: [
            "Cocok untuk MVP, dashboard internal, atau sistem operasional awal",
            "Perlu scope fitur, user role, dan alur approval yang cukup jelas",
          ],
        },
      ],
    },
  ],
};

const customSoftwareDetail: KnowledgeDetail = {
  overview:
    "Lead custom software perlu dipetakan lebih dalam sebelum estimasi final, terutama bila menyentuh banyak proses bisnis atau integrasi.",
  sections: [
    {
      title: "Yang perlu digali",
      items: [
        {
          title: "Discovery",
          bullets: [
            "Proses bisnis saat ini",
            "Stakeholder dan user utama",
            "Integrasi yang dibutuhkan",
            "Timeline target",
            "Risiko dan kendala operasional",
          ],
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
    default:
      return null;
  }
}
