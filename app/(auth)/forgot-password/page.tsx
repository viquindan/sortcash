"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoFull } from "@/components/ui/Logo";
import { useLang } from "@/lib/i18n/useLang";

const t = {
  es: {
    title: "¿Olvidaste tu contraseña?",
    sub: "Ingresa tu email y te enviaremos un enlace para restablecerla.",
    label: "Email",
    button: "Enviar enlace",
    sending: "Enviando...",
    success: "Si ese email está registrado, recibirás un enlace en los próximos minutos. Revisa también tu carpeta de spam.",
    back: "Volver al inicio de sesión",
    error: "Hubo un error. Intenta de nuevo.",
  },
  en: {
    title: "Forgot your password?",
    sub: "Enter your email and we'll send you a link to reset it.",
    label: "Email",
    button: "Send link",
    sending: "Sending...",
    success: "If that email is registered, you'll receive a link within the next few minutes. Check your spam folder too.",
    back: "Back to sign in",
    error: "Something went wrong. Please try again.",
  },
};

export default function ForgotPasswordPage() {
  const { lang } = useLang();
  const tr = t[lang];
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex w-1/2 bg-navy flex-col justify-between p-12">
        <LogoFull href="/" onDark className="[&_span]:text-white [&_span.text-accent]:text-blue-400" />
        <div>
          <p className="text-white/80 text-2xl font-light leading-relaxed mb-6">
            {lang === "es" ? "Tus finanzas, sin fronteras." : "Your finances, without borders."}
          </p>
        </div>
        <p className="text-white/20 text-xs">© 2025 Sort Cash.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <LogoFull href="/" />
          </div>

          {status === "done" ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-navy mb-3">
                {lang === "es" ? "¡Listo!" : "Done!"}
              </h1>
              <p className="text-muted text-sm leading-relaxed mb-8">{tr.success}</p>
              <Link href="/sign-in" className="text-sm text-accent hover:underline font-medium">
                ← {tr.back}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text mb-1">{tr.title}</h1>
              <p className="text-muted text-sm mb-8">{tr.sub}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {status === "error" && (
                  <div className="p-3 bg-red/10 text-red text-sm rounded-lg border border-red/20">
                    {tr.error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">{tr.label}</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="input-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? tr.sending : tr.button}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                <Link href="/sign-in" className="text-accent font-medium hover:underline">
                  ← {tr.back}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
