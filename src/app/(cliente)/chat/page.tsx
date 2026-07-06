"use client";

import { MessageCircle, Plus, Send, Star } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { AvatarUsuario, Botao, Cartao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

interface Mensagem {
  id: string;
  texto: string | null;
  tipo: "CLIENTE" | "ATENDENTE" | "BOT" | "SISTEMA";
  remetente: { id: string; nomeCompleto: string; fotoPerfilUrl: string | null };
  criadoEm: string;
}

interface Conversa {
  id: string;
  protocolo: string;
  status: "TRIAGEM" | "AGUARDANDO_ATENDENTE" | "EM_ATENDIMENTO" | "ENCERRADA";
  tempoFilaMinutos: number;
  avaliacaoNota: number | null;
  mensagens: Mensagem[];
}

const opcoes = [
  { id: "pedido", texto: "Pedido ou compra" },
  { id: "pagamento", texto: "Pagamento" },
  { id: "acesso", texto: "Acesso a conta" },
  { id: "outro", texto: "Outro assunto" },
];

export default function PaginaChat() {
  const { usuario, accessToken } = useAutenticacao();
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [avaliacaoTexto, setAvaliacaoTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  async function carregar() {
    if (!accessToken) return;
    try {
      const r = await fetch("/api/chat", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const d = await r.json();
      if (d.sucesso) setConversa(d.dados[0] || null);
    } catch {
      setErro("Nao foi possivel carregar o chat.");
    }
  }

  useEffect(() => {
    carregar();
    const i = window.setInterval(carregar, 4000);
    return () => window.clearInterval(i);
  }, [accessToken]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversa?.mensagens]);

  async function enviarPayload(payload: Record<string, unknown>) {
    setEnviando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setConversa(dados.dados);
        setNovaMensagem("");
      } else {
        setErro(dados.erro || "Nao foi possivel enviar.");
      }
    } catch {
      setErro("Erro de conexao ao enviar.");
    }
    setEnviando(false);
  }

  async function novoAtendimento() {
    await enviarPayload({ acao: "novo" });
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const texto = novaMensagem.trim();
    if (!texto || !usuario) return;
    await enviarPayload({ texto });
  }

  async function avaliar(nota: number) {
    if (!conversa) return;
    await enviarPayload({
      acao: "avaliar",
      conversaId: conversa.id,
      nota,
      texto: avaliacaoTexto,
    });
  }

  return (
    <>
      <Cabecalho />
      <div className="mx-auto flex max-w-3xl flex-col px-4 py-5" style={{ height: "calc(100dvh - 7rem)" }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <MessageCircle className="h-5 w-5 text-[var(--color-berry)]" aria-hidden />
              {conversa?.protocolo || "Fale conosco"}
            </h1>
            {conversa && (
              <p className="text-sm text-[var(--color-texto-suave)]">
                {conversa.status === "AGUARDANDO_ATENDENTE" ? `Fila aproximada: ${conversa.tempoFilaMinutos} min` : conversa.status}
              </p>
            )}
          </div>
          <Botao type="button" tamanho="pequeno" onClick={novoAtendimento} carregando={enviando}>
            <Plus className="h-4 w-4" aria-hidden />
            Novo
          </Botao>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_90%,transparent)] p-4 backdrop-blur-sm">
          {erro && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{erro}</p>}
          {!conversa ? (
            <Cartao>
              <p className="mb-3 text-sm text-[var(--color-texto-suave)]">
                Abra um protocolo para iniciar com o Bot MCA.
              </p>
              <Botao type="button" onClick={novoAtendimento} carregando={enviando}>
                <Plus className="h-4 w-4" aria-hidden />
                Novo atendimento
              </Botao>
            </Cartao>
          ) : (
            conversa.mensagens.map((msg) => {
              const meu = msg.remetente.id === usuario?.id;
              if (msg.tipo === "SISTEMA") {
                return <p key={msg.id} className="mx-auto max-w-xl rounded-full bg-[var(--color-linha)] px-3 py-1.5 text-center text-xs font-semibold text-[var(--color-texto-suave)]">{msg.texto}</p>;
              }
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${meu ? "justify-end" : "justify-start"}`}>
                  {!meu && <AvatarUsuario nome={msg.remetente.nomeCompleto} fotoUrl={msg.remetente.fotoPerfilUrl} tamanho="pequeno" />}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${meu ? "rounded-br-md bg-[var(--color-berry)] text-white" : "rounded-bl-md bg-[var(--color-linha)] text-[var(--color-texto)]"}`}>
                    <p className="mb-0.5 text-[10px] font-medium opacity-70">{msg.remetente.nomeCompleto}</p>
                    <p className="whitespace-pre-wrap break-words">{msg.texto}</p>
                    <span className="mt-1 block text-[10px] opacity-50">{new Date(msg.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {meu && <AvatarUsuario nome={msg.remetente.nomeCompleto} fotoUrl={msg.remetente.fotoPerfilUrl} tamanho="pequeno" />}
                </div>
              );
            })
          )}
          <div ref={fimRef} />
        </div>

        {conversa?.status === "TRIAGEM" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {opcoes.map((opcao) => (
              <button key={opcao.id} type="button" onClick={() => enviarPayload({ texto: opcao.texto, opcaoId: opcao.id })} className="min-h-10 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-2 text-sm font-bold">
                {opcao.texto}
              </button>
            ))}
          </div>
        )}

        {conversa?.status === "ENCERRADA" ? (
          <div className="mt-3 rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] p-3">
            {conversa.avaliacaoNota ? (
              <p className="text-sm font-semibold text-green-700">Avaliacao enviada.</p>
            ) : (
              <div className="grid gap-2">
                <textarea value={avaliacaoTexto} onChange={(e) => setAvaliacaoTexto(e.target.value)} placeholder="Comentario opcional" className="min-h-16 rounded-xl border border-[var(--color-linha)] px-3 py-2 text-sm" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((nota) => (
                    <button key={nota} type="button" onClick={() => avaliar(nota)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ouro)]">
                      <Star className="h-5 w-5 fill-current" aria-hidden />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : conversa ? (
          <form onSubmit={enviar} className="mt-3 flex gap-2">
            <textarea
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-4 py-3 text-sm text-[var(--color-texto)] outline-none focus:ring-2 focus:ring-[var(--color-berry)]/20"
            />
            <Botao type="submit" carregando={enviando} disabled={!novaMensagem.trim()}>
              <Send className="h-4 w-4" aria-hidden />
            </Botao>
          </form>
        ) : null}
      </div>
      <Rodape />
    </>
  );
}
