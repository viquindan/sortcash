"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoFull } from "@/components/ui/Logo";
import { LayoutDashboard, ListOrdered, Settings, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/overview", icon: LayoutDashboard },
  { label: "Movimientos", href: "/transactions", icon: ListOrdered },
  { label: "Ajustes", href: "/settings", icon: Settings },
];

interface SidebarProps {
  email: string;
  initials: string;
  logoutAction: () => Promise<void>;
}

export function Sidebar({ email, initials, logoutAction }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 py-6 px-3 space-y-1">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 group text-sm font-medium ${
              active
                ? "bg-white/15 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const UserSection = () => (
    <div className="p-4 border-t border-white/10 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-white">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/50 truncate">{email}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-white/40 hover:text-red transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 bg-navy flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <LogoFull onDark className="[&_span]:text-white [&_span.text-accent]:text-blue-400" />
        </div>
        <NavLinks />
        <UserSection />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-navy flex items-center justify-between px-4 border-b border-white/10">
        <LogoFull onDark className="[&_span]:text-white [&_span.text-accent]:text-blue-400" />
        <button
          onClick={() => setOpen(true)}
          className="text-white/70 hover:text-white transition-colors p-1"
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-navy flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/10">
          <LogoFull onDark className="[&_span]:text-white [&_span.text-accent]:text-blue-400" />
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <NavLinks onClick={() => setOpen(false)} />
        <UserSection />
      </div>
    </>
  );
}
