"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Upload, Globe, Zap } from "lucide-react";
import { LogoFull } from "@/components/ui/Logo";
import { useLang } from "@/lib/i18n/useLang";
import { translations, BANKS } from "@/lib/i18n/translations";

const BANK_DOMAINS: Record<string, string> = {
  "Banistmo":        "banistmo.com",
  "BAC Credomatic":  "baccredomatic.com",
  "Banco General":   "bangeneral.com",
  "Global Bank":     "globalbank.com.pa",
  "Multibank":       "multibankgroup.com",
  "Scotiabank":      "scotiabank.com",
  "Bank of America": "bankofamerica.com",
  "Chase":           "chase.com",
  "Citibank":        "citi.com",
  "Wells Fargo":     "wellsfargo.com",
  "Charles Schwab":  "schwab.com",
  "Fidelity":        "fidelity.com",
  "HSBC":            "hsbc.com",
  "Santander":       "santander.com",
  "Davivienda":      "davivienda.com",
  "Bancolombia":     "bancolombia.com",
};

function BankCard({ name }: { name: string }) {
  const domain = BANK_DOMAINS[name];
  const logoUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    : null;

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-border rounded-xl shadow-sm hover:border-accent/30 hover:shadow-md transition-all duration-200">
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={name}
          width={20}
          height={20}
          className="rounded-sm shrink-0"
          unoptimized
        />
      )}
      <span className="text-sm text-text font-medium whitespace-nowrap">{name}</span>
    </div>
  );
}

const FEATURE_ICONS = [Upload, Globe, Zap];

export function Landing() {
  const { lang, setLang } = useLang();
  const tr = translations[lang];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoFull />
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="text-xs font-semibold text-muted hover:text-text transition-colors px-3 py-1.5 rounded-md border border-border hover:border-accent/30"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
            <Link
              href="/sign-in"
              className="hidden sm:block text-sm font-medium text-text hover:text-accent transition-colors px-4 py-2"
            >
              {tr.nav.signIn}
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold bg-accent text-white px-4 py-2 rounded-lg hover:bg-accentDark transition-colors"
            >
              {tr.nav.signUp}
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-b from-[#EEF3FF] via-[#F4F7FF] to-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(27,63,139,0.12),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-border text-accent text-xs font-semibold px-3.5 py-1.5 rounded-full mb-10 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            {tr.hero.badge}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-navy tracking-tight leading-[1.05] mb-6 whitespace-pre-line">
            {tr.hero.tagline}
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-12">
            {tr.hero.sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-accentDark transition-all shadow-lg shadow-accent/20 text-base"
            >
              {tr.hero.cta}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-in"
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              {tr.hero.login}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            {tr.features.title}
          </h2>
          <p className="text-muted text-center mb-16 max-w-xl mx-auto text-sm">
            {lang === "es"
              ? "Diseñado para quienes tienen más de un banco, en más de un país."
              : "Designed for those with more than one bank, in more than one country."}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {tr.features.items.map((feat, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={i}
                  className="group p-8 rounded-2xl border border-border hover:border-accent/40 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="w-11 h-11 bg-accentPale rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors duration-200">
                    <Icon
                      size={20}
                      className="text-accent group-hover:text-white transition-colors duration-200"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-navy mb-3">{feat.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Banks ── */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">
            {tr.banks.title}
          </h2>
          <p className="text-muted text-sm mb-14 max-w-lg mx-auto">
            {tr.banks.subtitle}
          </p>

          <div className="space-y-8">
            {(
              [
                { key: "panama", label: tr.banks.panama },
                { key: "usa", label: tr.banks.usa },
                { key: "international", label: tr.banks.international },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">
                  {label}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {BANKS[key].map((bank) => (
                    <BankCard key={bank} name={bank} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32 px-6 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_120%,rgba(27,63,139,0.5),transparent)]" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {tr.cta.title}
          </h2>
          <p className="text-white/50 mb-10">{tr.cta.sub}</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-navy font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-base shadow-xl"
          >
            {tr.cta.button}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-border bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <LogoFull />
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="hover:text-accent transition-colors"
            >
              {tr.footer.terms}
            </Link>
          </div>
          <p className="text-xs">{tr.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}
