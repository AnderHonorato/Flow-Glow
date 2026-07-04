"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cabecalho, Rodape } from "@/components/layout";
import { Cartao, Botao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

interface TutorialComprado {
  tutorialId: string;
  titulo: string;
  slug: string;
  imagemCapaUrl: string;
  progresso: number;
  modulos: { id: string; titulo: string; ordem: number; videoUrl: string; duracaoMinutos: number }[];
}

export default function PaginaMeusTutoriais() {
  const { usuario, accessToken } = useAutenticacao();
  const [tutoriais, setTutoriais] = useState<TutorialComprado[]>([]);
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
        if (dados.sucesso) setTutoriais(dados.dados);
      } catch {}
      setCarregando(false);
    }
    carregar();
  }, [accessToken]);

  return (
    <>
      <Cabecalho />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Meus Tutoriais</h1>
        <p className="text-[var(--color-texto)]/60 mb-8">
          Continue de onde parou, {usuario?.nomeCompleto?.split(" ")[0]}.
        </p>

        {carregando ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-[var(--color-bege)] border-t-[var(--color-berry)] rounded-full" />
          </div>
        ) : tutoriais.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-serif text-xl font-bold mb-3">
              Você ainda não tem nenhum tutorial
            </h2>
            <p className="text-[var(--color-texto)]/60 mb-6">
              Que tal começar pelo mais vendido?
            </p>
            <Link href="/tutoriais">
              <Botao variante="primario">Explorar Tutoriais</Botao>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tutoriais.map((tutorial) => (
              <Link key={tutorial.tutorialId} href={`/meus-tutoriais/${tutorial.slug}`}>
                <Cartao className="h-full hover:border-[var(--color-berry)] transition-colors cursor-pointer">
                  <div className="aspect-video bg-[var(--color-bege)] rounded-lg mb-3 overflow-hidden">
                    {tutorial.imagemCapaUrl && (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${tutorial.imagemCapaUrl})` }}
                      />
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-lg">{tutorial.titulo}</h3>
                  <p className="text-sm text-[var(--color-texto)]/40 mt-1">
                    {tutorial.modulos.length} aulas
                  </p>
                  {/* Barra de progresso */}
                  <div className="mt-3 h-1 bg-[var(--color-bege)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-berry)] rounded-full transition-all"
                      style={{ width: `${tutorial.progresso}%` }}
                    />
                  </div>
                </Cartao>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Rodape />
    </>
  );
}
