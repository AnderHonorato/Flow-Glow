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
    "bg-[var(--color-berry)] text-white hover:bg-[var(--color-berry-escuro)] shadow-[0_8px_18px_rgba(123,43,60,0.18)]",
  secundario:
    "bg-[var(--color-sage)] text-white hover:bg-[var(--color-sage-escuro)] shadow-[0_8px_18px_rgba(65,91,75,0.16)]",
  contorno:
    "border border-[var(--color-linha-forte)] bg-white text-[var(--color-texto)] hover:border-[var(--color-berry)] hover:text-[var(--color-berry)]",
  fantasma:
    "text-[var(--color-texto)] hover:bg-[var(--color-papel)] hover:text-[var(--color-berry)]",
  perigo:
    "bg-red-600 text-white hover:bg-red-700 shadow-[0_8px_18px_rgba(185,28,28,0.16)]",
};

const estilosTamanho = {
  pequeno: "min-h-9 px-3 text-sm rounded-md",
  medio: "min-h-10 px-4 text-sm rounded-md",
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
