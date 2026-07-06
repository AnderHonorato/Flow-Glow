import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Provedores } from "@/components/provedores";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

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
    default: "MCA Flow & Glow - Anúncios de Beleza",
    template: "%s | MCA Flow & Glow",
  },
  description:
    "Encontre anúncios de beleza, tutoriais, ofertas, atendimento próximo e experiências com compra online.",
  keywords: ["beleza", "maquiagem", "skincare", "glow up", "autoestima", "anúncios"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "MCA Flow & Glow",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
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
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const limparNosDeExtensao = () => {
                  document.querySelectorAll("#yt-ext-info-bar, .yt-ext-hidden").forEach((node) => {
                    const texto = node.textContent || "";
                    if (node.id === "yt-ext-info-bar" || texto.includes("Skipping ads")) node.remove();
                  });
                };
                limparNosDeExtensao();
                new MutationObserver(limparNosDeExtensao).observe(document.documentElement, {
                  childList: true,
                  subtree: true
                });
              })();
            `,
          }}
        />
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
