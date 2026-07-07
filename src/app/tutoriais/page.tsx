"use client";

import {
  BadgePercent,
  ChevronRight,
  Clock3,
  Flame,
  MapPin,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Cabecalho, Rodape } from "@/components/layout";
import { BotaoFavorito } from "@/components/favoritos/botao-favorito";
import { Botao, CampoTexto, Cartao, Modal } from "@/components/ui";
import { useCarrinho } from "@/hooks/use-carrinho";
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

function SkeletonCardCatalogo() {
  return (
    <Cartao className="h-full overflow-hidden p-0">
      <div className="skeleton h-36 sm:h-44" />
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-3 w-12 rounded-full" />
        </div>
        <div className="skeleton h-5 w-4/5 rounded-md" />
        <div className="mt-2 space-y-1.5">
          <div className="skeleton h-3 w-full rounded-full" />
          <div className="skeleton h-3 w-2/3 rounded-full" />
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="skeleton h-5 w-24 rounded-md" />
            <div className="skeleton mt-1.5 h-3 w-16 rounded-full" />
          </div>
          <div className="skeleton h-7 w-16 rounded-lg" />
        </div>
        <div className="skeleton mt-4 h-8 w-full rounded-lg" />
      </div>
    </Cartao>
  );
}

function SkeletonVitrine() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <section className="divisoria-curva mb-5 border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_82%,transparent)] p-4 backdrop-blur-md sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <div className="skeleton h-4 w-24 rounded-full" />
              <div className="skeleton mt-3 h-8 w-56 rounded-md sm:h-10" />
              <div className="skeleton mt-3 h-3 w-full max-w-xl rounded-full" />
            </div>
            <div className="skeleton h-11 rounded-full" />
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-[16rem_1fr] lg:grid-cols-[18rem_1fr]">
          <aside className="divisoria-curva hidden border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_84%,transparent)] p-4 md:block">
            <div className="skeleton h-5 w-24 rounded-md" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mt-5 border-t border-[var(--color-linha)] pt-4">
                <div className="skeleton h-4 w-20 rounded-full" />
                <div className="mt-3 space-y-2">
                  <div className="skeleton h-9 rounded-lg" />
                  <div className="skeleton h-9 rounded-lg" />
                </div>
              </div>
            ))}
          </aside>
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="skeleton h-10 w-28 rounded-lg md:hidden" />
              <div className="skeleton ml-auto h-10 w-40 rounded-lg" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, indice) => (
                <SkeletonCardCatalogo key={indice} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Rodape />
    </>
  );
}

function ConteudoTutoriais() {
  const searchParams = useSearchParams();
  const { adicionarAoCarrinho, estaNoCarrinho } = useCarrinho();
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
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

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
        params.set("pagina", String(pagina));
        params.set("limite", "12");
        const cacheKey = `mca_catalogo_cache_${params.toString()}`;
        let cacheRestaurado = false;

        try {
          const cache = sessionStorage.getItem(cacheKey);
          if (cache) {
            const dadosCache = JSON.parse(cache) as {
              tutoriais: TutorialCard[];
              totalPaginas: number;
            };
            setTutoriais(dadosCache.tutoriais || []);
            setTotalPaginas(dadosCache.totalPaginas || 1);
            setCarregando(false);
            cacheRestaurado = true;
          }
        } catch {}

        if (!silencioso && !cacheRestaurado) setCarregando(true);

        const [resTutoriais, resCategorias] = await Promise.all([
          fetch(`/api/tutoriais?${params.toString()}`),
          fetch("/api/categorias"),
        ]);

        const dadosT = await resTutoriais.json();
        const dadosC = await resCategorias.json();

        if (dadosT.sucesso) {
          setTutoriais(dadosT.dados);
          setTotalPaginas(dadosT.totalPaginas || 1);
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                tutoriais: dadosT.dados,
                totalPaginas: dadosT.totalPaginas || 1,
              })
            );
          } catch {}
        } else setErro(dadosT.erro || "Erro ao carregar anúncios.");

        if (dadosC.sucesso) setCategorias(dadosC.dados);
      } catch {
        setErro("Não foi possível carregar os anúncios agora.");
      }
      if (!silencioso) setCarregando(false);
    }

    const atraso = window.setTimeout(() => carregar(), 180);
    return () => {
      window.clearTimeout(atraso);
    };
  }, [
    busca,
    distanciaMax,
    filtroCategoria,
    nivel,
    ordenar,
    pagina,
    precoMax,
    precoMin,
    somenteBombando,
    somentePromocao,
  ]);

  // Reseta para página 1 quando os filtros mudam
  useEffect(() => { setPagina(1); }, [
    busca, distanciaMax, filtroCategoria, nivel, ordenar, precoMax, precoMin, somenteBombando, somentePromocao,
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
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <section className="divisoria-curva mb-5 border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_82%,transparent)] p-4 backdrop-blur-md sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                Vitrine
              </span>
              <h1 className="mt-1 text-xl font-bold sm:text-4xl">{nomeCategoriaAtual}</h1>
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
              variante="busca"
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
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, indice) => (
                  <SkeletonCardCatalogo key={indice} />
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
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {tutoriais.map((tutorial) => {
                  const precoAtual = tutorial.precoPromocional || tutorial.preco;
                  const temPromocao =
                    Boolean(tutorial.precoPromocional) || tutorial.destaquePromocional;

                  return (
                    <Link key={tutorial.id} href={`/tutoriais/${tutorial.slug}`} className="group">
                      <Cartao className="h-full overflow-hidden p-0 hover:border-[var(--color-berry)]">
                        <div
                              className="relative h-36 bg-cover bg-center sm:h-44"
                          style={{ backgroundImage: `url(${tutorial.imagemCapaUrl})` }}
                        >
                          <div className="absolute right-3 top-3 z-10">
                            <BotaoFavorito tutorialId={tutorial.id} compacto />
                          </div>
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

                        <div className="p-3 sm:p-4">
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
                          <h3 className="text-base font-bold leading-snug group-hover:text-[var(--color-berry)] sm:text-lg">
                            {tutorial.titulo}
                          </h3>
                          <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-relaxed text-[var(--color-texto-suave)] sm:min-h-10 sm:text-sm">
                            {tutorial.descricaoCurta}
                          </p>

                          <div className="mt-3 flex items-end justify-between gap-3 sm:mt-4">
                            <div>
                              <p className="text-base font-bold text-[var(--color-texto)] sm:text-lg">
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

                          <div className="mt-4 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-berry)]">
                              Abrir anúncio
                              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                adicionarAoCarrinho({
                                  tutorialId: tutorial.id,
                                  titulo: tutorial.titulo,
                                  imagemCapaUrl: tutorial.imagemCapaUrl,
                                  preco: tutorial.preco,
                                  precoPromocional: tutorial.precoPromocional,
                                });
                              }}
                              className="action-reveal ml-auto bg-[var(--color-berry)] text-white hover:bg-[var(--color-berry-escuro)]"
                              aria-label={estaNoCarrinho(tutorial.id) ? "Item no carrinho" : "Adicionar ao carrinho"}
                              title={estaNoCarrinho(tutorial.id) ? "Item no carrinho" : "Adicionar ao carrinho"}
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              <span className="action-reveal-text">{estaNoCarrinho(tutorial.id) ? "No carrinho" : "Comprar"}</span>
                            </button>
                          </div>
                        </div>
                      </Cartao>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Paginação */}
            {totalPaginas > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Paginação">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] text-sm font-medium text-[var(--color-texto)] hover:border-[var(--color-berry)] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPagina(num)}
                    className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border text-sm font-medium ${
                      num === pagina
                        ? "border-[var(--color-berry)] bg-[var(--color-berry)] text-white"
                        : "border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-texto)] hover:border-[var(--color-berry)]"
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] text-sm font-medium text-[var(--color-texto)] hover:border-[var(--color-berry)] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Próxima página"
                >
                  ›
                </button>
              </nav>
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
    <Suspense fallback={<SkeletonVitrine />}>
      <ConteudoTutoriais />
    </Suspense>
  );
}

