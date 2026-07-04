"use client";

import {
  BadgePercent,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Cabecalho, Rodape } from "@/components/layout";
import { Botao, Cartao, CampoTexto } from "@/components/ui";
import type { TutorialCard } from "@/tipos";

const opcoesOrdenacao = [
  { valor: "recentes", rotulo: "Recentes" },
  { valor: "preco-asc", rotulo: "Menor preço" },
  { valor: "preco-desc", rotulo: "Maior preço" },
  { valor: "distancia", rotulo: "Mais perto" },
];

const distancias = [
  { valor: "", rotulo: "Todas" },
  { valor: "10", rotulo: "Até 10 km" },
  { valor: "25", rotulo: "Até 25 km" },
  { valor: "100", rotulo: "Até 100 km" },
];

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function ConteudoTutoriais() {
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get("categoria") || "";
  const promocaoParam = searchParams.get("promocao") === "true";

  const [tutoriais, setTutoriais] = useState<TutorialCard[]>([]);
  const [categorias, setCategorias] = useState<{ nome: string; slug: string }[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState(categoriaParam);
  const [somentePromocao, setSomentePromocao] = useState(promocaoParam);
  const [distanciaMax, setDistanciaMax] = useState("");
  const [ordenar, setOrdenar] = useState("recentes");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setFiltroCategoria(categoriaParam);
    setSomentePromocao(promocaoParam);
  }, [categoriaParam, promocaoParam]);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const params = new URLSearchParams();
        if (filtroCategoria) params.set("categoria", filtroCategoria);
        if (ordenar) params.set("ordenar", ordenar);
        if (busca.trim()) params.set("busca", busca.trim());
        if (somentePromocao) params.set("promocao", "true");
        if (distanciaMax) params.set("distanciaMax", distanciaMax);

        const [resTutoriais, resCategorias] = await Promise.all([
          fetch(`/api/tutoriais?${params.toString()}`),
          fetch("/api/categorias"),
        ]);

        const dadosT = await resTutoriais.json();
        const dadosC = await resCategorias.json();

        if (dadosT.sucesso) setTutoriais(dadosT.dados);
        else setErro(dadosT.erro || "Erro ao carregar anúncios.");

        if (dadosC.sucesso) setCategorias(dadosC.dados);
      } catch {
        setErro("Não foi possível carregar os anúncios agora.");
      }
      setCarregando(false);
    }

    const atraso = window.setTimeout(carregar, 180);
    return () => window.clearTimeout(atraso);
  }, [busca, distanciaMax, filtroCategoria, ordenar, somentePromocao]);

  const nomeCategoriaAtual = useMemo(() => {
    if (!filtroCategoria) return "Todos os anúncios";
    return categorias.find((c) => c.slug === filtroCategoria)?.nome || "Categoria";
  }, [categorias, filtroCategoria]);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-4 py-5 sm:px-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Vitrine
              </span>
              <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{nomeCategoriaAtual}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-texto)]/62">
                Use os filtros para testar promoções, cupons, busca e distância.
                Cada card abre uma página única do anúncio.
              </p>
            </div>
            <CampoTexto
              rotulo="Buscar anúncio"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Ex.: pele, noivas, São Paulo"
              icone={<Search className="h-4 w-4" aria-hidden />}
            />
          </div>
        </section>

        <section className="mb-7 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFiltroCategoria("")}
              className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                !filtroCategoria
                  ? "border-[var(--color-berry)] bg-[var(--color-berry)] text-white"
                  : "border-[var(--color-linha)] bg-white text-[var(--color-texto)]/72 hover:border-[var(--color-berry)]"
              }`}
            >
              Todas
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria.slug}
                type="button"
                onClick={() => setFiltroCategoria(categoria.slug)}
                className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                  filtroCategoria === categoria.slug
                    ? "border-[var(--color-berry)] bg-[var(--color-berry)] text-white"
                    : "border-[var(--color-linha)] bg-white text-[var(--color-texto)]/72 hover:border-[var(--color-berry)]"
                }`}
              >
                {categoria.nome}
              </button>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-wrap gap-2">
              {opcoesOrdenacao.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setOrdenar(opcao.valor)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    ordenar === opcao.valor
                      ? "border-[var(--color-sage)] bg-[var(--color-sage)] text-white"
                      : "border-[var(--color-linha)] bg-white text-[var(--color-texto)]/72 hover:border-[var(--color-sage)]"
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSomentePromocao((valor) => !valor)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                  somentePromocao
                    ? "border-[var(--color-berry)] bg-[var(--color-berry)] text-white"
                    : "border-[var(--color-linha)] bg-white text-[var(--color-texto)]/72 hover:border-[var(--color-berry)]"
                }`}
              >
                <BadgePercent className="h-4 w-4" aria-hidden />
                Promoções
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {distancias.map((opcao) => (
                <button
                  key={opcao.rotulo}
                  type="button"
                  onClick={() => setDistanciaMax(opcao.valor)}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    distanciaMax === opcao.valor
                      ? "border-[var(--color-ouro)] bg-[var(--color-ouro)] text-white"
                      : "border-[var(--color-linha)] bg-white text-[var(--color-texto)]/72 hover:border-[var(--color-ouro)]"
                  }`}
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>
        </section>

        {erro && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, indice) => (
              <div
                key={indice}
                className="h-80 animate-pulse rounded-lg border border-[var(--color-linha)] bg-white"
              />
            ))}
          </div>
        ) : tutoriais.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-linha-forte)] bg-white px-4 py-12 text-center">
            <Sparkles className="mx-auto mb-3 h-6 w-6 text-[var(--color-berry)]" aria-hidden />
            <h2 className="text-lg font-bold">Nenhum anúncio encontrado</h2>
            <p className="mt-2 text-sm text-[var(--color-texto)]/60">
              Tente remover um filtro ou buscar por outro termo.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tutoriais.map((tutorial) => {
              const precoAtual = tutorial.precoPromocional || tutorial.preco;
              const temPromocao =
                Boolean(tutorial.precoPromocional) || tutorial.destaquePromocional;

              return (
                <Link key={tutorial.id} href={`/tutoriais/${tutorial.slug}`} className="group">
                  <Cartao className="h-full overflow-hidden p-0 hover:-translate-y-0.5 hover:border-[var(--color-berry)]">
                    <div
                      className="relative h-44 bg-cover bg-center"
                      style={{ backgroundImage: `url(${tutorial.imagemCapaUrl})` }}
                    >
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {temPromocao && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-bold text-[var(--color-berry)] shadow-sm">
                            <BadgePercent className="h-3.5 w-3.5" aria-hidden />
                            Promo
                          </span>
                        )}
                        {tutorial.cupomDesconto && (
                          <span className="rounded-md bg-[var(--color-texto)] px-2 py-1 text-xs font-bold text-white shadow-sm">
                            {tutorial.cupomDesconto}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-sage)]">
                          {tutorial.categoria.nome}
                        </span>
                        {tutorial.distanciaKm !== null && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-texto)]/55">
                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                            {tutorial.distanciaKm} km
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold leading-snug group-hover:text-[var(--color-berry)]">
                        {tutorial.titulo}
                      </h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-[var(--color-texto)]/60">
                        {tutorial.descricaoCurta}
                      </p>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-[var(--color-texto)]">
                            {formatarReal(precoAtual)}
                          </p>
                          {tutorial.precoPromocional && (
                            <p className="text-xs font-medium text-[var(--color-texto)]/42 line-through">
                              {formatarReal(tutorial.preco)}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-papel)] px-2 py-1 text-xs font-semibold text-[var(--color-texto)]/62">
                          {tutorial.totalAvaliacoes > 0 ? (
                            <>
                              <Star className="h-3.5 w-3.5 fill-[var(--color-ouro)] text-[var(--color-ouro)]" aria-hidden />
                              {tutorial.notaMedia.toFixed(1)}
                            </>
                          ) : (
                            <>
                              <Clock3 className="h-3.5 w-3.5" aria-hidden />
                              Novo
                            </>
                          )}
                        </span>
                      </div>

                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-berry)]">
                        Abrir anúncio
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </div>
                    </div>
                  </Cartao>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Rodape />
    </>
  );
}

export default function PaginaTutoriais() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-linha)] border-t-[var(--color-berry)]" />
        </div>
      }
    >
      <ConteudoTutoriais />
    </Suspense>
  );
}
