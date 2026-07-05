"use client";

import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AtualizadorTempoReal({ intervaloMs = 5000 }: { intervaloMs?: number }) {
  const router = useRouter();
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState("");

  useEffect(() => {
    const atualizar = () => {
      router.refresh();
      setUltimaAtualizacao(
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    };

    const intervalo = window.setInterval(atualizar, intervaloMs);
    return () => window.clearInterval(intervalo);
  }, [intervaloMs, router]);

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-papel)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-texto-suave)] ring-1 ring-[var(--color-linha)]">
      <RefreshCcw className="h-3.5 w-3.5" aria-hidden />
      Ao vivo{ultimaAtualizacao ? ` ${ultimaAtualizacao}` : ""}
    </span>
  );
}
