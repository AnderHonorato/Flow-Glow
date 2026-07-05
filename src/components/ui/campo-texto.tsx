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
}

export function CampoTexto({
  rotulo,
  erro,
  className = "",
  id,
  as = "input",
  icone,
  sufixo,
  ...props
}: CampoTextoProps) {
  const campoId = id || rotulo.toLowerCase().replace(/\s+/g, "-");
  const classeBase = `w-full rounded-lg border bg-[color-mix(in_srgb,var(--color-papel)_88%,transparent)] text-[var(--color-texto)] placeholder:text-[var(--color-texto)]/35 shadow-sm backdrop-blur-md transition-all duration-200 ${
    erro
      ? "border-red-500 focus:border-red-500"
      : "border-[var(--color-linha-forte)] focus:border-[var(--color-berry)]"
  } focus:outline-none focus:ring-3 focus:ring-[var(--color-berry)]/12 disabled:bg-[var(--color-papel)] disabled:cursor-not-allowed ${className}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={campoId} className="text-sm font-semibold text-[var(--color-texto)]">
        {rotulo}
      </label>
      <div className="relative">
        {icone && as !== "textarea" && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto)]/42">
            {icone}
          </span>
        )}
        {as === "textarea" ? (
          <textarea
            id={campoId}
            className={`${classeBase} min-h-28 px-3.5 py-3`}
            rows={4}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={campoId}
            className={`${classeBase} h-10 sm:h-11 ${icone ? "pl-10" : "px-3.5"} ${
              sufixo ? "pr-12" : ""
            }`}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {sufixo && as !== "textarea" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-texto)]/42">
            {sufixo}
          </span>
        )}
      </div>
      {erro && <span className="text-sm text-red-600 mt-0.5">{erro}</span>}
    </div>
  );
}
