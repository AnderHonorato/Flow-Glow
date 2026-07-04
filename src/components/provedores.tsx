"use client";

import { ProvedorAutenticacao } from "@/contexto/autenticacao";
import { ProvedorCarrinho } from "@/hooks/use-carrinho";
import type { ReactNode } from "react";

export function Provedores({ children }: { children: ReactNode }) {
  return (
    <ProvedorAutenticacao>
      <ProvedorCarrinho>{children}</ProvedorCarrinho>
    </ProvedorAutenticacao>
  );
}
