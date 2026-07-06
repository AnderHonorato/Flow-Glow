"use client";

import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

interface CampoTextoProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  rotulo: string;
  erro?: string;
  as?: "input" | "textarea";
  icone?: ReactNode;
  sufixo?: ReactNode;
  variante?: "padrao" | "busca";
}

export function CampoTexto({
  rotulo,
  erro,
  className = "",
  id,
  as = "input",
  icone,
  sufixo,
  value,
  maxLength,
  variante = "padrao",
  ...props
}: CampoTextoProps) {
  const campoId = id || rotulo.toLowerCase().replace(/\s+/g, "-");
  const ehBusca = variante === "busca";

  const classeBase = ehBusca
    ? `w-full rounded-full border bg-[color-mix(in_srgb,var(--color-papel)_86%,transparent)] text-[var(--color-texto)] placeholder:text-[var(--color-texto)]/35 shadow-sm backdrop-blur-md transition-all duration-200 ${
        erro
          ? "border-red-500 focus:border-red-500"
          : "border-[var(--color-linha)] focus:border-[var(--color-berry)]"
      } focus:outline-none focus:ring-2 focus:ring-[var(--color-berry)]/12 disabled:bg-[var(--color-papel)] disabled:cursor-not-allowed ${className}`
    : `w-full rounded-lg border bg-[color-mix(in_srgb,var(--color-papel)_88%,transparent)] text-[var(--color-texto)] placeholder:text-[var(--color-texto)]/35 shadow-sm backdrop-blur-md transition-all duration-200 ${
        erro
          ? "border-red-500 focus:border-red-500"
          : "border-[var(--color-linha-forte)] focus:border-[var(--color-berry)]"
      } focus:outline-none focus:ring-3 focus:ring-[var(--color-berry)]/12 disabled:bg-[var(--color-papel)] disabled:cursor-not-allowed ${className}`;

  const comprimento = typeof value === "string" ? value.length : String(value ?? "").length;
  const mostrarContador = maxLength !== undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={campoId} className="text-sm font-semibold text-[var(--color-texto)]">
          {rotulo}
        </label>
        {mostrarContador && (
          <span className={`text-xs font-medium ${comprimento > maxLength ? "text-red-500" : "text-[var(--color-texto-suave)]"}`}>
            {comprimento}/{maxLength}
          </span>
        )}
      </div>
      <div className="relative">
        {icone && (
          <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--color-texto)]/42 ${ehBusca ? "left-3.5" : "left-3"}`}>
            {icone}
          </span>
        )}
        {as === "textarea" ? (
          <textarea
            id={campoId}
            className={`${classeBase} min-h-28 px-3.5 py-3`}
            rows={4}
            value={value}
            maxLength={maxLength}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={campoId}
            className={`${classeBase} h-10 sm:h-11 ${icone ? (ehBusca ? "pl-10" : "pl-10") : "px-3.5"} ${
              sufixo ? "pr-12" : ""
            }`}
            value={value}
            maxLength={maxLength}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {sufixo && (
          <span className={`absolute top-1/2 -translate-y-1/2 text-[var(--color-texto)]/42 ${ehBusca ? "right-3.5" : "right-3"}`}>
            {sufixo}
          </span>
        )}
      </div>
      {erro && <span className="text-sm text-red-600 mt-0.5">{erro}</span>}
    </div>
  );
}
