"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, Download, ShieldCheck, Smartphone, HelpCircle } from "lucide-react";
import { Link } from "@/i18n/routing";

type MobileAppDownloadPageProps = {
  params: Promise<{ locale: string }>;
};

export default function MobileAppDownloadPage({
  params,
}: MobileAppDownloadPageProps) {
  const { locale } = React.use(params);
  const isEn = locale === "en";
  const sourceUrl = process.env.NEXT_PUBLIC_MOBILE_APP_DOWNLOAD_URL;
  const backHref = `/${locale}`;

  const [activeStep, setActiveStep] = useState(0);

  const t = {
    back: isEn ? "Back to portal" : "Kembali ke portal",
    badge: isEn ? "Android Installer" : "Installer Android",
    title: isEn ? "Download GiLabs Mobile" : "Unduh GiLabs Mobile",
    subtitle: isEn 
      ? "Follow these visual steps to download and install the app on your Android device."
      : "Ikuti langkah visual berikut untuk mengunduh dan memasang aplikasi di perangkat Android Anda.",
    cta: isEn ? "Download APK Now" : "Download APK Sekarang",
    noConfig: isEn 
      ? "Download link is not configured in the environment."
      : "Link unduhan belum dikonfigurasi di environment.",
    securityHeader: isEn ? "Play Protect Checked" : "Keamanan Play Protect",
    securityDesc: isEn
      ? "If Android warns you during setup, select 'Run anyway'. The app package is fully secure."
      : "Bila Android memunculkan peringatan, pilih 'Tetap install'. Pemasangan dijamin aman.",
    stepsTitle: isEn ? "Interactive Setup Guide" : "Panduan Instalasi Interaktif",
  };

  const steps = [
    {
      title: isEn ? "Download Installer File" : "Unduh File APK",
      desc: isEn 
        ? "Tap the download button to start saving the installation file (.apk) to your device."
        : "Tekan tombol download untuk menyimpan file installer (.apk) ke perangkat Android Anda.",
      image: "/tutorial/1.webp",
    },
    {
      title: isEn ? "Open the Installer" : "Buka File APK",
      desc: isEn 
        ? "Tap the download notification or search for the file in your downloads folder."
        : "Buka file APK yang sudah selesai terunduh dari bar notifikasi atau file manager.",
      image: "/tutorial/2.webp",
    },
    {
      title: isEn ? "Confirm Pemasangan" : "Konfirmasi Pemasangan",
      desc: isEn 
        ? "Tap 'Install' when the setup prompt asks to confirm the application installer."
        : "Saat muncul pertanyaan untuk menginstall aplikasi, lanjutkan dengan memilih 'Install'.",
      image: "/tutorial/3.webp",
    },
    {
      title: isEn ? "Play Protect Security Suggestion" : "Saran Keamanan Play Protect",
      desc: isEn 
        ? "If Google asks to scan the package, tap 'Scan app' to verify local security."
        : "Jika muncul anjuran pemindaian dari Google Play Protect, pilih 'Pindai aplikasi'.",
      image: "/tutorial/4.webp",
    },
    {
      title: isEn ? "Wait for the Scan" : "Proses Pemindaian",
      desc: isEn 
        ? "Wait a moment while the system runs security checks on the package."
        : "Tunggu beberapa saat selagi sistem Android menyelesaikan proses verifikasi keamanan.",
      image: "/tutorial/5.webp",
    },
    {
      title: isEn ? "Proceed with Installation" : "Lanjutkan Pemasangan",
      desc: isEn 
        ? "Once verification shows safe, tap 'Install' again if prompted to finish."
        : "Setelah status pemindaian aman, pilih kembali 'Install' untuk melanjutkan pemasangan.",
      image: "/tutorial/6.webp",
    },
    {
      title: isEn ? "App Installed Successfully" : "Aplikasi Berhasil Terpasang",
      desc: isEn 
        ? "Tap 'Open' to launch GiLabs Mobile and sign in using your partner credentials."
        : "Pilih 'Buka' untuk mulai masuk ke aplikasi GiLabs Mobile menggunakan akun mitra Anda.",
      image: "/tutorial/7.webp",
    },
  ];

  return (
    <main className="min-h-screen bg-background bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.05),_transparent_45%)] flex flex-col justify-start pt-16 pb-8 px-4 sm:px-6 md:justify-center md:py-8">
      
      {/* Preload all tutorial screenshots in the head for instant transitions */}
      {steps.map((step) => (
        <link key={step.image} rel="preload" as="image" href={step.image} />
      ))}

      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Navigation Back */}
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t.back}
          </Link>
        </div>

        {/* Main Grid split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Info & Interactive Checklist */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* Header Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Smartphone className="h-3 w-3" aria-hidden="true" />
                  {t.badge}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t.title}
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t.subtitle}
                </p>
              </div>

              {/* Download CTA Button */}
              <div className="mt-2 flex flex-col gap-3">
                {sourceUrl ? (
                  // eslint-disable-next-line @next/next/no-html-link-for-pages
                  <a
                    href="/downloads/mobile-app/file"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t.cta}
                  </a>
                ) : (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive text-center">
                    {t.noConfig}
                  </div>
                )}

                {/* Banner Security */}
                <div className="rounded-lg border border-border bg-secondary/30 p-3 flex gap-3 items-start">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-foreground">{t.securityHeader}</span>
                    <span className="text-[10px] leading-relaxed text-muted-foreground">{t.securityDesc}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Point-Point */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t.stepsTitle}
              </h2>
              <div className="flex flex-col gap-2">
                {steps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <div key={idx} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setActiveStep(idx)}
                        onMouseEnter={() => setActiveStep(idx)}
                        className={`flex gap-4 p-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                          isActive 
                            ? "bg-primary/8 border border-primary/20" 
                            : "hover:bg-secondary/40 border border-transparent"
                        }`}
                      >
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h3 className={`text-xs font-bold transition-colors ${isActive ? "text-primary" : "text-foreground"}`}>
                            {step.title}
                          </h3>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            {step.desc}
                          </p>
                        </div>
                      </button>

                      {/* Mobile Inline Image View (only visible on mobile layout when step is active) */}
                      {isActive && (
                        <div className="block md:hidden overflow-hidden px-3 pb-3">
                          <div className="mt-3 overflow-hidden rounded-lg border border-border bg-secondary/20 max-w-[240px] mx-auto">
                            <Image
                              src={step.image}
                              alt={step.title}
                              width={480}
                              height={1066}
                              className="h-auto w-full object-contain"
                              priority
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right panel: Phone Mockup view (Desktop only) */}
          <div className="hidden md:block md:col-span-5 sticky top-8">
            <div className="flex flex-col items-center gap-4">
              
              {/* Phone Device Mockup Container - Centered and sized exactly to match 9:20 aspect ratio */}
              <div className="relative w-[252px] h-[560px] rounded-[36px] border-[8px] border-foreground bg-card shadow-2xl overflow-hidden flex flex-col">
                
                {/* Speaker/Camera Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-foreground rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-8 h-1 bg-muted-foreground/30 rounded-full mb-0.5" />
                </div>
                
                {/* Screen Content - Instant transitions with priority preloaded images */}
                <div className="relative flex-1 bg-black flex flex-col">
                  <Image
                    src={steps[activeStep].image}
                    alt={`Screenshot Step ${activeStep + 1}`}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>

              </div>

              {/* Step indicator below phone */}
              <div className="flex items-center gap-1">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeStep === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/45"
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* Footer Support Info */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80 mt-4">
          <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Need help? Contact GiLabs Admin.</span>
        </div>

      </div>
    </main>
  );
}
