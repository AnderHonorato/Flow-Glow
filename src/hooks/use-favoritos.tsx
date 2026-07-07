"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAutenticacao } from "@/contexto/autenticacao";

interface ContextoFavoritos {
  idsFavoritos: Set<string>;
  carregando: boolean;
  estaFavorito: (tutorialId: string) => boolean;
  alternarFavorito: (tutorialId: string) => Promise<{ sucesso: boolean; erro?: string }>;
  recarregarFavoritos: () => Promise<void>;
}

const Contexto = createContext<ContextoFavoritos | null>(null);

export function ProvedorFavoritos({ children }: { children: ReactNode }) {
  const { usuario, accessToken } = useAutenticacao();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(false);

  const recarregarFavoritos = useCallback(async () => {
    if (!usuario || !accessToken) {
      setIds(new Set());
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch("/api/favoritos?somenteIds=true", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const dados = await resposta.json();
      if (dados.sucesso && Array.isArray(dados.dados)) {
        setIds(new Set(dados.dados as string[]));
      }
    } catch {
      setIds(new Set());
    }
    setCarregando(false);
  }, [accessToken, usuario]);

  useEffect(() => {
    recarregarFavoritos();
  }, [recarregarFavoritos]);

  const estaFavorito = useCallback((tutorialId: string) => ids.has(tutorialId), [ids]);

  const alternarFavorito = useCallback(
    async (tutorialId: string) => {
      if (!usuario || !accessToken) {
        return { sucesso: false, erro: "Entre na conta para favoritar anuncios." };
      }

      const favorito = ids.has(tutorialId);
      setIds((atuais) => {
        const proximos = new Set(atuais);
        if (favorito) proximos.delete(tutorialId);
        else proximos.add(tutorialId);
        return proximos;
      });

      try {
        const resposta = await fetch("/api/favoritos", {
          method: favorito ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ tutorialId }),
        });
        const dados = await resposta.json();
        if (!dados.sucesso) throw new Error(dados.erro || "Nao foi possivel atualizar.");
        return { sucesso: true };
      } catch (erro) {
        setIds((atuais) => {
          const proximos = new Set(atuais);
          if (favorito) proximos.add(tutorialId);
          else proximos.delete(tutorialId);
          return proximos;
        });
        return {
          sucesso: false,
          erro: erro instanceof Error ? erro.message : "Erro ao atualizar favorito.",
        };
      }
    },
    [accessToken, ids, usuario]
  );

  const valor = useMemo<ContextoFavoritos>(
    () => ({
      idsFavoritos: ids,
      carregando,
      estaFavorito,
      alternarFavorito,
      recarregarFavoritos,
    }),
    [alternarFavorito, carregando, estaFavorito, ids, recarregarFavoritos]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFavoritos() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useFavoritos deve ser usado dentro de ProvedorFavoritos");
  }
  return contexto;
}
