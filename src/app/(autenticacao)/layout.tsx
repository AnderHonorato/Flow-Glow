import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Conta | Flow & Glow",
};

export default function LayoutAutenticacao({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-fundo)] px-4 py-6 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden overflow-hidden rounded-lg border border-[var(--color-linha)] bg-[var(--color-texto)] text-white shadow-[0_18px_48px_rgba(42,31,28,0.16)] lg:block">
          <div
            className="h-[34rem] bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=82)",
            }}
          >
            <div className="flex h-full flex-col justify-end bg-[rgba(30,24,22,0.38)] p-8">
              <h1 className="text-4xl font-bold">Flow & Glow</h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/76">
                Entre, compre um anúncio de teste, recupere senha e valide o fluxo
                completo em poucos minutos.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 font-serif text-2xl font-bold text-[var(--color-texto)] transition-colors hover:text-[var(--color-berry)]"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-berry)] text-xs text-white">
              SG
            </span>
            Flow & Glow
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
