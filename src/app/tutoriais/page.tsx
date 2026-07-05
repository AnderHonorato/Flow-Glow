"use client";

import {
  BadgePercent,
  ChevronRight,
  Clock3,
  Flame,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Cabecalho, Rodape } from "@/components/layout";
import { BarraLocalizacao } from "@/components/layout/barra-localizacao";
import { CarrosselBanners } from "@/components/layout/carrossel-banners";
import { Botao, CampoTexto, Cartao, Modal } from "@/components/ui";
import { usePreferencias } from "@/contexto/preferencias";
import type { TutorialCard } from "@/tipos";

const opcoesOrdenacao = [
  { valor: "recentes", rotulo: "Mais recentes" },
  { valor: "preco-asc", rotulo: "Menor preço" },
  { valor: "preco-desc", rotulo: "Maior preço" },
  { valor: "distancia", rotulo: "Mais perto" },
  { valor: "avaliacao", rotulo: "Melhor avaliação" },
];

const distancias = [
  { valor: "", rotulo: "Todas" },
  { valor: "10", rotulo: "Até 10 km" },
  { valor: "25", rotulo: "Até 25 km" },
  { valor: "50", rotulo: "Até 50 km" },
  { valor: "100", rotulo: "Até 100 km" },
];

const niveis = [
  { valor: "", rotulo: "Todos" },
  { valor: "INICIANTE", rotulo: "Iniciante" },
  { valor: "INTERMEDIARIO", rotulo: "Intermediário" },
  { valor: "AVANCADO", rotulo: "Avançado" },
];

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizarPreco(valor: string): string {
  return valor.replace(/[^\d,.-]/g, "").replace(".", ",");
}

function GrupoFiltro({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-b border-[var(--color-linha)] py-4 last:border-b-0">
      <h3 className="mb-3 text-sm font-bold text-[var(--color-texto)]">{titulo}</h3>
      {children}
    </section>
  );
}

function ConteudoTutoriais() {
  const searchParams = useSearchParams();
  const { localizacao, carregandoLocalizacao, solicitarLocalizacao, erroLocalizacao } =
    usePreferencias();

  const [tutoriais, setTutoriais] = useState<TutorialCard[]>([]);
  const [categorias, setCategorias] = useState<{ nome: string; slug: string }[]>([]);
  const [busca, setBusca] = useState(searchParams.get("busca") || "");
  const [filtroCategoria, setFiltroCategoria] = useState(searchParams.get("categoria") || "");
  const [somentePromocao, setSomentePromocao] = useState(searchParams.get("promocao") === "true");
  const [somenteBombando, setSomenteBombando] = useState(searchParams.get("bombando") === "true");
  const [distanciaMax, setDistanciaMax] = useState(searchParams.get("distanciaMax") || "");
  const [nivel, setNivel] = useState(searchParams.get("nivel") || "");
  const [precoMin, setPrecoMin] = useState(searchParams.get("precoMin") || "");
  const [precoMax, setPrecoMax] = useState(searchParams.get("precoMax") || "");
  const [ordenar, setOrdenar] = useState(searchParams.get("ordenar") || "recentes");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtrosMobile, setFiltrosMobile] = useState(false);

  useEffect(() => {
    setBusca(searchParams.get("busca") || "");
    setFiltroCategoria(searchParams.get("categoria") || "");
    setSomentePromocao(searchParams.get("promocao") === "true");
    setSomenteBombando(searchParams.get("bombando") === "true");
    setDistanciaMax(searchParams.get("distanciaMax") || "");
    setNivel(searchParams.get("nivel") || "");
    setPrecoMin(searchParams.get("precoMin") || "");
    setPrecoMax(searchParams.get("precoMax") || "");
    setOrdenar(searchParams.get("ordenar") || "recentes");
  }, [searchParams]);

  useEffect(() => {
    async function carregar(silencioso = false) {
      if (!silencioso) setCarregando(true);
      setErro("");
      try {
        const params = new URLSearchParams();
        if (filtroCategoria) params.set("categoria", filtroCategoria);
        if (ordenar) params.set("ordenar", ordenar);
        if (busca.trim()) params.set("busca", busca.trim());
        if (somentePromocao) params.set("promocao", "true");
        if (somenteBombando) params.set("bombando", "true");
        if (distanciaMax) params.set("distanciaMax", distanciaMax);
        if (nivel) params.set("nivel", nivel);
        if (precoMin) params.set("precoMin", precoMin);
        if (precoMax) params.set("precoMax", precoMax);

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
      if (!silencioso) setCarregando(false);
    }

    const atraso = window.setTimeout(() => carregar(), 180);
    const intervalo = window.setInterval(() => carregar(true), 5000);
    return () => {
      window.clearTimeout(atraso);
      window.clearInterval(intervalo);
    };
  }, [
    busca,
    distanciaMax,
    filtroCategoria,
    nivel,
    ordenar,
    precoMax,
    precoMin,
    somenteBombando,
    somentePromocao,
  ]);

  const nomeCategoriaAtual = useMemo(() => {
    if (!filtroCategoria) return "Todos os anúncios";
    return categorias.find((c) => c.slug === filtroCategoria)?.nome || "Categoria";
  }, [categorias, filtroCategoria]);

  const filtrosAtivos = [
    filtroCategoria && `Categoria: ${nomeCategoriaAtual}`,
    somentePromocao && "Promoções",
    somenteBombando && "Bombando",
    distanciaMax && `Até ${distanciaMax} km`,
    nivel && niveis.find((n) => n.valor === nivel)?.rotulo,
    precoMin && `A partir de R$ ${precoMin}`,
    precoMax && `Até R$ ${precoMax}`,
  ].filter(Boolean) as string[];

  function limparFiltros() {
    setFiltroCategoria("");
    setSomentePromocao(false);
    setSomenteBombando(false);
    setDistanciaMax("");
    setNivel("");
    setPrecoMin("");
    setPrecoMax("");
    setOrdenar("recentes");
  }

  const filtros = (
    <div className="px-4 sm:px-0">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-linha)] pb-4">
        <div>
          <h2 className="text-base font-bold">Filtros</h2>
          <p className="text-xs text-[var(--color-texto-suave)]">Refine como em marketplace.</p>
        </div>
        <button
          type="button"
          onClick={limparFiltros}
          className="text-xs font-bold text-[var(--color-berry)] hover:underline"
        >
          Limpar
        </button>
      </div>

      <GrupoFiltro titulo="Categoria">
        <div className="grid gap-1">
          <button
            type="button"
            onClick={() => setFiltroCategoria("")}
            className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${
              !filtroCategoria
                ? "bg-[color-mix(in_srgb,var(--color-berry)_12%,transparent)] text-[var(--color-berry)]"
                : "text-[var(--color-texto-suave)] hover:bg-[color-mix(in_srgb,var(--color-papel)_80%,transparent)]"
            }`}
          >
            Todas
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.slug}
              type="button"
              onClick={() => setFiltroCategoria(categoria.slug)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                filtroCategoria === categoria.slug
                  ? "bg-[color-mix(in_srgb,var(--color-berry)_12%,transparent)] text-[var(--color-berry)]"
                  : "text-[var(--color-texto-suave)] hover:bg-[color-mix(in_srgb,var(--color-papel)_80%,transparent)]"
              }`}
            >
              {categoria.nome}
            </button>
          ))}
        </div>
      </GrupoFiltro>

      <GrupoFiltro titulo="Preço">
        <div className="grid grid-cols-2 gap-2">
          <input
            value={precoMin}
            onChange={(e) => setPrecoMin(normalizarPreco(e.target.value))}
            placeholder="Mín."
            className="h-10 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 text-sm outline-none focus:border-[var(--color-berry)]"
          />
          <input
            value={precoMax}
            onChange={(e) => setPrecoMax(normalizarPreco(e.target.value))}
            placeholder="Máx."
            className="h-10 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 text-sm outline-none focus:border-[var(--color-berry)]"
          />
        </div>
      </GrupoFiltro>

      <GrupoFiltro titulo="Ofertas">
        <div className="grid gap-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--color-texto)]">
            <input
              type="checkbox"
              checked={somentePromocao}
              onChange={(e) => setSomentePromocao(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-berry)]"
            />
            Promoções e descontos
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--color-texto)]">
            <input
              type="checkbox"
              checked={somenteBombando}
              onChange={(e) => setSomenteBombando(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-berry)]"
            />
            Bombando
          </label>
        </div>
      </GrupoFiltro>

      <GrupoFiltro titulo="Distância">
        <div className="mb-3">
          <Botao
            type="button"
            variante={localizacao ? "secundario" : "contorno"}
            tamanho="pequeno"
            onClick={solicitarLocalizacao}
            carregando={carregandoLocalizacao}
            className="w-full justify-center"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            {localizacao ? "Localização ativa" : "Usar localização"}
          </Botao>
          {erroLocalizacao && <p className="mt-2 text-xs text-red-600">{erroLocalizacao}</p>}
        </div>
        <div className="grid gap-1">
          {distancias.map((opcao) => (
            <button
              key={opcao.rotulo}
              type="button"
              onClick={() => setDistanciaMax(opcao.valor)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                distanciaMax === opcao.valor
                  ? "bg-[color-mix(in_srgb,var(--color-sage)_12%,transparent)] text-[var(--color-sage)]"
                  : "text-[var(--color-texto-suave)] hover:bg-[color-mix(in_srgb,var(--color-papel)_80%,transparent)]"
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
      </GrupoFiltro>

      <GrupoFiltro titulo="Nível">
        <div className="grid gap-1">
          {niveis.map((opcao) => (
            <button
              key={opcao.rotulo}
              type="button"
              onClick={() => setNivel(opcao.valor)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                nivel === opcao.valor
                  ? "bg-[color-mix(in_srgb,var(--color-ouro)_16%,transparent)] text-[var(--color-texto)]"
                  : "text-[var(--color-texto-suave)] hover:bg-[color-mix(in_srgb,var(--color-papel)_80%,transparent)]"
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
      </GrupoFiltro>
    </div>
  );

  return (
    <>
      <Cabecalho />
      <BarraLocalizacao />
      <CarrosselBanners />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="divisoria-curva mb-5 border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_82%,transparent)] p-4 backdrop-blur-md sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Vitrine
              </span>
              <h1 className="mt-1 text-2xl font-bold sm:text-4xl">{nomeCategoriaAtual}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-texto-suave)]">
                Busque por serviço, cidade, cupom ou conteúdo e refine pelos filtros.
              </p>
            </div>
            <CampoTexto
              rotulo="Buscar"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Ex.: pele, noivas, São Paulo, GLOW20"
              icone={<Search className="h-4 w-4" aria-hidden />}
            />
          </div>
        </section>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltrosMobile(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2 text-sm font-bold md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filtros
            </button>
            {filtrosAtivos.map((filtro) => (
              <span
                key={filtro}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-papel)] px-3 py-1.5 text-xs font-bold text-[var(--color-texto)] ring-1 ring-[var(--color-linha)]"
              >
                {filtro}
              </span>
            ))}
            {filtrosAtivos.length > 0 && (
              <button
                type="button"
                onClick={limparFiltros}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-bold text-[var(--color-berry)] hover:underline"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                limpar
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-texto-suave)]">
            Ordenar
            <select
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value)}
              className="h-10 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 text-sm font-bold text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
            >
              {opcoesOrdenacao.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-[16rem_1fr] lg:grid-cols-[18rem_1fr]">
          <aside className="divisoria-curva hidden h-fit border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_84%,transparent)] p-4 backdrop-blur-md md:block">
            {filtros}
          </aside>

          <section>
            {erro && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {erro}
              </div>
            )}

            {carregando ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, indice) => (
                  <div
                    key={indice}
                    className="h-64 animate-pulse rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)]"
                  />
                ))}
              </div>
            ) : tutoriais.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-4 py-12 text-center">
                <Sparkles className="mx-auto mb-3 h-6 w-6 text-[var(--color-berry)]" aria-hidden />
                <h2 className="text-lg font-bold">Nenhum anúncio encontrado</h2>
                <p className="mt-2 text-sm text-[var(--color-texto-suave)]">
                  Tente remover um filtro ou buscar por outro termo.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tutoriais.map((tutorial) => {
                  const precoAtual = tutorial.precoPromocional || tutorial.preco;
                  const temPromocao =
                    Boolean(tutorial.precoPromocional) || tutorial.destaquePromocional;

                  return (
                    <Link key={tutorial.id} href={`/tutoriais/${tutorial.slug}`} className="group">
                      <Cartao className="h-full overflow-hidden p-0 hover:border-[var(--color-berry)]">
                        <div
                          className="relative h-40 bg-cover bg-center sm:h-44"
                          style={{ backgroundImage: `url(${tutorial.imagemCapaUrl})` }}
                        >
                          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                            {tutorial.bombando && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-berry)] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                <Flame className="h-3.5 w-3.5" aria-hidden />
                                Bombando
                              </span>
                            )}
                            {temPromocao && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[var(--color-berry)] shadow-sm">
                                <BadgePercent className="h-3.5 w-3.5" aria-hidden />
                                Promo
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
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-texto-suave)]">
                                <MapPin className="h-3.5 w-3.5" aria-hidden />
                                {tutorial.distanciaKm} km
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold leading-snug group-hover:text-[var(--color-berry)]">
                            {tutorial.titulo}
                          </h3>
                          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-[var(--color-texto-suave)]">
                            {tutorial.descricaoCurta}
                          </p>

                          <div className="mt-4 flex items-end justify-between gap-3">
                            <div>
                              <p className="text-lg font-bold text-[var(--color-texto)]">
                                {formatarReal(precoAtual)}
                              </p>
                              {tutorial.precoPromocional && (
                                <p className="text-xs font-medium text-[var(--color-texto-suave)] line-through">
                                  {formatarReal(tutorial.preco)}
                                </p>
                              )}
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[color-mix(in_srgb,var(--color-papel)_78%,transparent)] px-2 py-1 text-xs font-semibold text-[var(--color-texto-suave)]">
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
          </section>
        </div>
      </main>
      <Rodape />

      <Modal
        aberto={filtrosMobile}
        titulo="Filtros"
        descricao="Refine sua busca."
        onFechar={() => setFiltrosMobile(false)}
      >
        {filtros}
        <Botao className="mt-4 w-full" onClick={() => setFiltrosMobile(false)}>
          Ver resultados
        </Botao>
      </Modal>
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
