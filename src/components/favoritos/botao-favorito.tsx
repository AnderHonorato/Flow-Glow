"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEvent, useState } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { useFavoritos } from "@/hooks/use-favoritos";

interface BotaoFavoritoProps {
  tutorialId: string;
  className?: string;
  compacto?: boolean;
  onAlternado?: () => void | Promise<void>;
}

export function BotaoFavorito({
  tutorialId,
  className = "",
  compacto = false,
  onAlternado,
}: BotaoFavoritoProps) {
  const router = useRouter();
  const { usuario } = useAutenticacao();
  const { estaFavorito, alternarFavorito } = useFavoritos();
  const [ocupado, setOcupado] = useState(false);
  const favorito = estaFavorito(tutorialId);

  async function aoClicar(evento: MouseEvent<HTMLButtonElement>) {
    evento.preventDefault();
    evento.stopPropagation();

    if (!usuario) {
      router.push("/login");
      return;
    }

    if (ocupado) return;
    setOcupado(true);
    const resultado = await alternarFavorito(tutorialId);
    if (resultado.sucesso) await onAlternado?.();
    setOcupado(false);
  }

  const rotulo = favorito ? "Remover dos favoritos" : "Favoritar anuncio";

  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={ocupado}
      aria-label={rotulo}
      title={rotulo}
      className={`tooltip-action inline-flex items-center justify-center rounded-full border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_90%,transparent)] text-[var(--color-berry)] shadow-sm transition hover:scale-105 hover:border-[var(--color-berry)] disabled:opacity-60 ${
        compacto ? "h-9 w-9" : "h-10 w-10"
      } ${className}`}
      data-tooltip={rotulo}
    >
      <Heart
        className={`h-[1.125rem] w-[1.125rem] ${favorito ? "fill-current" : ""}`}
        aria-hidden
      />
    </button>
  );
}
