"use client";

import { ProvedorAutenticacao } from "@/contexto/autenticacao";
import { ProvedorPreferencias } from "@/contexto/preferencias";
import { BannerConsentimento } from "@/components/layout/banner-consentimento";
import { ChatFlutuante } from "@/components/layout/chat-flutuante";
import { ProvedorCarrinho } from "@/hooks/use-carrinho";
import type { ReactNode } from "react";

export function Provedores({ children }: { children: ReactNode }) {
  return (
    <ProvedorPreferencias>
      <ProvedorAutenticacao>
        <ProvedorCarrinho>
          {children}
          <ChatFlutuante />
          <BannerConsentimento />
        </ProvedorCarrinho>
      </ProvedorAutenticacao>
    </ProvedorPreferencias>
  );
}
