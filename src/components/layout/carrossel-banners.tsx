"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";

interface Banner {
  id: string;
  titulo: string;
  imagemUrl: string;
  linkUrl: string;
  corFundo: string | null;
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

  useEffect(() => {
    if (banners.length <= 1 || pausado) return;
    intervaloRef.current = setInterval(avancar, 8000);
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [banners.length, pausado, avancar]);

  if (banners.length === 0) return null;

  const banner = banners[indice];

  return (
    <div className="mx-auto max-w-7xl px-3 pt-2 sm:px-5 sm:pt-3 lg:px-8">
      <div
        className="group relative overflow-hidden rounded-2xl border border-[var(--color-linha)]"
        style={{ background: banner.corFundo || "var(--color-bege, #e9efed)" }}
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        <Link
          href={banner.linkUrl || "/tutoriais"}
          className="block aspect-[1.85/1] min-h-[132px] max-h-[320px] w-full sm:aspect-[4/1]"
        >
          <img
            src={banner.imagemUrl}
            alt={banner.titulo}
            className="h-full w-full object-cover"
          />
        </Link>

        {banner.titulo && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6">
            <p className="text-sm font-bold text-white sm:text-base">{banner.titulo}</p>
          </div>
        )}

        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); voltar(); }}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-[#2a211d] shadow-md transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100 sm:left-4 sm:h-10 sm:w-10"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); avancar(); }}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-[#2a211d] shadow-md transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100 sm:right-4 sm:h-10 sm:w-10"
            aria-label="Próximo banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

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

        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setPausado(!pausado); }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-opacity hover:bg-black/55 md:opacity-0 md:group-hover:opacity-100 sm:right-4 sm:top-4"
            aria-label={pausado ? "Retomar rotação" : "Pausar rotação"}
          >
            {pausado ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
