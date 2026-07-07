"use client";

import { ProvedorAutenticacao } from "@/contexto/autenticacao";
import { ProvedorPreferencias } from "@/contexto/preferencias";
import { BannerConsentimento } from "@/components/layout/banner-consentimento";
import { BotaoTopo } from "@/components/layout/botao-topo";
import { ChatFlutuante } from "@/components/layout/chat-flutuante";
import { ProvedorCarrinho } from "@/hooks/use-carrinho";
import { ProvedorFavoritos } from "@/hooks/use-favoritos";
import type { ReactNode } from "react";

export function Provedores({ children }: { children: ReactNode }) {
  return (
    <ProvedorPreferencias>
      <ProvedorAutenticacao>
        <ProvedorCarrinho>
          <ProvedorFavoritos>
            {children}
            <ChatFlutuante />
            <BotaoTopo />
            <BannerConsentimento />
          </ProvedorFavoritos>
        </ProvedorCarrinho>
      </ProvedorAutenticacao>
    </ProvedorPreferencias>
  );
}
