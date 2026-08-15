import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og-image.jpg`;

  return {
    title: "Outro Cérebro — Seu espaço privado para pensar",
    description: "Memória externa, raciocínio, conexões e foco em um espaço privado para suas ideias.",
    manifest: "/manifest.webmanifest",
    icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/apple-icon.png" },
    openGraph: {
      title: "Outro Cérebro",
      description: "Seu espaço privado para pensar.",
      locale: "pt_BR",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "Outro Cérebro — Seu espaço privado para pensar" }],
    },
    twitter: { card: "summary_large_image", title: "Outro Cérebro", description: "Seu espaço privado para pensar.", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
