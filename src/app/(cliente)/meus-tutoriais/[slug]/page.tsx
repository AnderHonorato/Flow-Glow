"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/layout";
import { Cartao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

interface ModuloPlayer {
  id: string;
  titulo: string;
  ordem: number;
  videoUrl: string;
  duracaoMinutos: number;
  gratuito: boolean;
}

interface TutorialPlayer {
  tutorialId: string;
  titulo: string;
  slug: string;
  imagemCapaUrl: string;
  modulos: ModuloPlayer[];
}

export default function PaginaPlayer() {
  const params = useParams();
  const slug = params.slug as string;
  const { accessToken } = useAutenticacao();

  const [tutorial, setTutorial] = useState<TutorialPlayer | null>(null);
  const [moduloAtual, setModuloAtual] = useState<ModuloPlayer | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setCarregando(false);
      return;
    }

    async function carregar() {
      try {
        const resposta = await fetch("/api/usuarios/meus-tutoriais", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const dados = await resposta.json();
        if (dados.sucesso) {
          const encontrado = dados.dados.find((t: TutorialPlayer) => t.slug === slug);
          if (encontrado) {
            setTutorial(encontrado);
            setModuloAtual(encontrado.modulos[0] || null);
          }
        }
      } catch {}
      setCarregando(false);
    }
    carregar();
  }, [accessToken, slug]);

  if (carregando) {
    return (
      <>
        <Cabecalho />
        <div className="flex justify-center py-10 sm:py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-bege)] border-t-[var(--color-berry)] rounded-full" />
        </div>
        <Rodape />
      </>
    );
  }

  if (!tutorial) {
    return (
      <>
        <Cabecalho />
        <main className="max-w-3xl mx-auto px-4 py-10 sm:py-16 text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Tutorial não encontrado</h1>
          <p className="text-[var(--color-texto)]/60 mb-6">
            Você não comprou este tutorial ou ele não existe.
          </p>
          <Link href="/meus-tutoriais" className="text-[var(--color-berry)] hover:underline">
            ← Voltar para Meus Tutoriais
          </Link>
        </main>
        <Rodape />
      </>
    );
  }

  return (
    <>
      <Cabecalho />
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Player de vídeo */}
        <main className="flex-1 bg-black">
          <div className="aspect-video max-h-[70vh] bg-gray-900 flex items-center justify-center">
            {moduloAtual ? (
              <video
                key={moduloAtual.id}
                src={moduloAtual.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
                poster={tutorial.imagemCapaUrl}
              />
            ) : (
              <p className="text-white/50">Selecione uma aula para começar</p>
            )}
          </div>
          <div className="p-4 text-white">
            <h1 className="font-serif text-xl font-bold">{tutorial.titulo}</h1>
            {moduloAtual && (
              <p className="text-sm text-white/60 mt-1">
                Aula {moduloAtual.ordem}: {moduloAtual.titulo}
              </p>
            )}
          </div>
        </main>

        {/* Sidebar de aulas */}
        <aside className="w-full border-l border-[var(--color-linha)] bg-[var(--color-papel)] lg:w-96 overflow-y-auto">
          <div className="p-4 border-b border-[var(--color-bege)]">
            <h2 className="font-medium">Conteúdo do Tutorial</h2>
            <p className="text-sm text-[var(--color-texto)]/50">
              {tutorial.modulos.length} aulas
            </p>
          </div>
          <div className="divide-y divide-[var(--color-bege)]">
            {tutorial.modulos.map((modulo) => (
              <button
                key={modulo.id}
                onClick={() => setModuloAtual(modulo)}
                className={`w-full text-left p-4 transition-colors cursor-pointer hover:bg-[var(--color-fundo)] ${
                  moduloAtual?.id === modulo.id
                    ? "bg-[var(--color-berry)]/5 border-l-4 border-[var(--color-berry)]"
                    : "border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[var(--color-texto)]/40 w-6">
                    {String(modulo.ordem).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{modulo.titulo}</p>
                    <span className="text-xs text-[var(--color-texto)]/40">
                      {modulo.duracaoMinutos} min
                    </span>
                  </div>
                  {moduloAtual?.id === modulo.id && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-berry)]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
