"use client";

import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  ShoppingCart,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { CarrosselBanners } from "@/components/layout/carrossel-banners";
import { Botao, Cartao } from "@/components/ui";
import { useCarrinho } from "@/hooks/use-carrinho";
import type { TutorialCard } from "@/tipos";

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function CartaoTutorial({ item }: { item: TutorialCard }) {
  const precoAtual = item.precoPromocional || item.preco;
  const temOferta = item.destaquePromocional || item.precoPromocional;
  const { adicionarAoCarrinho, estaNoCarrinho } = useCarrinho();

  return (
    <Link href={`/tutoriais/${item.slug}`} className="group cursor-pointer">
      <Cartao className={`h-full overflow-hidden p-0 transition hover:border-[var(--color-berry)] ${item.bombando ? "ring-2 ring-[var(--color-ouro)]" : ""}`}>
        <div
          className="relative h-40 bg-cover bg-center sm:h-44"
          style={{ backgroundImage: `url(${item.imagemCapaUrl})` }}
        >
          {item.bombando && (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-berry)]/30 to-[var(--color-ouro)]/20" />
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {item.bombando && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--color-berry)] to-[var(--color-berry-escuro)] px-2.5 py-1 text-xs font-bold text-white shadow-md">
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
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              adicionarAoCarrinho({
                tutorialId: item.id,
                titulo: item.titulo,
                imagemCapaUrl: item.imagemCapaUrl,
                preco: item.preco,
                precoPromocional: item.precoPromocional,
              });
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-berry)] py-2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--color-berry-escuro)]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {estaNoCarrinho(item.id) ? "No carrinho ✓" : "Adicionar ao carrinho"}
          </button>
        </div>
      </Cartao>
    </Link>
  );
}

const imagensCategoria: Record<string, string> = {
  maquiagem: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=300&fit=crop",
  cabelo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
  unhas: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
  pele: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
  sobrancelha: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
  depilacao: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
  massagem: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
  estetica: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
};

function imagemParaCategoria(slug: string, itens: TutorialCard[]): string {
  if (imagensCategoria[slug]) return imagensCategoria[slug];
  const catItem = itens.find((i) => i.categoria.slug === slug);
  return catItem?.imagemCapaUrl || imagensCategoria.maquiagem;
}

export default function PaginaInicial() {
  const [itens, setItens] = useState<TutorialCard[]>([]);
  const [categorias, setCategorias] = useState<{ nome: string; slug: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [indiceOfertas, setIndiceOfertas] = useState(0);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const [resT, resC] = await Promise.all([
          fetch("/api/tutoriais?ordenar=recentes&limite=50", { cache: "no-store" }),
          fetch("/api/categorias", { cache: "no-store" }),
        ]);
        const dT = await resT.json();
        const dC = await resC.json();
        if (dT.sucesso) setItens(dT.dados);
        if (dC.sucesso) setCategorias(dC.dados);
      } catch {}
      setCarregando(false);
    }
    carregar();
  }, []);

  const ofertas = useMemo(
    () => itens.filter((item) => item.destaquePromocional || item.precoPromocional),
    [itens]
  );

  const ofertaDoDia = useMemo(() => {
    if (ofertas.length === 0) return itens.length > 0 ? itens[0] : null;
    const indice = Math.floor(Date.now() / 86400000) % ofertas.length;
    return ofertas[indice];
  }, [ofertas, itens]);

  const categoriasComItens = useMemo(() => {
    const mapa = new Map<string, TutorialCard[]>();
    for (const item of itens) {
      const slug = item.categoria.slug;
      if (!mapa.has(slug)) mapa.set(slug, []);
      mapa.get(slug)!.push(item);
    }
    return Array.from(mapa.entries())
      .filter(([, items]) => items.length > 0)
      .map(([slug, items]) => {
        const top = [...items]
          .sort((a, b) => {
            if (Number(b.bombando) !== Number(a.bombando)) return Number(b.bombando) - Number(a.bombando);
            return b.notaMedia - a.notaMedia;
          })
          .slice(0, 4);
        return { slug, nome: items[0].categoria.nome, topItems: top };
      });
  }, [itens]);

  const maxPaginasOfertas = useMemo(() => Math.max(0, Math.ceil(ofertas.length / 4) - 1), [ofertas]);

  if (carregando) {
    return (
      <>
        <Cabecalho />
        <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)]"
              />
            ))}
          </div>
        </main>
        <Rodape />
      </>
    );
  }

  return (
    <>
      <Cabecalho />
      <CarrosselBanners />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        {/* 1. Oferta do dia */}
        {ofertaDoDia && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-bold sm:text-xl">Oferta do dia</h2>
            <Link href={`/tutoriais/${ofertaDoDia.slug}`} className="group block">
              <Cartao className="overflow-hidden p-0 hover:border-[var(--color-berry)]">
                <div className="grid md:grid-cols-[5fr_4fr]">
                  <div
                    className="h-48 bg-cover bg-center md:h-60"
                    style={{ backgroundImage: `url(${ofertaDoDia.imagemCapaUrl})` }}
                  />
                  <div className="flex flex-col justify-center p-6">
                    <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-sage)]">
                      {ofertaDoDia.categoria.nome}
                    </span>
                    <h3 className="mt-1 text-xl font-bold leading-snug group-hover:text-[var(--color-berry)]">
                      {ofertaDoDia.titulo}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--color-texto-suave)]">
                      {ofertaDoDia.descricaoCurta}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-2xl font-bold text-[var(--color-berry)]">
                        {formatarReal(ofertaDoDia.precoPromocional || ofertaDoDia.preco)}
                      </span>
                      {ofertaDoDia.precoPromocional && (
                        <span className="text-sm text-[var(--color-texto-suave)] line-through">
                          {formatarReal(ofertaDoDia.preco)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Cartao>
            </Link>
          </section>
        )}

        {/* 2. 4 ofertas com carrossel */}
        {ofertas.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold sm:text-xl">Ofertas imperdíveis</h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setIndiceOfertas((p) => Math.max(0, p - 1))}
                  disabled={indiceOfertas === 0}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-texto)] hover:border-[var(--color-berry)] disabled:opacity-30"
                  aria-label="Ofertas anteriores"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndiceOfertas((p) => Math.min(maxPaginasOfertas, p + 1))}
                  disabled={indiceOfertas >= maxPaginasOfertas}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-texto)] hover:border-[var(--color-berry)] disabled:opacity-30"
                  aria-label="Próximas ofertas"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ofertas.slice(indiceOfertas * 4, indiceOfertas * 4 + 4).map((item) => (
                <CartaoTutorial key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* 4-7. Mais vendidos por categoria */}
        {categoriasComItens.map((cat, idx) => (
          <div key={cat.slug}>
            <section className="mb-8">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">Mais vendidos da semana</h2>
                  <p className="text-sm text-[var(--color-texto-suave)]">{cat.nome}</p>
                </div>
                <Link href={`/tutoriais?categoria=${cat.slug}`}>
                  <Botao variante="fantasma">
                    Ver mais
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Botao>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.topItems.map((item) => (
                  <CartaoTutorial key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>
        ))}

        {/* 8. Categorias */}
        {categorias.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-bold sm:text-xl">Categorias</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categorias.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tutoriais?categoria=${cat.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] p-3 hover:border-[var(--color-berry)]"
                >
                  <div
                    className="h-14 w-14 shrink-0 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${imagemParaCategoria(cat.slug, itens)})` }}
                  />
                  <span className="text-sm font-bold group-hover:text-[var(--color-berry)]">
                    {cat.nome}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Rodape />
    </>
  );
}
