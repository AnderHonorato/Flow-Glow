"use client";

import { Clock3, MessageCircle, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao } from "@/components/ui";

interface ConversaAdmin {
  id: string;
  protocolo: string;
  status: "TRIAGEM" | "AGUARDANDO_ATENDENTE" | "EM_ATENDIMENTO" | "ENCERRADA";
  assunto: string | null;
  posicaoFila: number;
  tempoFilaMinutos: number;
  usuario: { nomeCompleto: string; fotoPerfilUrl: string | null };
  atendente: { nomeCompleto: string; fotoPerfilUrl: string | null } | null;
  mensagens: { id: string; texto: string | null; tipo: string; criadoEm: string; remetente: { nomeCompleto: string; papel?: string } }[];
  atualizadoEm: string;
}

function rotuloStatus(status: ConversaAdmin["status"]) {
  if (status === "TRIAGEM") return "Triagem";
  if (status === "AGUARDANDO_ATENDENTE") return "Na fila";
  if (status === "EM_ATENDIMENTO") return "Em atendimento";
  return "Encerrado";
}

export default function PaginaAdminChat() {
  const { accessToken } = useAutenticacao();
  const router = useRouter();
  const [conversas, setConversas] = useState<ConversaAdmin[]>([]);

  async function carregar() {
    if (!accessToken) return;
    const resposta = await fetch("/api/chat", {
      cache: "no-store",
      credentials: "include",
    });
    const dados = await resposta.json();
    if (dados.sucesso) setConversas(dados.dados);
  }

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 5000);
    return () => clearInterval(intervalo);
  }, [accessToken]);

  return (
    <div>
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
          <MessageCircle className="h-4 w-4" aria-hidden />
          Atendimento
        </span>
        <h1 className="mt-1 text-3xl font-bold">Conversas recebidas</h1>
      </div>

      {conversas.length === 0 ? (
        <Cartao>Nenhuma conversa recebida.</Cartao>
      ) : (
        <div className="grid gap-3">
          {conversas.map((conversa) => {
            const ultima = conversa.mensagens[conversa.mensagens.length - 1];
            return (
              <button
                key={conversa.id}
                type="button"
                onClick={() => router.push(`/admin/chat/${conversa.id}`)}
                className="text-left"
              >
                <Cartao className="hover:border-[var(--color-berry)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{conversa.protocolo}</h3>
                        <span className="rounded-full bg-[var(--color-linha)] px-2 py-0.5 text-xs font-bold text-[var(--color-texto-suave)]">
                          {rotuloStatus(conversa.status)}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-[var(--color-texto-suave)]">
                        <UserRound className="h-4 w-4" aria-hidden />
                        {conversa.usuario.nomeCompleto}
                      </p>
                      {ultima && (
                        <p className="mt-1 truncate text-sm text-[var(--color-texto)]/70">
                          {ultima.remetente.nomeCompleto}: {ultima.texto}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-[var(--color-texto-suave)] sm:text-right">
                      {conversa.status === "AGUARDANDO_ATENDENTE" && (
                        <p className="inline-flex items-center gap-1 font-bold text-[var(--color-berry)]">
                          <Clock3 className="h-4 w-4" aria-hidden />
                          {conversa.tempoFilaMinutos} min aprox.
                        </p>
                      )}
                      {conversa.atendente && <p>Com {conversa.atendente.nomeCompleto}</p>}
                      <p>{new Date(conversa.atualizadoEm).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </Cartao>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
