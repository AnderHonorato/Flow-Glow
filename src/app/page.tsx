"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { CarrosselBanners } from "@/components/layout/carrossel-banners";
import { Botao, Cartao } from "@/components/ui";

const categorias = [
  { nome: "Maquiagem", slug: "maquiagem" },
  { nome: "Skincare", slug: "skincare" },
  { nome: "Sobrancelha", slug: "sobrancelha" },
  { nome: "Cabelo", slug: "cabelo" },
  { nome: "Unhas", slug: "unhas" },
  { nome: "Noivas", slug: "noivas" },
];

export default function PaginaInicial() {
  const [ofertasAtivas, setOfertasAtivas] = useState(0);

  useEffect(() => {
    fetch("/api/tutoriais?ordenar=recentes")
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso) {
          const ofertas = d.dados.filter(
            (item: { destaquePromocional?: boolean; precoPromocional?: number | null }) =>
              item.destaquePromocional || item.precoPromocional
          ).length;
          setOfertasAtivas(ofertas);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Cabecalho />
      <CarrosselBanners />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Categorias */}
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">Explore por categoria</h2>
              <p className="text-sm text-[var(--color-texto-suave)]">
                {ofertasAtivas > 0
                  ? `${ofertasAtivas} ofertas ativas agora`
                  : "Encontre o tutorial ideal para você"}
              </p>
            </div>
            <Link href="/tutoriais" className="hidden sm:inline-flex">
              <Botao variante="fantasma">
                Ver catálogo <ChevronRight className="h-4 w-4" />
              </Botao>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {categorias.map((cat) => (
              <Link key={cat.slug} href={`/tutoriais?categoria=${cat.slug}`}>
                <Cartao className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center hover:border-[var(--color-berry)] transition-colors cursor-pointer">
                  <Sparkles className="h-5 w-5 text-[var(--color-berry)]" />
                  <span className="text-sm font-semibold">{cat.nome}</span>
                </Cartao>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="rounded-2xl bg-[#2a211d] p-8 text-center text-white sm:p-12">
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">
            Pronta para transformar sua relação com o espelho?
          </h2>
          <p className="mt-3 text-white/60">
            Junte-se a milhares de alunas que já elevaram sua autoestima.
          </p>
          <Link href="/tutoriais" className="mt-6 inline-block">
            <Botao variante="secundario" tamanho="grande">
              Explorar tutoriais
            </Botao>
          </Link>
        </section>
      </main>

      <Rodape />
    </>
  );
}
