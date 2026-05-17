"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;
      if (href === pathname) return;

      setVisible(true);
      setWidth(15);
      slowTimer.current = setTimeout(() => setWidth(55), 150);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (slowTimer.current) clearTimeout(slowTimer.current);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    if (slowTimer.current) clearTimeout(slowTimer.current);
    setWidth(100);
    doneTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 350);

    return () => {
      if (doneTimer.current) clearTimeout(doneTimer.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-50 h-[2px] bg-accent"
      style={{
        width: `${width}%`,
        transition: width === 100 ? "width 200ms ease-out" : "width 600ms ease-in-out",
      }}
    />
  );
}
