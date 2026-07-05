interface AvatarUsuarioProps {
  nome?: string | null;
  fotoUrl?: string | null;
  tamanho?: "pequeno" | "medio" | "grande";
  className?: string;
}

const tamanhos = {
  pequeno: "h-8 w-8 text-xs",
  medio: "h-10 w-10 text-sm",
  grande: "h-16 w-16 text-lg",
};

function iniciais(nome?: string | null): string {
  if (!nome) return "M";
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return partes
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

export function AvatarUsuario({
  nome,
  fotoUrl,
  tamanho = "medio",
  className = "",
}: AvatarUsuarioProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-[var(--color-sage)] font-bold text-white shadow-sm ${tamanhos[tamanho]} ${className}`}
      aria-hidden
    >
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{iniciais(nome)}</span>
      )}
    </span>
  );
}
