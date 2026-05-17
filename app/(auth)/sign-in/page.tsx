import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { comparePasswords, createSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { LogoFull } from "@/components/ui/Logo";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  async function signIn(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) redirect("/sign-in?error=true");

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) redirect("/sign-in?error=true");

    await createSession(user.id, user.email);
    redirect("/overview");
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-navy flex-col justify-between p-12">
        <LogoFull className="[&_span]:text-white [&_span.text-accent]:text-blue-400" />
        <div>
          <blockquote className="text-white/80 text-2xl font-light leading-relaxed mb-6">
            &ldquo;Tus finanzas, sin fronteras.&rdquo;
          </blockquote>
          <p className="text-white/40 text-sm">
            Control total para profesionales internacionales con cuentas en múltiples países.
          </p>
        </div>
        <p className="text-white/20 text-xs">© 2025 Sort Cash. Todos los derechos reservados.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <LogoFull />
          </div>

          <h1 className="text-2xl font-bold text-text mb-1">Bienvenido de nuevo</h1>
          <p className="text-muted text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form action={signIn} className="space-y-4">
            {searchParams?.error && (
              <div className="p-3 bg-red/10 text-red text-sm rounded-lg border border-red/20 text-center">
                Credenciales incorrectas. Intenta de nuevo.
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-text">Contraseña</label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input-base"
              />
            </div>
            <SubmitButton loadingText="Verificando..." className="btn-primary w-full mt-2">
              Iniciar sesión
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/sign-up" className="text-accent font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
