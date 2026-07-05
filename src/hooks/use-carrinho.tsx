"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { usePreferencias } from "@/contexto/preferencias";
import type { ItemCarrinho } from "@/tipos";

interface ContextoCarrinho {
  itens: ItemCarrinho[];
  adicionarAoCarrinho: (item: ItemCarrinho) => void;
  removerDoCarrinho: (tutorialId: string) => void;
  limparCarrinho: () => void;
  total: number;
  quantidadeItens: number;
  estaNoCarrinho: (tutorialId: string) => boolean;
}

const Contexto = createContext<ContextoCarrinho | null>(null);

const CHAVE_STORAGE = "studioglow_carrinho";

function salvarCarrinho(itens: ItemCarrinho[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
  }
}

function carregarCarrinho(): ItemCarrinho[] {
  if (typeof window !== "undefined") {
    try {
      const dados = localStorage.getItem(CHAVE_STORAGE);
      const itens = dados ? JSON.parse(dados) : [];
      return Array.isArray(itens) ? itens : [];
    } catch {
      localStorage.removeItem(CHAVE_STORAGE);
      return [];
    }
  }
  return [];
}

export function ProvedorCarrinho({ children }: { children: ReactNode }) {
  const { preferenciasPermitidas } = usePreferencias();
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    if (!preferenciasPermitidas) {
      setHidratado(true);
      return;
    }

    setItens((atuais) => (atuais.length > 0 ? atuais : carregarCarrinho()));
    setHidratado(true);
  }, [preferenciasPermitidas]);

  useEffect(() => {
    if (!hidratado || !preferenciasPermitidas) return;
    salvarCarrinho(itens);
  }, [hidratado, itens, preferenciasPermitidas]);

  useEffect(() => {
    if (!preferenciasPermitidas) return;

    function sincronizar(evento: StorageEvent) {
      if (evento.key === CHAVE_STORAGE) {
        setItens(carregarCarrinho());
      }
    }

    window.addEventListener("storage", sincronizar);
    return () => window.removeEventListener("storage", sincronizar);
  }, [preferenciasPermitidas]);

  const adicionarAoCarrinho = useCallback((item: ItemCarrinho) => {
    setItens((prev) => {
      if (prev.some((i) => i.tutorialId === item.tutorialId)) return prev;
      const novo = [...prev, item];
      return novo;
    });
  }, []);

  const removerDoCarrinho = useCallback((tutorialId: string) => {
    setItens((prev) => {
      const novo = prev.filter((i) => i.tutorialId !== tutorialId);
      return novo;
    });
  }, []);

  const limparCarrinho = useCallback(() => {
    setItens([]);
  }, []);

  const total = itens.reduce((acc, item) => acc + (item.precoPromocional || item.preco), 0);
  const quantidadeItens = itens.length;
  const estaNoCarrinho = useCallback(
    (tutorialId: string) => itens.some((item) => item.tutorialId === tutorialId),
    [itens]
  );

  return (
    <Contexto.Provider
      value={{
        itens,
        adicionarAoCarrinho,
        removerDoCarrinho,
        limparCarrinho,
        total,
        quantidadeItens,
        estaNoCarrinho,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useCarrinho(): ContextoCarrinho {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCarrinho deve ser usado dentro de ProvedorCarrinho");
  return ctx;
}
