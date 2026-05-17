import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, createSession } from "@/lib/auth";
import Link from "next/link";
import { LogoFull } from "@/components/ui/Logo";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  async function signUp(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return;

    let success = false;
    try {
      const hashedPassword = await hashPassword(password);
      const [newUser] = await db.insert(users).values({ email, password: hashedPassword }).returning();
      await createSession(newUser.id, email);
      success = true;
    } catch (e) {
      console.error("Sign up error:", e);
    }

    if (success) {
      redirect("/overview");
    } else {
      redirect("/sign-up?error=true");
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-navy flex-col justify-between p-12">
        <LogoFull href="/" className="[&_span]:text-white [&_span.text-accent]:text-blue-400" />
        <div>
          <blockquote className="text-white/80 text-2xl font-light leading-relaxed mb-6">
            &ldquo;Your finances, without borders.&rdquo;
          </blockquote>
          <p className="text-white/40 text-sm">
            Designed for executives and expats managing accounts across Latin America, Europe, and the United States.
          </p>
        </div>
        <p className="text-white/20 text-xs">© 2025 Sort Cash. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <LogoFull href="/" />
          </div>

          <h1 className="text-2xl font-bold text-text mb-1">Crea tu cuenta</h1>
          <p className="text-muted text-sm mb-8">Gratis, sin tarjeta de crédito</p>

          <form action={signUp} className="space-y-4">
            {searchParams?.error && (
              <div className="p-3 bg-red/10 text-red text-sm rounded-lg border border-red/20">
                Hubo un error al crear la cuenta. El email podría ya estar registrado.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Mínimo 8 caracteres"
                className="input-base"
              />
            </div>
            <p className="text-xs text-muted">
              Al registrarte aceptas nuestros{" "}
              <Link href="/terms" className="text-accent hover:underline">
                Términos y Condiciones
              </Link>
              .
            </p>
            <SubmitButton loadingText="Creando cuenta..." className="btn-primary w-full">
              Crear cuenta
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/sign-in" className="text-accent font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
