"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import type { ItemCarrinho } from "@/tipos";

interface ContextoCarrinho {
  itens: ItemCarrinho[];
  adicionarAoCarrinho: (item: ItemCarrinho) => void;
  removerDoCarrinho: (tutorialId: string) => void;
  limparCarrinho: () => void;
  total: number;
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
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : [];
  }
  return [];
}

export function ProvedorCarrinho({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    setItens(carregarCarrinho());
  }, []);

  const adicionarAoCarrinho = useCallback((item: ItemCarrinho) => {
    setItens((prev) => {
      if (prev.some((i) => i.tutorialId === item.tutorialId)) return prev;
      const novo = [...prev, item];
      salvarCarrinho(novo);
      return novo;
    });
  }, []);

  const removerDoCarrinho = useCallback((tutorialId: string) => {
    setItens((prev) => {
      const novo = prev.filter((i) => i.tutorialId !== tutorialId);
      salvarCarrinho(novo);
      return novo;
    });
  }, []);

  const limparCarrinho = useCallback(() => {
    setItens([]);
    salvarCarrinho([]);
  }, []);

  const total = itens.reduce((acc, item) => acc + (item.precoPromocional || item.preco), 0);

  return (
    <Contexto.Provider
      value={{ itens, adicionarAoCarrinho, removerDoCarrinho, limparCarrinho, total }}
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
