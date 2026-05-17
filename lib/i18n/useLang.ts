"use client";

import { useState, useEffect } from "react";
import type { Lang } from "./translations";

export function useLang() {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = localStorage.getItem("sortcash_lang") as Lang | null;
    if (stored === "es" || stored === "en") {
      setLangState(stored);
    } else {
      const browser = navigator.language.slice(0, 2).toLowerCase();
      setLangState(browser === "en" ? "en" : "es");
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("sortcash_lang", l);
  };

  return { lang, setLang };
}
