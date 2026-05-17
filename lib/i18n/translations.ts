export type Lang = "es" | "en";

export const translations = {
  es: {
    nav: {
      signIn: "Iniciar sesión",
      signUp: "Comenzar gratis",
    },
    hero: {
      badge: "Gratis durante el beta",
      tagline: "Tus finanzas,\nsin fronteras.",
      sub: "Control total para directivos, emprendedores y expats que gestionan cuentas en Panamá, Estados Unidos y Europa desde un solo lugar.",
      cta: "Crear cuenta gratis",
      login: "¿Ya tienes cuenta? Inicia sesión",
    },
    features: {
      title: "Todo lo que necesitas para tus finanzas internacionales",
      items: [
        {
          title: "Importación inteligente",
          desc: "Sube estados de cuenta de cualquier banco en CSV, Excel o PDF. Si el formato no es reconocido, nuestra IA lo interpreta automáticamente.",
        },
        {
          title: "Multi-banco, multi-país",
          desc: "Consolida tus cuentas en Panamá, Estados Unidos, Europa y más en un solo dashboard. Una vista completa de tu patrimonio.",
        },
        {
          title: "Categorización automática",
          desc: "Reglas que aprenden tus patrones de gasto. Asigna categorías en masa con un clic. Menos tiempo clasificando, más tiempo decidiendo.",
        },
      ],
    },
    banks: {
      title: "Compatible con los principales bancos",
      subtitle:
        "Si tu banco no aparece en la lista, nuestra IA detecta el formato automáticamente.",
      panama: "Panamá",
      usa: "Estados Unidos",
      international: "Internacional",
    },
    cta: {
      title: "Empieza hoy. Es gratis.",
      sub: "Sin tarjeta de crédito. Sin compromisos. Cancela cuando quieras.",
      button: "Crear mi cuenta",
    },
    footer: {
      terms: "Términos y Condiciones",
      rights: "© 2025 Sort Cash. Todos los derechos reservados.",
    },
  },
  en: {
    nav: {
      signIn: "Sign in",
      signUp: "Get started free",
    },
    hero: {
      badge: "Free during beta",
      tagline: "Your finances,\nwithout borders.",
      sub: "Total control for executives, entrepreneurs, and expats managing accounts across Panama, the United States, and Europe — all in one place.",
      cta: "Create free account",
      login: "Already have an account? Sign in",
    },
    features: {
      title: "Everything you need for your international finances",
      items: [
        {
          title: "Smart import",
          desc: "Upload bank statements from any bank in CSV, Excel, or PDF. If the format isn't recognized, our AI interprets it automatically.",
        },
        {
          title: "Multi-bank, multi-country",
          desc: "Consolidate your accounts in Panama, the United States, Europe, and more in a single dashboard. A complete view of your wealth.",
        },
        {
          title: "Automatic categorization",
          desc: "Rules that learn your spending patterns. Assign categories in bulk with one click. Less time classifying, more time deciding.",
        },
      ],
    },
    banks: {
      title: "Compatible with major banks",
      subtitle:
        "If your bank isn't listed, our AI automatically detects the format.",
      panama: "Panama",
      usa: "United States",
      international: "International",
    },
    cta: {
      title: "Start today. It's free.",
      sub: "No credit card. No commitments. Cancel anytime.",
      button: "Create my account",
    },
    footer: {
      terms: "Terms & Conditions",
      rights: "© 2025 Sort Cash. All rights reserved.",
    },
  },
} as const;

export const BANKS = {
  panama: ["Banistmo", "BAC Credomatic", "Banco General", "Global Bank", "Multibank", "Scotiabank"],
  usa: ["Bank of America", "Chase", "Citibank", "Wells Fargo", "Charles Schwab", "Fidelity"],
  international: ["HSBC", "Santander", "Davivienda", "Bancolombia"],
};
