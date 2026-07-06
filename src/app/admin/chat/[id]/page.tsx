"use client";

import { ArrowLeft, MessageCircle, Paperclip, Send, Shuffle, SquareCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { AvatarUsuario, Botao, Cartao } from "@/components/ui";

interface AnexoChat {
  id?: string;
  tipo: "IMAGEM" | "VIDEO";
  url: string;
}

interface Mensagem {
  id: string;
  texto: string | null;
  tipo: "CLIENTE" | "ATENDENTE" | "BOT" | "SISTEMA";
  remetente: { id: string; nomeCompleto: string; fotoPerfilUrl: string | null; papel?: string };
  anexos: AnexoChat[];
  criadoEm: string;
}

interface Conversa {
  id: string;
  protocolo: string;
  status: "TRIAGEM" | "AGUARDANDO_ATENDENTE" | "EM_ATENDIMENTO" | "ENCERRADA";
  assunto: string | null;
  usuario: { nomeCompleto: string; fotoPerfilUrl: string | null; email: string };
  atendente: { id: string; nomeCompleto: string; fotoPerfilUrl: string | null } | null;
  tempoFilaMinutos: number;
  avaliacaoNota: number | null;
  avaliacaoTexto: string | null;
  mensagens: Mensagem[];
}

export default function PaginaAdminChatDetalhe() {
  const { accessToken, usuario } = useAutenticacao();
  const params = useParams();
  const conversaId = params.id as string;
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [nova, setNova] = useState("");
  const [anexos, setAnexos] = useState<AnexoChat[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function carregar() {
    if (!accessToken) return;
    const resposta = await fetch(`/api/chat?conversaId=${conversaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const dados = await resposta.json();
    if (dados.sucesso) setConversa(dados.dados[0] || null);
  }

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 4000);
    return () => clearInterval(intervalo);
  }, [accessToken, conversaId]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversa?.mensagens]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [nova]);

  async function acaoAdmin(acao: "iniciar" | "transferir" | "encerrar", texto?: string) {
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ conversaId, acao, texto }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) setConversa(dados.dados);
      else setErro(dados.erro || "Nao foi possivel processar.");
    } catch {
      setErro("Erro de conexao.");
    }
    setEnviando(false);
  }

  async function anexarArquivos(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setEnviando(true);
    const novos: AnexoChat[] = [];
    for (const arquivo of Array.from(arquivos).slice(0, 4)) {
      const form = new FormData();
      form.append("arquivo", arquivo);
      try {
        const resposta = await fetch("/api/upload", { method: "POST", body: form });
        const dados = await resposta.json();
        if (dados.sucesso) novos.push({ tipo: dados.dados.tipo, url: dados.dados.url });
        else setErro(dados.erro || "Nao foi possivel anexar.");
      } catch {
        setErro("Erro ao anexar arquivo.");
      }
    }
    setAnexos((atuais) => [...atuais, ...novos].slice(0, 4));
    setEnviando(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function responder(e?: FormEvent) {
    if (e) e.preventDefault();
    const texto = nova.trim();
    if (!texto && anexos.length === 0) return;
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ conversaId, acao: "responder", texto, anexos }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setConversa(dados.dados);
        setNova("");
        setAnexos([]);
      } else {
        setErro(dados.erro || "Nao foi possivel enviar.");
      }
    } catch {
      setErro("Erro ao enviar.");
    }
    setEnviando(false);
  }

  function aoPressionarTecla(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      responder();
    }
  }

  if (!conversa) {
    return (
      <Cartao>
        <p>Carregando conversa...</p>
      </Cartao>
    );
  }

  const meuAtendimento = conversa.atendente?.id === usuario?.id;
  const bloqueadaPorOutro = conversa.atendente && !meuAtendimento;
  const podeResponder = conversa.status === "EM_ATENDIMENTO" && meuAtendimento;

  return (
    <div className="flex flex-col gap-3" style={{ height: "calc(100vh - 5rem)" }}>
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/chat" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-linha)]/60">
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-berry)] text-white">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black">{conversa.protocolo}</h1>
            <p className="truncate text-sm text-[var(--color-texto-suave)]">
              {conversa.usuario.nomeCompleto} · {conversa.status.replaceAll("_", " ").toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {meuAtendimento && conversa.status !== "ENCERRADA" && (
            <>
              <Botao type="button" tamanho="pequeno" variante="contorno" onClick={() => acaoAdmin("transferir")} carregando={enviando}>
                <Shuffle className="h-4 w-4" aria-hidden />
                Transferir
              </Botao>
              <Botao type="button" tamanho="pequeno" variante="perigo" onClick={() => acaoAdmin("encerrar")} carregando={enviando}>
                <XCircle className="h-4 w-4" aria-hidden />
                Encerrar
              </Botao>
            </>
          )}
        </div>
      </div>

      {erro && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{erro}</p>}
      {bloqueadaPorOutro && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          Atendimento bloqueado com {conversa.atendente?.nomeCompleto}. Aguarde transferencia para responder.
        </p>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] p-4">
        {conversa.mensagens.map((msg) => {
          const meu = msg.remetente.id === usuario?.id;
          const sistema = msg.tipo === "SISTEMA";
          if (sistema) {
            return (
              <p key={msg.id} className="mx-auto max-w-xl rounded-full bg-[var(--color-linha)]/70 px-3 py-1.5 text-center text-xs font-semibold text-[var(--color-texto-suave)]">
                {msg.texto}
              </p>
            );
          }
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${meu ? "justify-end" : "justify-start"}`}>
              {!meu && <AvatarUsuario nome={msg.remetente.nomeCompleto} fotoUrl={msg.remetente.fotoPerfilUrl} tamanho="pequeno" />}
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${meu ? "rounded-br-md bg-[var(--color-berry)] text-white" : "rounded-bl-md bg-[var(--color-linha)] text-[var(--color-texto)]"}`}>
                <p className="mb-0.5 text-[10px] font-medium opacity-70">{msg.remetente.nomeCompleto}</p>
                {msg.texto && <p className="whitespace-pre-wrap break-words">{msg.texto}</p>}
                {msg.anexos?.length > 0 && (
                  <div className="mt-2 grid gap-2">
                    {msg.anexos.map((anexo, indice) =>
                      anexo.tipo === "VIDEO" ? (
                        <video key={`${msg.id}-${indice}`} src={anexo.url} controls className="max-h-52 rounded-lg" />
                      ) : (
                        <img key={`${msg.id}-${indice}`} src={anexo.url} alt="Anexo enviado" className="max-h-52 rounded-lg object-cover" />
                      )
                    )}
                  </div>
                )}
                <span className="mt-1 block text-[10px] opacity-50">
                  {new Date(msg.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {meu && <AvatarUsuario nome={msg.remetente.nomeCompleto} fotoUrl={msg.remetente.fotoPerfilUrl} tamanho="pequeno" />}
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>

      {conversa.status === "ENCERRADA" ? (
        <Cartao>
          <p className="text-sm text-[var(--color-texto-suave)]">
            Protocolo encerrado. Avaliacao: {conversa.avaliacaoNota ? `${conversa.avaliacaoNota} estrela(s)` : "ainda nao enviada"}.
          </p>
          {conversa.avaliacaoTexto && <p className="mt-2 text-sm">{conversa.avaliacaoTexto}</p>}
        </Cartao>
      ) : (
        <div className="flex flex-col gap-2">
          {!meuAtendimento && (
            <Botao type="button" tamanho="medio" onClick={() => acaoAdmin("iniciar")} carregando={enviando} disabled={Boolean(bloqueadaPorOutro)} className="w-full">
              <SquareCheck className="h-4 w-4" aria-hidden />
              Iniciar atendimento
            </Botao>
          )}
          <form onSubmit={responder} className="flex flex-col gap-2">
            {anexos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {anexos.map((anexo, indice) => (
                  <span key={`${anexo.url}-${indice}`} className="rounded-full bg-[var(--color-linha)] px-2 py-1 text-xs font-bold">
                    {anexo.tipo.toLowerCase()}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)]">
                <Paperclip className="h-4 w-4" aria-hidden />
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple className="hidden" onChange={(e) => anexarArquivos(e.target.files)} />
              <textarea
                ref={textareaRef}
                value={nova}
                onChange={(e) => setNova(e.target.value)}
                onKeyDown={aoPressionarTecla}
                placeholder={podeResponder ? "Responder... (Enter envia, Shift+Enter nova linha)" : "Clique em iniciar atendimento para responder"}
                disabled={!podeResponder}
                rows={1}
                className="max-h-40 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-berry)]/20 disabled:opacity-60"
              />
              <Botao type="submit" carregando={enviando} disabled={!podeResponder || (!nova.trim() && anexos.length === 0)}>
                <Send className="h-4 w-4" />
              </Botao>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
