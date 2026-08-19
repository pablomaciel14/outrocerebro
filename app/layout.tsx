import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWARegister } from "./PWARegister";

// Configuração da fonte geométrica sem serifa (Inter) para alta legibilidade
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Outro Cérebro | Gestão Jurídica",
  description: "Sistema proprietário de gestão de processos, acervo e prazos estratégicos.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/apple-icon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-800 antialiased`}>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
