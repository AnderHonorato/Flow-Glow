import { LoaderCircle } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "contorno" | "fantasma" | "perigo";
  tamanho?: "pequeno" | "medio" | "grande";
  children: ReactNode;
  carregando?: boolean;
}

const estilosVariante = {
  primario:
    "liquid-button border border-white/30 bg-[var(--color-berry)] text-white shadow-[0_10px_28px_rgba(175,49,95,0.18)] hover:bg-[var(--color-berry-escuro)]",
  secundario:
    "liquid-button border border-white/25 bg-[var(--color-sage)] text-white shadow-[0_10px_24px_rgba(31,122,118,0.16)] hover:bg-[var(--color-sage-escuro)]",
  contorno:
    "border border-[var(--color-linha-forte)] bg-[color-mix(in_srgb,var(--color-papel)_78%,transparent)] text-[var(--color-texto)] backdrop-blur-md hover:border-[var(--color-berry)] hover:text-[var(--color-berry)]",
  fantasma:
    "text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-papel)_78%,transparent)] hover:text-[var(--color-berry)]",
  perigo:
    "liquid-button border border-white/25 bg-red-600 text-white shadow-[0_10px_24px_rgba(185,28,28,0.18)] hover:bg-red-700",
};

const estilosTamanho = {
  pequeno: "min-h-8 px-3 text-sm rounded-lg",
  medio: "min-h-10 px-4 text-sm rounded-lg",
  grande: "min-h-11 px-5 text-base rounded-lg",
};

export function Botao({
  variante = "primario",
  tamanho = "medio",
  children,
  carregando = false,
  disabled,
  className = "",
  ...props
}: BotaoProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer
        active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-berry)]
        ${estilosVariante[variante]}
        ${estilosTamanho[tamanho]}
        ${className}`}
      disabled={disabled || carregando}
      {...props}
    >
      {carregando && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
