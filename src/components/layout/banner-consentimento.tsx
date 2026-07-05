"use client";

import { Cookie, MapPin } from "lucide-react";
import { Botao } from "@/components/ui";
import { usePreferencias } from "@/contexto/preferencias";

export function BannerConsentimento() {
  const { consentimento, aceitarPreferencias, recusarPreferencias } = usePreferencias();

  if (consentimento !== "pendente") return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-lg border border-white/55 bg-white/82 p-3 shadow-[0_18px_54px_rgba(20,28,42,0.18)] backdrop-blur-xl dark:border-white/12 dark:bg-[#111827]/86 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-berry)] text-white">
            <Cookie className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--color-texto)]">
              Cookies e preferências opcionais
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-texto-suave)]">
              Salvamos tema, carrinho e localização apenas se você permitir. O login usa
              somente dados essenciais da sessão.
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-sage)]">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              A localização será pedida separadamente.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Botao type="button" variante="fantasma" tamanho="pequeno" onClick={recusarPreferencias}>
            Só essenciais
          </Botao>
          <Botao type="button" tamanho="pequeno" onClick={aceitarPreferencias}>
            Permitir
          </Botao>
        </div>
      </div>
    </div>
  );
}
