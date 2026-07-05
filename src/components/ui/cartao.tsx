import { ReactNode } from "react";

interface CartaoProps {
  children: ReactNode;
  className?: string;
  destaque?: boolean;
}

export function Cartao({ children, className = "", destaque = false }: CartaoProps) {
  return (
    <div
      className={`rounded-xl sm:rounded-lg border bg-white ${
        destaque
          ? "border-[#b98a2d] shadow-[0_16px_40px_rgba(42,31,28,0.10)]"
          : "border-[#eadfd5] shadow-[0_8px_24px_rgba(42,31,28,0.06)]"
      } p-4 sm:p-5 transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
