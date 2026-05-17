import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";


const cormorantGaramond = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-cormorant-garamond'
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: '--font-dm-sans'
});

export const metadata: Metadata = {
  title: "Sort Cash | Tus finanzas, sin fronteras",
  description: "Control total de tus finanzas para profesionales internacionales con cuentas en múltiples países.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${cormorantGaramond.variable} ${dmSans.variable} font-sans`} suppressHydrationWarning>
          {children}
        </body>
      </html>
  );
}

