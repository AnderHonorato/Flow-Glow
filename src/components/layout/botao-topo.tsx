"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function BotaoTopo() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    function verificarScroll() {
      setVisivel(window.scrollY > 400);
    }
    verificarScroll();
    window.addEventListener("scroll", verificarScroll, { passive: true });
    return () => window.removeEventListener("scroll", verificarScroll);
  }, []);

  function voltarTopo() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visivel) return null;

  return (
    <button
      type="button"
      onClick={voltarTopo}
      className="fixed bottom-24 right-5 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-texto)] shadow-[0_8px_24px_rgba(23,32,51,0.12)] transition-all hover:scale-110 hover:border-[var(--color-berry)] hover:text-[var(--color-berry)]"
      aria-label="Voltar ao topo"
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
