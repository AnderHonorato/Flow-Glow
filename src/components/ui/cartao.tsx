import { ReactNode } from "react";

interface CartaoProps {
  children: ReactNode;
  className?: string;
  destaque?: boolean;
}

export function Cartao({ children, className = "", destaque = false }: CartaoProps) {
  return (
    <div
      className={`rounded-lg border bg-[color-mix(in_srgb,var(--color-papel)_92%,transparent)] backdrop-blur-sm ${
        destaque
          ? "border-[var(--color-ouro)] shadow-[0_16px_42px_rgba(23,32,51,0.12)]"
          : "border-[var(--color-linha)] shadow-[0_8px_24px_rgba(23,32,51,0.07)]"
      } p-4 transition-all duration-200 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}
