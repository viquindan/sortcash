"use client";

import Link from "next/link";
import { LogoFull } from "@/components/ui/Logo";
import { useLang } from "@/lib/i18n/useLang";

const content = {
  es: {
    title: "Términos y Condiciones",
    updated: "Última actualización: mayo de 2025",
    back: "Volver al inicio",
    sections: [
      {
        title: "1. Aceptación de los términos",
        body: "Al crear una cuenta en Sort Cash y utilizar nuestros servicios, aceptas los presentes Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno de estos términos, no debes utilizar el servicio. Sort Cash se reserva el derecho de modificar estos términos en cualquier momento, notificando a los usuarios por correo electrónico.",
      },
      {
        title: "2. Descripción del servicio",
        body: "Sort Cash es una plataforma de gestión financiera personal diseñada para profesionales internacionales con cuentas en múltiples países. El servicio permite importar estados de cuenta bancarios, categorizar transacciones, visualizar patrones de gasto e ingreso, y obtener una visión consolidada de sus finanzas. El servicio se ofrece de forma gratuita durante el período beta.",
      },
      {
        title: "3. Registro y seguridad de la cuenta",
        body: "Debes proporcionar una dirección de correo electrónico válida y una contraseña segura. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades que ocurran bajo tu cuenta. Sort Cash no se hace responsable por pérdidas derivadas del uso no autorizado de tu cuenta. Debes notificarnos de inmediato ante cualquier acceso no autorizado.",
      },
      {
        title: "4. Información que recopilamos",
        body: "Recopilamos: (a) información de registro como tu dirección de correo electrónico; (b) estados de cuenta y datos de transacciones que tú decides subir voluntariamente al servicio; (c) datos de uso del servicio como frecuencia de acceso y funciones utilizadas. No recopilamos información de pago, credenciales bancarias ni acceso directo a tus cuentas bancarias.",
      },
      {
        title: "5. Uso de tu información",
        body: "Tu información es utilizada para: (a) proveer y mejorar el servicio de gestión financiera personal; (b) análisis estadístico y comercial con datos agregados y anonimizados — esto significa que nunca se comparte información que te identifique individualmente; (c) desarrollo de nuevas funcionalidades y mejoras del producto; (d) comunicarte actualizaciones importantes del servicio.",
      },
      {
        title: "6. Privacidad y compartición de datos",
        body: "Sort Cash no vende ni comparte tu información personal identificable con terceros sin tu autorización expresa. Datos agregados y anonimizados (sin posibilidad de identificar a usuarios individuales) pueden ser utilizados con fines comerciales, de investigación de mercado o para mejorar el servicio. Podemos compartir información con proveedores de servicios técnicos (como hosting o base de datos) bajo contratos de confidencialidad estrictos.",
      },
      {
        title: "7. Tus derechos sobre tus datos",
        body: "Tienes derecho a: (a) acceder a todos los datos personales que tenemos sobre ti; (b) solicitar la corrección de datos inexactos; (c) solicitar la eliminación completa de tu cuenta y todos tus datos; (d) exportar tus datos en formato estándar. Para ejercer cualquiera de estos derechos, escríbenos a info@sortcash.org.",
      },
      {
        title: "8. Seguridad",
        body: "Implementamos medidas de seguridad técnicas y organizativas para proteger tu información, incluyendo cifrado de contraseñas, tokens JWT con expiración, y conexiones HTTPS. Sin embargo, ningún sistema es completamente invulnerable. Recomendamos usar contraseñas únicas y seguras.",
      },
      {
        title: "9. Limitación de responsabilidad",
        body: "Sort Cash se proporciona 'tal como está', sin garantías de ningún tipo. No somos responsables por pérdidas financieras, decisiones tomadas en base a los datos del servicio, interrupciones del servicio, o errores en el procesamiento de tus estados de cuenta. El usuario es el único responsable de las decisiones financieras que tome.",
      },
      {
        title: "10. Ley aplicable y jurisdicción",
        body: "Estos términos se rigen por las leyes de la República de Panamá. Cualquier disputa será resuelta ante los tribunales competentes de la Ciudad de Panamá. Para consultas o reclamos, contáctanos en info@sortcash.org.",
      },
    ],
  },
  en: {
    title: "Terms & Conditions",
    updated: "Last updated: May 2025",
    back: "Back to home",
    sections: [
      {
        title: "1. Acceptance of Terms",
        body: "By creating an account on Sort Cash and using our services, you agree to these Terms and Conditions in their entirety. If you disagree with any of these terms, you must not use the service. Sort Cash reserves the right to modify these terms at any time, notifying users by email.",
      },
      {
        title: "2. Service Description",
        body: "Sort Cash is a personal financial management platform designed for international professionals with accounts in multiple countries. The service allows you to import bank statements, categorize transactions, visualize spending and income patterns, and obtain a consolidated view of your finances. The service is offered free of charge during the beta period.",
      },
      {
        title: "3. Account Registration and Security",
        body: "You must provide a valid email address and a secure password. You are responsible for maintaining the confidentiality of your access credentials and for all activities that occur under your account. Sort Cash is not responsible for losses resulting from unauthorized use of your account. You must notify us immediately of any unauthorized access.",
      },
      {
        title: "4. Information We Collect",
        body: "We collect: (a) registration information such as your email address; (b) bank statements and transaction data that you voluntarily choose to upload to the service; (c) service usage data such as access frequency and features used. We do not collect payment information, banking credentials, or direct access to your bank accounts.",
      },
      {
        title: "5. How We Use Your Information",
        body: "Your information is used to: (a) provide and improve the personal financial management service; (b) statistical and commercial analysis with aggregated and anonymized data — this means information that individually identifies you is never shared; (c) develop new features and product improvements; (d) communicate important service updates to you.",
      },
      {
        title: "6. Privacy and Data Sharing",
        body: "Sort Cash does not sell or share your personally identifiable information with third parties without your express authorization. Aggregated and anonymized data (with no ability to identify individual users) may be used for commercial purposes, market research, or to improve the service. We may share information with technical service providers (such as hosting or database services) under strict confidentiality agreements.",
      },
      {
        title: "7. Your Data Rights",
        body: "You have the right to: (a) access all personal data we hold about you; (b) request correction of inaccurate data; (c) request complete deletion of your account and all your data; (d) export your data in a standard format. To exercise any of these rights, write to us at info@sortcash.org.",
      },
      {
        title: "8. Security",
        body: "We implement technical and organizational security measures to protect your information, including password encryption, expiring JWT tokens, and HTTPS connections. However, no system is completely invulnerable. We recommend using unique, strong passwords.",
      },
      {
        title: "9. Limitation of Liability",
        body: "Sort Cash is provided 'as is', without warranties of any kind. We are not responsible for financial losses, decisions made based on service data, service interruptions, or errors in processing your bank statements. The user is solely responsible for any financial decisions they make.",
      },
      {
        title: "10. Governing Law and Jurisdiction",
        body: "These terms are governed by the laws of the Republic of Panama. Any dispute shall be resolved before the competent courts of Panama City. For inquiries or complaints, contact us at info@sortcash.org.",
      },
    ],
  },
};

export default function TermsPage() {
  const { lang, setLang } = useLang();
  const tr = content[lang];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <LogoFull />
          </Link>
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="text-xs font-semibold text-muted hover:text-text transition-colors px-3 py-1.5 rounded-md border border-border"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-10"
        >
          ← {tr.back}
        </Link>

        <h1 className="text-4xl font-bold text-navy mb-2">{tr.title}</h1>
        <p className="text-muted text-sm mb-12">{tr.updated}</p>

        <div className="space-y-10">
          {tr.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-base font-bold text-navy mb-3">{section.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted">
            {lang === "es"
              ? "¿Preguntas? Escríbenos a "
              : "Questions? Write to us at "}
            <a
              href="mailto:info@sortcash.org"
              className="text-accent hover:underline"
            >
              info@sortcash.org
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
