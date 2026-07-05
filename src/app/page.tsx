"use client";

import {
  BadgePercent,
  ChevronRight,
  Clock3,
  Flame,
  ShoppingBag,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { Botao, Cartao } from "@/components/ui";
import type { TutorialCard } from "@/tipos";

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PaginaInicial() {
  const [itens, setItens] = useState<TutorialCard[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState("");

  async function carregar(silencioso = false) {
    if (!silencioso) setCarregando(true);
    try {
      const resposta = await fetch("/api/tutoriais?ordenar=recentes", { cache: "no-store" });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setItens(dados.dados);
        setAtualizadoEm(
          new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        );
      }
    } catch {}
    if (!silencioso) setCarregando(false);
  }

  useEffect(() => {
    carregar();
    const intervalo = window.setInterval(() => carregar(true), 5000);
    return () => window.clearInterval(intervalo);
  }, []);

  const destaques = [...itens]
    .sort((a, b) => Number(b.bombando) - Number(a.bombando))
    .slice(0, 6);
  const ofertasAtivas = itens.filter(
    (item) => item.destaquePromocional || item.precoPromocional
  ).length;

  return (
    <>
      <Cabecalho />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="divisoria-curva liquid-glass mb-5 p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Vitrine ao vivo
              </span>
              <h1 className="mt-1 text-2xl font-bold sm:text-4xl">
                Anuncios de beleza em destaque
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-texto-suave)]">
                Os itens aparecem direto na entrada. Use a busca do cabecalho para encontrar
                servico, cidade, tecnica ou oferta.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <p className="rounded-full bg-[var(--color-papel)] px-3 py-1.5 text-xs font-bold text-[var(--color-texto-suave)] ring-1 ring-[var(--color-linha)]">
                Atualizado {atualizadoEm || "agora"}
              </p>
              <p className="rounded-full bg-[var(--color-papel)] px-3 py-1.5 text-xs font-bold text-[var(--color-texto-suave)] ring-1 ring-[var(--color-linha)]">
                {ofertasAtivas} ofertas ativas
              </p>
            </div>
          </div>
        </section>

        {carregando ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)]"
              />
            ))}
          </div>
        ) : (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">Itens em destaque</h2>
                <p className="text-sm text-[var(--color-texto-suave)]">
                  Fotos, preco, distancia, conteudo e raspadinha ficam dentro do anuncio.
                </p>
              </div>
              <Link href="/tutoriais" className="hidden sm:inline-flex">
                <Botao variante="fantasma">
                  Ver catalogo
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Botao>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destaques.map((item) => {
                const precoAtual = item.precoPromocional || item.preco;
                const temOferta = item.destaquePromocional || item.precoPromocional;

                return (
                  <Link key={item.id} href={`/tutoriais/${item.slug}`} className="group">
                    <Cartao className="h-full overflow-hidden p-0 hover:border-[var(--color-berry)]">
                      <div
                        className="relative h-44 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.imagemCapaUrl})` }}
                      >
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          {item.bombando && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-berry)] px-2.5 py-1 text-xs font-bold text-white">
                              <Flame className="h-3.5 w-3.5" aria-hidden />
                              Bombando
                            </span>
                          )}
                          {temOferta && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[var(--color-berry)]">
                              <BadgePercent className="h-3.5 w-3.5" aria-hidden />
                              Oferta
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex justify-between gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-sage)]">
                          <span>{item.categoria.nome}</span>
                          {item.distanciaKm !== null && <span>{item.distanciaKm} km</span>}
                        </div>
                        <h3 className="text-lg font-bold leading-snug group-hover:text-[var(--color-berry)]">
                          {item.titulo}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-texto-suave)]">
                          {item.descricaoCurta}
                        </p>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold">{formatarReal(precoAtual)}</p>
                            {item.precoPromocional && (
                              <p className="text-xs text-[var(--color-texto-suave)] line-through">
                                {formatarReal(item.preco)}
                              </p>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-papel)] px-2 py-1 text-xs font-bold text-[var(--color-texto-suave)] ring-1 ring-[var(--color-linha)]">
                            {item.totalAvaliacoes > 0 ? (
                              <>
                                <Star className="h-3.5 w-3.5 fill-[var(--color-ouro)] text-[var(--color-ouro)]" aria-hidden />
                                {item.notaMedia.toFixed(1)}
                              </>
                            ) : (
                              <>
                                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                                Novo
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </Cartao>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Rodape />
    </>
  );
}
