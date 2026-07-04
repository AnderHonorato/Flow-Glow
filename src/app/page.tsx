import {
  BadgePercent,
  Clock3,
  MapPin,
  MessageCircle,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/layout";
import { Botao, Cartao } from "@/components/ui";

const categoriasDestaque = [
  { nome: "Maquiagem", slug: "maquiagem", icone: Sparkles },
  { nome: "Skincare", slug: "skincare", icone: ShieldCheck },
  { nome: "Sobrancelha", slug: "sobrancelha", icone: Search },
  { nome: "Cabelo", slug: "cabelo", icone: PlayCircle },
  { nome: "Unhas", slug: "unhas", icone: BadgePercent },
  { nome: "Noivas", slug: "noivas", icone: Clock3 },
];

const exemplos = [
  {
    titulo: "Maquiagem Pele Real para Eventos",
    slug: "maquiagem-pele-real-eventos",
    etiqueta: "Promoção",
    preco: "R$ 99,90",
    distancia: "4 km",
    imagem:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  },
  {
    titulo: "Design de Sobrancelhas Natural",
    slug: "design-sobrancelhas-natural",
    etiqueta: "Cupom SOBR10",
    preco: "R$ 79,90",
    distancia: "18 km",
    imagem:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80",
  },
  {
    titulo: "Unhas Minimalistas de Salão",
    slug: "unhas-minimalistas-salao",
    etiqueta: "Cupom UNHAS15",
    preco: "R$ 69,90",
    distancia: "19 km",
    imagem:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80",
  },
];

const recursos = [
  {
    titulo: "Compra simples",
    descricao: "Carrinho, checkout simulado e liberação de conteúdo para testes.",
    icone: BadgePercent,
  },
  {
    titulo: "Filtros úteis",
    descricao: "Busque por categoria, preço, promoção, cupom e distância.",
    icone: Search,
  },
  {
    titulo: "Atendimento perto",
    descricao: "Cada anúncio pode mostrar cidade, estado e distância estimada.",
    icone: MapPin,
  },
  {
    titulo: "Suporte no site",
    descricao: "Fluxos de conta, recuperação e chat ficam no mesmo ambiente.",
    icone: MessageCircle,
  },
];

export default function PaginaInicial() {
  return (
    <>
      <Cabecalho />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-[var(--color-texto)] text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1800&q=82)",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-[rgba(34,24,21,0.56)]" aria-hidden />

          <div className="relative mx-auto flex min-h-[480px] max-w-7xl items-center px-4 py-14 sm:px-6 lg:min-h-[560px] lg:px-8">
            <div className="max-w-2xl animar-entrada">
              <span className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/20">
                <Sparkles className="h-4 w-4" aria-hidden />
                Catálogo pronto para testar
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Flow & Glow
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
                Anúncios de beleza com tutoriais, promoções, cupons e filtros para
                clientes encontrarem a melhor opção sem perder tempo.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/tutoriais">
                  <Botao tamanho="grande">
                    <Search className="h-5 w-5" aria-hidden />
                    Ver anúncios
                  </Botao>
                </Link>
                <Link href="/login">
                  <Botao variante="contorno" tamanho="grande" className="border-white/55 bg-white/8 text-white hover:bg-white hover:text-[var(--color-texto)]">
                    <ShieldCheck className="h-5 w-5" aria-hidden />
                    Entrar para testar
                  </Botao>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
                Exemplos no site
              </span>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                Anúncios prontos para clicar
              </h2>
            </div>
            <Link href="/tutoriais?promocao=true">
              <Botao variante="fantasma">
                <BadgePercent className="h-4 w-4" aria-hidden />
                Ver promoções
              </Botao>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {exemplos.map((exemplo) => (
              <Link key={exemplo.slug} href={`/tutoriais/${exemplo.slug}`} className="group">
                <Cartao className="h-full p-0 hover:-translate-y-0.5 hover:border-[var(--color-berry)]">
                  <div
                    className="h-44 rounded-t-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${exemplo.imagem})` }}
                  />
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-md bg-[var(--color-berry)]/10 px-2 py-1 text-xs font-bold text-[var(--color-berry)]">
                        {exemplo.etiqueta}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-texto)]/56">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {exemplo.distancia}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-snug group-hover:text-[var(--color-berry)]">
                      {exemplo.titulo}
                    </h3>
                    <p className="mt-2 text-base font-bold text-[var(--color-texto)]">
                      {exemplo.preco}
                    </p>
                  </div>
                </Cartao>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--color-linha)] bg-[var(--color-papel)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Filtre pelo que importa
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categoriasDestaque.map((cat) => {
                const Icone = cat.icone;
                return (
                  <Link key={cat.slug} href={`/tutoriais?categoria=${cat.slug}`}>
                    <span className="flex h-full items-center gap-2 rounded-lg border border-[var(--color-linha)] bg-white px-3 py-3 text-sm font-semibold text-[var(--color-texto)] transition-colors hover:border-[var(--color-berry)] hover:text-[var(--color-berry)]">
                      <Icone className="h-4 w-4" aria-hidden />
                      {cat.nome}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recursos.map((recurso) => {
              const Icone = recurso.icone;
              return (
                <Cartao key={recurso.titulo}>
                  <Icone className="mb-3 h-5 w-5 text-[var(--color-sage)]" aria-hidden />
                  <h3 className="text-base font-bold">{recurso.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-texto)]/62">
                    {recurso.descricao}
                  </p>
                </Cartao>
              );
            })}
          </div>
        </section>
      </main>

      <Rodape />
    </>
  );
}
