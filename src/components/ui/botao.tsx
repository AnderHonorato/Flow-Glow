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
    "pincelada group border border-[#b98a2d]/30 bg-[#b98a2d] text-white shadow-[0_10px_28px_rgba(185,138,45,0.22)] hover:bg-[#a07822]",
  secundario:
    "liquid-button border border-white/25 bg-[var(--color-sage)] text-white shadow-[0_10px_24px_rgba(31,122,118,0.16)] hover:bg-[var(--color-sage-escuro)]",
  contorno:
    "group border border-[#eadfd5] bg-white text-[#2a211d] hover:border-[#b98a2d] hover:text-[#b98a2d]",
  fantasma:
    "group text-[#2a211d] hover:bg-[#f6f2ec] hover:text-[#b98a2d]",
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
      className={`pincelada-botao relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold transition-all duration-300 cursor-pointer
        active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b98a2d]
        ${estilosVariante[variante]}
        ${estilosTamanho[tamanho]}
        ${className}`}
      disabled={disabled || carregando}
      {...props}
    >
      {/* Efeito de rabisco de maquiagem no hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 transition-transform duration-500 group-hover:translate-x-full" />
      {carregando && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
