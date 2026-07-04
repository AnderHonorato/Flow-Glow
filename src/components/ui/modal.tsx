"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  onFechar: () => void;
}

export function Modal({ aberto, titulo, descricao, children, onFechar }: ModalProps) {
  useEffect(() => {
    if (!aberto) return;

    function aoPressionar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onFechar();
    }

    document.addEventListener("keydown", aoPressionar);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoPressionar);
      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(30,25,22,0.42)] px-3 py-3 sm:items-center sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-[var(--color-linha)] bg-white shadow-[0_24px_70px_rgba(42,31,28,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-linha)] px-5 py-4">
          <div>
            <h2 id="modal-titulo" className="text-lg font-bold text-[var(--color-texto)]">
              {titulo}
            </h2>
            {descricao && (
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-texto)]/58">
                {descricao}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-texto)]/60 transition-colors hover:bg-[var(--color-papel)] hover:text-[var(--color-texto)]"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
