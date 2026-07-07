"use client";

import { Heart, ShoppingCart, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { BotaoFavorito } from "@/components/favoritos/botao-favorito";
import { Botao, Cartao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";
import { useCarrinho } from "@/hooks/use-carrinho";

interface Favorito {
  id: string;
  criadoEm: string;
  tutorial: {
    id: string;
    titulo: string;
    slug: string;
    descricaoCurta: string;
    preco: number;
    precoPromocional: number | null;
    imagemCapaUrl: string;
    destaquePromocional: boolean;
    bombando: boolean;
    cidade: string | null;
    estado: string | null;
    distanciaKm: number | null;
    categoria: { nome: string; slug: string };
  };
}

function formatarReal(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PaginaFavoritos() {
  const { usuario, accessToken } = useAutenticacao();
  const { adicionarAoCarrinho, estaNoCarrinho } = useCarrinho();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    if (!accessToken) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/favoritos", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const dados = await resposta.json();
      if (dados.sucesso) setFavoritos(dados.dados || []);
      else setErro(dados.erro || "Nao foi possivel carregar seus favoritos.");
    } catch {
      setErro("Erro de conexao ao carregar favoritos.");
    }
    setCarregando(false);
  }, [accessToken]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto min-h-[62vh] max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
            <Heart className="h-4 w-4 fill-current" aria-hidden />
            Minha lista
          </span>
          <h1 className="titulo-desenhado mt-1 text-2xl font-bold sm:text-3xl">
            Favoritos
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--color-texto-suave)]">
            Seus anuncios salvos aparecem aqui. Voce pode remover quando quiser.
          </p>
        </div>

        {!usuario ? (
          <Cartao className="max-w-xl">
            <p className="text-sm text-[var(--color-texto-suave)]">
              Entre na sua conta para ver seus favoritos.
            </p>
            <Link href="/login" className="mt-4 inline-flex">
              <Botao>Entrar</Botao>
            </Link>
          </Cartao>
        ) : carregando ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, indice) => (
              <Cartao key={indice} className="overflow-hidden p-0">
                <div className="skeleton h-32 sm:h-40" />
                <div className="p-3">
                  <div className="skeleton h-4 w-2/3 rounded-md" />
                  <div className="mt-2 skeleton h-3 w-full rounded-full" />
                  <div className="mt-3 skeleton h-8 w-24 rounded-full" />
                </div>
              </Cartao>
            ))}
          </div>
        ) : erro ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </p>
        ) : favoritos.length === 0 ? (
          <Cartao className="max-w-xl">
            <Sparkles className="mb-3 h-6 w-6 text-[var(--color-ouro)]" aria-hidden />
            <h2 className="text-lg font-bold">Nenhum favorito ainda</h2>
            <p className="mt-2 text-sm text-[var(--color-texto-suave)]">
              Toque no coracao dos anuncios para guardar aqui.
            </p>
            <Link href="/tutoriais" className="mt-4 inline-flex">
              <Botao variante="contorno">Ver anuncios</Botao>
            </Link>
          </Cartao>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favoritos.map((favorito) => {
              const tutorial = favorito.tutorial;
              const precoAtual = tutorial.precoPromocional || tutorial.preco;
              return (
                <Cartao key={favorito.id} className="overflow-hidden p-0">
                  <Link href={`/tutoriais/${tutorial.slug}`} className="group block">
                    <div
                      className="relative h-32 bg-cover bg-center sm:h-40"
                      style={{ backgroundImage: `url(${tutorial.imagemCapaUrl})` }}
                    >
                      <div className="absolute right-2 top-2">
                        <BotaoFavorito tutorialId={tutorial.id} compacto onAlternado={carregar} />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold uppercase text-[var(--color-sage)]">
                        {tutorial.categoria.nome}
                      </p>
                      <h2 className="mt-1 line-clamp-2 text-base font-bold group-hover:text-[var(--color-berry)]">
                        {tutorial.titulo}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--color-texto-suave)]">
                        {tutorial.descricaoCurta}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-base font-black text-[var(--color-berry)]">
                          {formatarReal(precoAtual)}
                        </span>
                        <button
                          type="button"
                          onClick={(evento) => {
                            evento.preventDefault();
                            evento.stopPropagation();
                            adicionarAoCarrinho({
                              tutorialId: tutorial.id,
                              titulo: tutorial.titulo,
                              imagemCapaUrl: tutorial.imagemCapaUrl,
                              preco: tutorial.preco,
                              precoPromocional: tutorial.precoPromocional,
                            });
                          }}
                          className="action-reveal bg-[var(--color-berry)] text-white"
                          aria-label="Adicionar ao carrinho"
                          title="Adicionar ao carrinho"
                        >
                          <ShoppingCart className="h-4 w-4" aria-hidden />
                          <span className="action-reveal-text text-xs font-bold">
                            {estaNoCarrinho(tutorial.id) ? "No carrinho" : "Comprar"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </Link>
                </Cartao>
              );
            })}
          </div>
        )}
      </main>
      <Rodape />
    </>
  );
}
