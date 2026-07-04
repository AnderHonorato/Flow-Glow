import {
  BadgePercent,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Star,
  TicketPercent,
} from "lucide-react";
import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/layout";
import { Botao, Cartao } from "@/components/ui";
import BotaoComprar from "./botao-comprar";
import SecaoComentarios from "./secao-comentarios";
import type { TutorialDetalhe } from "@/tipos";

async function carregarTutorial(slug: string): Promise<TutorialDetalhe | null> {
  try {
    const baseUrl = process.env.URL_PUBLICA || "http://localhost:3000";
    const resposta = await fetch(`${baseUrl}/api/tutoriais/${slug}`, {
      cache: "no-store",
    });
    const dados = await resposta.json();
    return dados.sucesso ? dados.dados : null;
  } catch {
    return null;
  }
}

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function PaginaTutorial({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tutorial = await carregarTutorial(slug);

  if (!tutorial) {
    return (
      <>
        <Cabecalho />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">Anúncio não encontrado</h1>
          <p className="mt-3 text-[var(--color-texto)]/62">
            O anúncio que você procura não existe ou foi removido.
          </p>
          <Link href="/tutoriais" className="mt-6 inline-flex">
            <Botao variante="contorno">
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Ver anúncios
            </Botao>
          </Link>
        </main>
        <Rodape />
      </>
    );
  }

  const precoAtual = tutorial.precoPromocional || tutorial.preco;
  const temPromocao =
    Boolean(tutorial.precoPromocional) || tutorial.destaquePromocional;

  return (
    <>
      <Cabecalho />
      <main>
        <section className="border-b border-[var(--color-linha)] bg-[var(--color-papel)]">
          <div className="mx-auto grid max-w-7xl gap-7 px-4 py-6 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-9">
            <div>
              <Link
                href="/tutoriais"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-berry)] hover:text-[var(--color-berry-escuro)]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Voltar para anúncios
              </Link>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-[var(--color-sage)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  {tutorial.categoria.nome}
                </span>
                <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[var(--color-texto)] ring-1 ring-[var(--color-linha)]">
                  {tutorial.nivel.toLowerCase().replace("_", " ")}
                </span>
                {temPromocao && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-berry)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    <BadgePercent className="h-3.5 w-3.5" aria-hidden />
                    Promoção
                  </span>
                )}
              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                {tutorial.titulo}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-texto)]/66">
                {tutorial.descricaoCurta}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-texto)]/64">
                {tutorial.distanciaKm !== null && (
                  <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-[var(--color-linha)]">
                    <MapPin className="h-4 w-4 text-[var(--color-berry)]" aria-hidden />
                    {tutorial.cidade}, {tutorial.estado} · {tutorial.distanciaKm} km
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-[var(--color-linha)]">
                  <Clock3 className="h-4 w-4 text-[var(--color-sage)]" aria-hidden />
                  {tutorial.modulos.length} aulas
                </span>
                {tutorial.totalAvaliacoes > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-[var(--color-linha)]">
                    <Star className="h-4 w-4 fill-[var(--color-ouro)] text-[var(--color-ouro)]" aria-hidden />
                    {tutorial.notaMedia.toFixed(1)} em {tutorial.totalAvaliacoes} avaliação
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[var(--color-linha)] bg-white shadow-[0_16px_38px_rgba(42,31,28,0.10)]">
              {tutorial.videoPreviaUrl ? (
                <video
                  src={tutorial.videoPreviaUrl}
                  poster={tutorial.imagemCapaUrl}
                  controls
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div
                  className="flex aspect-video items-center justify-center bg-cover bg-center"
                  style={{ backgroundImage: `url(${tutorial.imagemCapaUrl})` }}
                >
                  <span className="inline-flex items-center gap-2 rounded-md bg-white/92 px-3 py-2 text-sm font-bold text-[var(--color-texto)] shadow">
                    <PlayCircle className="h-5 w-5 text-[var(--color-berry)]" aria-hidden />
                    Prévia do anúncio
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold">Detalhes</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-[var(--color-texto)]/70">
                {tutorial.descricaoCompleta}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Conteúdo do anúncio</h2>
              <div className="mt-4 grid gap-3">
                {tutorial.modulos.map((modulo) => (
                  <Cartao key={modulo.id} className="flex items-center gap-4 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-papel)] text-sm font-bold text-[var(--color-texto)]/58">
                      {String(modulo.ordem).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{modulo.titulo}</h3>
                      <span className="text-sm text-[var(--color-texto)]/52">
                        {modulo.duracaoMinutos} min
                      </span>
                    </div>
                    {modulo.gratuito && (
                      <span className="rounded-md bg-[var(--color-sage)]/10 px-2 py-1 text-xs font-bold text-[var(--color-sage)]">
                        Gratuito
                      </span>
                    )}
                  </Cartao>
                ))}
              </div>
            </section>

            <section>
              <SecaoComentarios
                tutorialId={tutorial.id}
                comentariosIniciais={tutorial.comentarios}
              />
            </section>
          </div>

          <aside>
            <Cartao destaque className="sticky top-24">
              <div className="space-y-4">
                {temPromocao && (
                  <span className="inline-flex items-center gap-2 rounded-md bg-[var(--color-berry)]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-berry)]">
                    <BadgePercent className="h-4 w-4" aria-hidden />
                    Oferta ativa
                  </span>
                )}

                <div>
                  <p className="text-3xl font-bold">{formatarReal(precoAtual)}</p>
                  {tutorial.precoPromocional && (
                    <p className="mt-1 text-sm font-semibold text-[var(--color-texto)]/42 line-through">
                      {formatarReal(tutorial.preco)}
                    </p>
                  )}
                </div>

                {tutorial.cupomDesconto && (
                  <div className="rounded-lg border border-dashed border-[var(--color-ouro)] bg-[var(--color-ouro)]/8 p-3">
                    <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-texto)]">
                      <TicketPercent className="h-4 w-4 text-[var(--color-ouro)]" aria-hidden />
                      Cupom: {tutorial.cupomDesconto}
                    </p>
                  </div>
                )}

                <BotaoComprar
                  tutorialId={tutorial.id}
                  titulo={tutorial.titulo}
                  imagemCapaUrl={tutorial.imagemCapaUrl}
                  preco={tutorial.preco}
                  precoPromocional={tutorial.precoPromocional}
                />

                <div className="space-y-3 border-t border-[var(--color-linha)] pt-4">
                  {[
                    "Acesso vitalício ao conteúdo",
                    "Checkout simulado para testes",
                    "Primeira aula liberada como prévia",
                    "Suporte pelo chat da plataforma",
                  ].map((item) => (
                    <p
                      key={item}
                      className="flex items-start gap-2 text-sm leading-relaxed text-[var(--color-texto)]/68"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sage)]" aria-hidden />
                      {item}
                    </p>
                  ))}
                </div>

                <p className="flex items-start gap-2 rounded-md bg-[var(--color-papel)] p-3 text-xs leading-relaxed text-[var(--color-texto)]/62">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sage)]" aria-hidden />
                  Para testar o fluxo completo, use cliente@studioglow.com.br ou crie uma nova conta.
                </p>
              </div>
            </Cartao>
          </aside>
        </section>
      </main>
      <Rodape />
    </>
  );
}
