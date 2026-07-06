"use client";

import { MessageCircle, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao } from "@/components/ui";

interface ComentarioProduto {
  id: string;
  nota: number;
  texto: string;
  usuario: { nomeCompleto: string };
  tutorial: { titulo: string };
  criadoEm: string;
}

interface AvaliacaoAtendimento {
  id: string;
  protocolo: string;
  assunto: string | null;
  avaliacaoNota: number | null;
  avaliacaoTexto: string | null;
  avaliacaoEnviadaEm: string | null;
  encerradoPor: string | null;
  usuario: { nomeCompleto: string; email: string };
  atendente: { nomeCompleto: string; email: string } | null;
}

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--color-ouro)]">
      {Array.from({ length: 5 }).map((_, indice) => (
        <Star
          key={indice}
          className={`h-4 w-4 ${indice < nota ? "fill-current" : ""}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function PaginaAdminComentarios() {
  const { accessToken } = useAutenticacao();
  const [aba, setAba] = useState<"produtos" | "atendimento">("produtos");
  const [comentarios, setComentarios] = useState<ComentarioProduto[]>([]);
  const [atendimentos, setAtendimentos] = useState<AvaliacaoAtendimento[]>([]);

  async function carregar() {
    const resposta = await fetch("/api/admin/comentarios", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const dados = await resposta.json();
    if (dados.sucesso) {
      setComentarios(dados.dados.comentarios || []);
      setAtendimentos(dados.dados.atendimentos || []);
    }
  }

  useEffect(() => {
    if (accessToken) carregar();
  }, [accessToken]);

  async function remover(id: string) {
    await fetch(`/api/admin/comentarios?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setComentarios((atuais) => atuais.filter((comentario) => comentario.id !== id));
  }

  return (
    <div>
      <div className="mb-6">
        <span className="text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
          Avaliacoes
        </span>
        <h1 className="mt-1 text-3xl font-bold">Experiencias dos clientes</h1>
      </div>

      <div className="mb-5 inline-flex rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] p-1">
        <button
          type="button"
          onClick={() => setAba("produtos")}
          className={`rounded-md px-3 py-2 text-sm font-bold ${aba === "produtos" ? "bg-[var(--color-berry)] text-white" : "text-[var(--color-texto-suave)]"}`}
        >
          Produtos
        </button>
        <button
          type="button"
          onClick={() => setAba("atendimento")}
          className={`rounded-md px-3 py-2 text-sm font-bold ${aba === "atendimento" ? "bg-[var(--color-berry)] text-white" : "text-[var(--color-texto-suave)]"}`}
        >
          Atendimento
        </button>
      </div>

      {aba === "produtos" ? (
        <div className="space-y-4">
          {comentarios.length === 0 ? (
            <Cartao>Nenhuma avaliacao de produto.</Cartao>
          ) : (
            comentarios.map((comentario) => (
              <Cartao key={comentario.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">{comentario.usuario.nomeCompleto}</span>
                      <Estrelas nota={comentario.nota} />
                    </div>
                    <p className="mb-1 text-sm text-[var(--color-texto-suave)]">
                      Tutorial: {comentario.tutorial.titulo}
                    </p>
                    <p className="text-sm">{comentario.texto}</p>
                    <span className="mt-2 block text-xs text-[var(--color-texto-suave)]">
                      {new Date(comentario.criadoEm).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <Botao variante="fantasma" tamanho="pequeno" onClick={() => remover(comentario.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remover
                  </Botao>
                </div>
              </Cartao>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {atendimentos.length === 0 ? (
            <Cartao>Nenhuma avaliacao de atendimento ainda.</Cartao>
          ) : (
            atendimentos.map((item) => (
              <Cartao key={item.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.protocolo}</span>
                      <Estrelas nota={item.avaliacaoNota || 0} />
                    </div>
                    <p className="text-sm text-[var(--color-texto-suave)]">
                      Cliente: {item.usuario.nomeCompleto} ({item.usuario.email})
                    </p>
                    <p className="text-sm text-[var(--color-texto-suave)]">
                      Atendente: {item.atendente?.nomeCompleto || item.encerradoPor || "Nao informado"}
                    </p>
                    {item.avaliacaoTexto && <p className="mt-2 text-sm">{item.avaliacaoTexto}</p>}
                    <span className="mt-2 block text-xs text-[var(--color-texto-suave)]">
                      Enviada em {item.avaliacaoEnviadaEm ? new Date(item.avaliacaoEnviadaEm).toLocaleString("pt-BR") : "-"}
                    </span>
                  </div>
                  <Link href={`/admin/chat/${item.id}`}>
                    <Botao variante="contorno" tamanho="pequeno">
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      Ver conversa
                    </Botao>
                  </Link>
                </div>
              </Cartao>
            ))
          )}
        </div>
      )}
    </div>
  );
}
