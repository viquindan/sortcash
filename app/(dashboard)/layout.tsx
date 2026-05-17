import { verifySession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { LogoFull } from "@/components/ui/Logo";
import { LayoutDashboard, ListOrdered, Settings, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (!session?.userId) {
    redirect("/sign-in");
  }

  const navItems = [
    { label: "Dashboard", href: "/overview", icon: LayoutDashboard },
    { label: "Movimientos", href: "/transactions", icon: ListOrdered },
    { label: "Ajustes", href: "/settings", icon: Settings },
  ];

  async function handleLogout() {
    "use server";
    deleteSession();
    redirect("/sign-in");
  }

  const initials = session.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-background">
      <NavigationProgress />

      {/* Sidebar */}
      <aside className="w-64 bg-navy flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <LogoFull className="[&_span]:text-white [&_span.text-accent]:text-blue-400" />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-150 group"
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50 truncate">{session.email}</p>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="text-white/40 hover:text-red transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
