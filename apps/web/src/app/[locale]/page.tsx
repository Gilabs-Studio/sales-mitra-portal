import Image from "next/image";
import { ArrowRight, Download, MessageCircle, Smartphone, TrendingUp, Zap, Shield } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getPartnerResources } from "@/features/resources/resources";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardMeta,
  CardMetaItem,
  CardFooter,
} from "@/components/ui/card";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const isEn = locale === "en";
  const mobileDownloadUrl = process.env.NEXT_PUBLIC_MOBILE_APP_DOWNLOAD_URL;
  const mobileDownloadHref = "/downloads/mobile-app";
  const whatsappUrl = "https://wa.me/6289526770703";
  const resources = getPartnerResources(locale);

  const t = {
    /* ── Nav ─────────────────────────────────────────────── */
    nav: {
      about:    isEn ? "How it works"  : "Cara Kerja",
      scheme:   isEn ? "Commission"    : "Skema Komisi",
      cases:    isEn ? "Case Studies"  : "Studi Kasus",
      contact:  isEn ? "Contact"       : "Kontak",
      login:    isEn ? "Login"         : "Masuk",
      register: isEn ? "Register Now"  : "Daftar Sekarang",
    },

    /* ── Hero ─────────────────────────────────────────────── */
    heroTitle: isEn ? (
      <>
        Earn commissions by{" "}
        <span className="font-serif italic font-normal tracking-wide">referring</span> software projects
      </>
    ) : (
      <>
        Dapatkan komisi dari{" "}
        <span className="font-serif italic font-normal tracking-wide">setiap referral</span> proyek software
      </>
    ),
    heroSub: isEn
      ? "No selling experience required — if you know someone who needs a website, app, or enterprise system, you already qualify to earn"
      : "Tidak perlu pengalaman sales — cukup kenal seseorang yang butuh website, aplikasi, atau sistem enterprise, dan kamu sudah berhak dapat komisi",
    heroCTA:  isEn ? "Start earning →" : "Mulai dapat komisi →",
    heroSecondary: isEn ? "Already a partner? Login" : "Sudah mitra? Masuk",

    /* ── Stats strip ────────────────────────────────────────── */
    stat1Val: isEn ? "up to 30%" : "hingga 30%",
    stat1Label: isEn ? "commission — starts at 8%, scales with project size" : "komisi — mulai 8%, naik sesuai skala proyek",
    stat2Val: "Rp 0",
    stat2Label: isEn ? "Registration cost, zero barrier" : "Biaya daftar, nol hambatan",
    stat3Val: "24 jam",
    stat3Label: isEn ? "Lead review SLA from GiLabs team" : "SLA review lead oleh tim GiLabs",

    /* ── Dark feature card ──────────────────────────────────── */
    featureTag:   isEn ? "LIVE DEAL TRACKING" : "TRACKING DEAL LANGSUNG",
    featureTitle: isEn
      ? "Know exactly where your money stands — at all times"
      : "Tahu persis di mana uangmu berada — setiap saat",
    featureDesc: isEn
      ? "Submit a lead and watch it move through qualification, meeting, proposal, and closing — then see your commission land in your dashboard the moment payment clears"
      : "Submit lead dan lihat pergerakannya dari kualifikasi, meeting, proposal, hingga closing — lalu saksikan komisimu masuk ke dashboard saat pembayaran terverifikasi",
    featureBtn: isEn ? "See how it works" : "Lihat cara kerjanya",

    /* ── Cards section ──────────────────────────────────────── */
    cardsEyebrow: isEn ? "WHAT YOU CAN REFER" : "APA YANG BISA KAMU REFERENSIKAN",
    cardsTitle: isEn
      ? "The more you refer, the more you earn"
      : "Semakin banyak referral, semakin besar komisimu",

    card1Title: isEn ? "Website & Company Profile" : "Website & Company Profile",
    card1Body:  isEn
      ? "Know someone looking for a company site or landing page? That's your first commission waiting to be claimed"
      : "Kenal seseorang yang butuh website perusahaan atau landing page? Itu komisi pertamamu yang tinggal diklaim",
    card1Category: isEn ? "Web Dev" : "Web Dev",
    card1Min:      isEn ? "From Rp 10 jt (10% yours)" : "Mulai Rp 10 jt (10% untukmu)",

    card2Title: isEn ? "Custom App & SaaS" : "Custom App & SaaS",
    card2Body:  isEn
      ? "Connect a business that needs a custom system or mobile app — larger projects, significantly bigger commissions"
      : "Hubungkan bisnis yang butuh sistem custom atau aplikasi mobile — proyek lebih besar, komisi jauh lebih besar",
    card2Category: isEn ? "Software Dev" : "Software Dev",
    card2Min:      isEn ? "From Rp 25 jt (8% yours)" : "Mulai Rp 25 jt (8% untukmu)",

    card3Title: isEn ? "Enterprise & Cloud" : "Enterprise & Cloud",
    card3Body:  isEn
      ? "Refer an enterprise digitisation project — ERP, cloud migration, integrated systems — and unlock the highest commission tier available"
      : "Referensikan proyek digitalisasi enterprise — ERP, migrasi cloud, sistem terintegrasi — dan buka tier komisi tertinggi yang tersedia",
    card3Category: "Enterprise",
    card3Min:      isEn ? "Custom / Tender (Negotiable)" : "Kustom / Tender (Negosiasi)",

    cardBtn: isEn ? "Claim this opportunity →" : "Klaim peluang ini →",

    /* ── Value props ─────────────────────────────────────────── */
    vp1Title: isEn ? "No gatekeeping"      : "Tanpa seleksi ketat",
    vp1Body:  isEn
      ? "Register in minutes — no interviews, no onboarding sessions, no contracts to sign upfront"
      : "Daftar dalam menit — tanpa interview, tanpa sesi onboarding panjang, tanpa kontrak di muka",
    vp2Title: isEn ? "We close, you earn"  : "Kami yang closing, kamu yang untung",
    vp2Body:  isEn
      ? "Our sales team handles every meeting, proposal, and negotiation — your only job is to make the introduction"
      : "Tim sales kami handle semua meeting, proposal, dan negosiasi — tugasmu hanya memperkenalkan",
    vp3Title: isEn ? "Full transparency"   : "Transparansi penuh",
    vp3Body:  isEn
      ? "Track every lead status and payment milestone in real-time — no black boxes, no guessing when your commission arrives"
      : "Lacak setiap status lead dan milestone pembayaran secara real-time — tidak ada kotak hitam, tidak perlu menebak kapan komisimu tiba",

    /* ── Directory / Resources ───────────────────────────────── */
    dirIntro: isEn
      ? "Everything you need to start referring and earning — right here"
      : "Semua yang kamu butuhkan untuk mulai referral dan dapat komisi — ada di sini",

    /* ── Contact ─────────────────────────────────────────────── */
    contactEyebrow: isEn ? "NEED HELP?" : "BUTUH BANTUAN?",
    contactTitle: isEn ? "Talk directly with GiLabs team" : "Ngobrol langsung dengan tim GiLabs",
    contactBody: isEn
      ? "Have questions before registering, want to discuss a lead, or need help choosing the right opportunity? Message us on WhatsApp."
      : "Punya pertanyaan sebelum daftar, mau diskusi lead, atau butuh bantuan memilih peluang? Hubungi kami lewat WhatsApp.",
    contactBtn: isEn ? "Chat on WhatsApp" : "Chat via WhatsApp",
    contactPhone: "+62 895-2677-0703",
  };

  /* ── Icons per value prop ───── */
  const vpIcons = [TrendingUp, Zap, Shield];
  const vps = [
    { title: t.vp1Title, body: t.vp1Body },
    { title: t.vp2Title, body: t.vp2Body },
    { title: t.vp3Title, body: t.vp3Body },
  ];

  return (
    <main className="min-h-screen bg-background font-sans selection:bg-accent selection:text-foreground">

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link href="/" className="select-none cursor-pointer inline-flex items-center">
            <Image
              src="/Logo.png"
              alt="GiLabs"
              width={96}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: t.nav.about,  href: "#cara-kerja" },
              { label: t.nav.scheme, href: "#skema" },
              { label: t.nav.cases,  href: "#sumber" },
              { label: t.nav.contact, href: "#kontak" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-primary/10"
            >
              {t.nav.register}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <h1 className="max-w-3xl text-5xl md:text-[4.5rem] font-sans font-medium tracking-tight leading-[1.06] text-foreground">
          {t.heroTitle}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
          {t.heroSub}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-primary/10"
          >
            {t.heroCTA}
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {t.heroSecondary}
          </Link>
          {mobileDownloadUrl ? (
            <a
              href={mobileDownloadHref}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              {isEn ? "Download mobile app" : "Download aplikasi mobile"}
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/30">
          {[
            { val: t.stat1Val, label: t.stat1Label },
            { val: t.stat2Val, label: t.stat2Label },
            { val: t.stat3Val, label: t.stat3Label },
          ].map(({ val, label }) => (
            <div key={label} className="px-8 py-6 first:pl-0 last:pr-0">
              <p className="text-4xl font-sans font-medium text-foreground tracking-tight">{val}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dark Feature Card ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="bg-primary text-primary-foreground rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left copy */}
            <div className="p-10 md:p-14 flex flex-col justify-between gap-12">
              <div>
                <span className="font-mono text-[10px] text-primary-foreground/50 uppercase tracking-widest font-semibold block mb-5">
                  {t.featureTag}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight leading-[1.15]">
                  {t.featureTitle}
                </h2>
                <p className="mt-5 text-base text-primary-foreground/75 leading-relaxed">
                  {t.featureDesc}
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 self-start bg-primary-foreground text-primary font-semibold text-sm px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary-foreground/90 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg"
              >
                {t.featureBtn}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Right — pipeline visual (no animations) */}
            <div className="hidden lg:flex items-center justify-center p-14 bg-primary/80">
              <div className="w-full max-w-xs flex flex-col gap-3">
                {[
                  { label: isEn ? "Lead submitted"   : "Lead dikirim",       status: isEn ? "Done"    : "Selesai",  active: false },
                  { label: isEn ? "Qualification"    : "Kualifikasi",         status: isEn ? "Done"    : "Selesai",  active: false },
                  { label: isEn ? "Discovery meeting": "Meeting discovery",   status: isEn ? "Live"    : "Live",     active: true  },
                  { label: isEn ? "Proposal sent"    : "Proposal dikirim",    status: isEn ? "Pending" : "Pending",  active: false },
                  { label: isEn ? "Commission paid"  : "Komisi dibayarkan",   status: isEn ? "Pending" : "Pending",  active: false },
                ].map(({ label, status, active }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold ${
                      active
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary-foreground/10 text-primary-foreground/70"
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${active ? "text-primary" : "text-primary-foreground/40"}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cards Grid ──────────────────────────────────────────── */}
      <section id="skema" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
            {t.cardsEyebrow}
          </span>
          <h2 className="text-2xl md:text-3xl font-sans font-medium text-foreground tracking-tight">
            {t.cardsTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>{t.card1Title}</CardTitle>
              <CardDescription>{t.card1Body}</CardDescription>
            </CardHeader>
            <CardFooter>
              <CardMeta className="mb-5">
                <CardMetaItem
                  label={isEn ? "Category" : "Kategori"}
                  value={t.card1Category}
                />
                <CardMetaItem
                  label={isEn ? "Your cut" : "Komisimu"}
                  value={t.card1Min}
                  className="col-span-2"
                />
              </CardMeta>
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs py-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary/95 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t.cardBtn}
              </Link>
            </CardFooter>
          </Card>

          {/* Card 2 */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>{t.card2Title}</CardTitle>
              <CardDescription>{t.card2Body}</CardDescription>
            </CardHeader>
            <CardFooter>
              <CardMeta className="mb-5">
                <CardMetaItem
                  label={isEn ? "Category" : "Kategori"}
                  value={t.card2Category}
                />
                <CardMetaItem
                  label={isEn ? "Your cut" : "Komisimu"}
                  value={t.card2Min}
                  className="col-span-2"
                />
              </CardMeta>
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs py-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary/95 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t.cardBtn}
              </Link>
            </CardFooter>
          </Card>

          {/* Card 3 */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>{t.card3Title}</CardTitle>
              <CardDescription>{t.card3Body}</CardDescription>
            </CardHeader>
            <CardFooter>
              <CardMeta className="mb-5">
                <CardMetaItem
                  label={isEn ? "Category" : "Kategori"}
                  value={t.card3Category}
                />
                <CardMetaItem
                  label={isEn ? "Your cut" : "Komisimu"}
                  value={t.card3Min}
                  className="col-span-2"
                />
              </CardMeta>
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs py-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary/95 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t.cardBtn}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* ── Value Props ─────────────────────────────────────────── */}
      <section id="cara-kerja" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {vps.map(({ title, body }, i) => {
            const Icon = vpIcons[i];
            return (
              <article key={title}>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
                </div>
                <h3 className="font-sans text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Directory / Resources ────────────────────────────────── */}
      <section id="sumber" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="border-t border-border/30 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h3 className="text-2xl font-sans font-medium text-foreground tracking-tight leading-snug max-w-xs">
              {t.dirIntro}
            </h3>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-primary/10"
            >
              {t.nav.register}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="lg:col-span-8">
            {resources.map(({ slug, title, tag }) => (
              <Link
                key={slug}
                href={`/resources/${slug}`}
                className="flex items-center justify-between py-5 border-b border-border/30 cursor-pointer group hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold text-base text-foreground group-hover:underline transition-all duration-200">
                  {title}
                </span>
                <span className="shrink-0 ml-4 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-1 rounded">
                  {tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="kontak" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-lg border border-border/40 bg-card p-8 md:p-12">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-3">
                {t.contactEyebrow}
              </span>
              <h2 className="text-2xl md:text-3xl font-sans font-medium text-foreground tracking-tight">
                {t.contactTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground">
                {t.contactBody}
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10 active:translate-y-0"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>{t.contactBtn}</span>
              <span className="font-mono text-[11px] opacity-80">{t.contactPhone}</span>
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
