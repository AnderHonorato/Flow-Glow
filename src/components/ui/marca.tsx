import Image from "next/image";

interface MarcaProps {
  mostrarTexto?: boolean;
  compacta?: boolean;
  inversa?: boolean;
  className?: string;
}

export function Marca({
  mostrarTexto = true,
  compacta = false,
  inversa = false,
  className = "",
}: MarcaProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <span
        className={`relative shrink-0 overflow-hidden rounded-lg border border-white/45 bg-black/80 shadow-sm ${
          compacta ? "h-8 w-8" : "h-9 w-9"
        }`}
      >
        <Image
          src="/marca/icone.png"
          alt=""
          fill
          sizes={compacta ? "32px" : "36px"}
          className="object-contain p-0.5"
          priority
        />
      </span>
      {mostrarTexto && (
          <span className="min-w-0 leading-tight">
          <span className={`block truncate font-serif text-lg font-black tracking-[0.04em] ${inversa ? "text-[var(--color-ouro-claro)]" : "text-[var(--color-ouro)]"} drop-shadow-sm`}>
            MCA
          </span>
          <span className={`block truncate text-[11px] font-bold uppercase tracking-wide ${inversa ? "text-white/62" : "text-[var(--color-texto-suave)]"}`}>
            Flow & Glow
          </span>
        </span>
      )}
    </span>
  );
}
