"use client";

import { BarChart3, Eye, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Cartao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

interface ItemAnalise {
  tutorialId: string;
  totalFavoritos: number;
  tutorial: {
    id: string;
    titulo: string;
    slug: string;
    imagemCapaUrl: string;
    preco: number;
    precoPromocional: number | null;
    categoria: { nome: string; slug: string };
  } | null;
}

function formatarReal(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PaginaAdminFavoritos() {
  const { accessToken } = useAutenticacao();
  const [itens, setItens] = useState<ItemAnalise[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!accessToken) return;
      setErro("");
      try {
        const resposta = await fetch("/api/favoritos?analise=true", {
          cache: "no-store",
          credentials: "include",
        });
        const dados = await resposta.json();
        if (dados.sucesso) setItens(dados.dados || []);
        else setErro(dados.erro || "Nao foi possivel carregar favoritos.");
      } catch {
        setErro("Erro de conexao ao carregar favoritos.");
      }
    }

    carregar();
  }, [accessToken]);

  const totalFavoritos = useMemo(
    () => itens.reduce((soma, item) => soma + item.totalFavoritos, 0),
    [itens]
  );

  return (
    <div>
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
          <Heart className="h-4 w-4 fill-current" aria-hidden />
          Analise
        </span>
        <h1 className="mt-1 text-3xl font-bold">Favoritos dos clientes</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-texto-suave)]">
          Veja quais anuncios mais despertam interesse antes da compra.
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Cartao className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-berry)_12%,transparent)] text-[var(--color-berry)]">
            <Heart className="h-5 w-5 fill-current" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-black">{totalFavoritos}</p>
            <p className="text-xs font-bold uppercase text-[var(--color-texto-suave)]">
              favoritos totais
            </p>
          </div>
        </Cartao>
        <Cartao className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-sage)_14%,transparent)] text-[var(--color-sage)]">
            <ShoppingBag className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-black">{itens.length}</p>
            <p className="text-xs font-bold uppercase text-[var(--color-texto-suave)]">
              anuncios favoritados
            </p>
          </div>
        </Cartao>
      </div>

      {erro && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      {itens.length === 0 ? (
        <Cartao>Nenhum favorito registrado ainda.</Cartao>
      ) : (
        <div className="grid gap-3">
          {itens.map((item, indice) => (
            <Cartao
              key={item.tutorialId}
              className="grid gap-3 sm:grid-cols-[4rem_7rem_1fr_auto] sm:items-center"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-texto)] text-sm font-black text-white">
                #{indice + 1}
              </div>
              {item.tutorial ? (
                <div
                  className="h-24 rounded-lg bg-cover bg-center sm:h-20"
                  style={{ backgroundImage: `url(${item.tutorial.imagemCapaUrl})` }}
                />
              ) : (
                <div className="h-24 rounded-lg bg-[var(--color-linha)] sm:h-20" />
              )}
              <div className="min-w-0">
                <h2 className="truncate text-base font-black">
                  {item.tutorial?.titulo || "Anuncio removido"}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-texto-suave)]">
                  {item.tutorial?.categoria.nome || "Sem categoria"} -{" "}
                  {item.tutorial
                    ? formatarReal(item.tutorial.precoPromocional || item.tutorial.preco)
                    : "-"}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-berry)]">
                  <BarChart3 className="h-4 w-4" aria-hidden />
                  {item.totalFavoritos} cliente(s)
                </p>
              </div>
              {item.tutorial && (
                <Link
                  href={`/tutoriais/${item.tutorial.slug}`}
                  className="tooltip-action inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-linha)] text-[var(--color-texto)] hover:border-[var(--color-berry)] hover:text-[var(--color-berry)]"
                  aria-label="Ver anuncio"
                  data-tooltip="Ver anuncio"
                >
                  <Eye className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </Cartao>
          ))}
        </div>
      )}
    </div>
  );
}
