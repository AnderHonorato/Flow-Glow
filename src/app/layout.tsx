import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Provedores } from "@/components/provedores";
import "./globals.css";

const inter = Inter({
  variable: "--fonte-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--fonte-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Flow & Glow — Tutoriais de Beleza",
    template: "%s | Flow & Glow",
  },
  description:
    "Aprenda maquiagem, skincare, glow up e autoestima com os melhores tutoriais online. Transforme sua relação com o espelho.",
  keywords: ["beleza", "maquiagem", "skincare", "glow up", "autoestima", "tutoriais"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Flow & Glow",
  },
};

export default function LayoutRaiz({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
