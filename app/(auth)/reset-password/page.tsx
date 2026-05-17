"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogoFull } from "@/components/ui/Logo";
import { useLang } from "@/lib/i18n/useLang";

const t = {
  es: {
    title: "Nueva contraseña",
    sub: "Elige una contraseña segura de al menos 8 caracteres.",
    label: "Nueva contraseña",
    confirm: "Confirmar contraseña",
    button: "Guardar contraseña",
    saving: "Guardando...",
    mismatch: "Las contraseñas no coinciden.",
    short: "Mínimo 8 caracteres.",
    success: "¡Contraseña actualizada! Ya puedes iniciar sesión.",
    signIn: "Ir al inicio de sesión",
    invalidToken: "Este enlace no es válido o ya expiró. Solicita uno nuevo.",
    requestNew: "Solicitar nuevo enlace",
    error: "Hubo un error. Intenta de nuevo.",
  },
  en: {
    title: "New password",
    sub: "Choose a strong password with at least 8 characters.",
    label: "New password",
    confirm: "Confirm password",
    button: "Save password",
    saving: "Saving...",
    mismatch: "Passwords don't match.",
    short: "Minimum 8 characters.",
    success: "Password updated! You can now sign in.",
    signIn: "Go to sign in",
    invalidToken: "This link is invalid or has expired. Please request a new one.",
    requestNew: "Request new link",
    error: "Something went wrong. Please try again.",
  },
};

function ResetPasswordContent() {
  const { lang } = useLang();
  const tr = t[lang];
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "invalid">("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setStatus("invalid");
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password.length < 8) return setValidationError(tr.short);
    if (password !== confirm) return setValidationError(tr.mismatch);

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setStatus("done");
        setTimeout(() => router.push("/sign-in"), 2500);
      } else {
        const text = await res.text();
        if (text.includes("expired") || text.includes("Invalid")) {
          setStatus("invalid");
        } else {
          setStatus("error");
        }
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-navy mb-3">{lang === "es" ? "Enlace inválido" : "Invalid link"}</h1>
          <p className="text-muted text-sm mb-8">{tr.invalidToken}</p>
          <Link href="/forgot-password" className="btn-primary inline-block">{tr.requestNew}</Link>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-navy mb-3">{lang === "es" ? "¡Listo!" : "Done!"}</h1>
          <p className="text-muted text-sm mb-8">{tr.success}</p>
          <Link href="/sign-in" className="text-sm text-accent hover:underline font-medium">{tr.signIn}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background" suppressHydrationWarning>
      <div className="hidden lg:flex w-1/2 bg-navy flex-col justify-between p-12">
        <LogoFull className="[&_span]:text-white [&_span.text-accent]:text-blue-400" />
        <div>
          <p className="text-white/80 text-2xl font-light leading-relaxed">
            {lang === "es" ? "Tus finanzas, sin fronteras." : "Your finances, without borders."}
          </p>
        </div>
        <p className="text-white/20 text-xs">© 2025 Sort Cash.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <LogoFull />
          </div>

          <h1 className="text-2xl font-bold text-text mb-1">{tr.title}</h1>
          <p className="text-muted text-sm mb-8">{tr.sub}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(validationError || status === "error") && (
              <div className="p-3 bg-red/10 text-red text-sm rounded-lg border border-red/20">
                {validationError ?? tr.error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">{tr.label}</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">{tr.confirm}</label>
              <input
                name="confirm"
                type="password"
                required
                placeholder="••••••••"
                className="input-base"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? tr.saving : tr.button}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
