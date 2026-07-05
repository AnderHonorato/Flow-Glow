"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";

interface Banner {
  id: string;
  titulo: string;
  imagemUrl: string;
  linkUrl: string;
  ordem: number;
}

export function CarrosselBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/anuncios")
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso && d.dados.length > 0) setBanners(d.dados);
      })
      .catch(() => {});
  }, []);

  const avancar = useCallback(() => {
    setIndice((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const voltar = useCallback(() => {
    setIndice((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Rotação automática a cada 5 segundos
  useEffect(() => {
    if (banners.length <= 1 || pausado) return;
    intervaloRef.current = setInterval(avancar, 5000);
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [banners.length, pausado, avancar]);

  if (banners.length === 0) return null;

  const banner = banners[indice];

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className="group relative overflow-hidden rounded-2xl border border-[#eadfd5] bg-[#eadfd5] shadow-sm"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        <Link
          href={banner.linkUrl || "/tutoriais"}
          className="block aspect-[3/1] min-h-[140px] max-h-[320px] w-full sm:aspect-[4/1]"
        >
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${banner.imagemUrl})` }}
            role="img"
            aria-label={banner.titulo}
          />
        </Link>

        {/* Gradiente inferior com título */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6">
          <p className="text-sm font-bold text-white sm:text-base">{banner.titulo}</p>
        </div>

        {/* Botão voltar */}
        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); voltar(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#2a211d] shadow-md opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 sm:left-4 sm:h-10 sm:w-10"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Botão avançar */}
        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); avancar(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#2a211d] shadow-md opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 sm:right-4 sm:h-10 sm:w-10"
            aria-label="Próximo banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Indicadores (bolinhas) */}
        {banners.length > 1 && (
          <div className="absolute bottom-1 right-3 flex gap-1.5 sm:bottom-3 sm:right-4">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.preventDefault(); setIndice(i); }}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === indice ? "w-6 bg-white" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Ir para banner ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Botão pausar/play */}
        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setPausado(!pausado); }}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white/70 opacity-0 transition-opacity hover:bg-black/50 hover:text-white group-hover:opacity-100 sm:right-4 sm:top-4"
            aria-label={pausado ? "Retomar rotação" : "Pausar rotação"}
          >
            {pausado ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
