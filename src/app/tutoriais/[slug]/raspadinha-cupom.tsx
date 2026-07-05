"use client";

import { TicketPercent } from "lucide-react";
import { useState } from "react";

interface RaspadinhaCupomProps {
  cupom: string | null;
}

export function RaspadinhaCupom({ cupom }: RaspadinhaCupomProps) {
  const [revelado, setRevelado] = useState(false);

  if (!cupom) return null;

  return (
    <div className="rounded-lg border border-dashed border-[var(--color-ouro)] bg-[color-mix(in_srgb,var(--color-ouro)_8%,transparent)] p-3">
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-texto)]">
        <TicketPercent className="h-4 w-4 text-[var(--color-ouro)]" aria-hidden />
        Raspadinha do anúncio
      </p>
      <button
        type="button"
        onClick={() => setRevelado(true)}
        className="relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-lg border border-white/50 bg-[var(--color-papel)] text-sm font-bold shadow-inner"
        aria-label={revelado ? `Cupom ${cupom}` : "Raspar cupom"}
      >
        <span className={revelado ? "text-[var(--color-berry)]" : "text-transparent"}>
          {cupom}
        </span>
        {!revelado && (
          <span className="absolute inset-0 flex items-center justify-center bg-[#d7dce2] text-[var(--color-texto)]">
            Raspar para revelar
          </span>
        )}
      </button>
    </div>
  );
}
