"use client";

import { Send, Smile } from "lucide-react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao } from "@/components/ui";
import { Cabecalho, Rodape } from "@/components/layout";

interface Msg { id: string; texto: string; remetente: { nomeCompleto: string; fotoPerfilUrl: string | null }; lida: boolean; criadoEm: string; }
interface Conv { id: string; usuario: { nomeCompleto: string; fotoPerfilUrl: string | null }; mensagens: Msg[]; }

export default function PaginaChat() {
  const { usuario, accessToken } = useAutenticacao();
  const [conversa, setConversa] = useState<Conv | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  async function carregar() {
    if (!accessToken) return;
    try {
      const r = await fetch("/api/chat", { headers: { Authorization: `Bearer ${accessToken}` } });
      const d = await r.json();
      if (d.sucesso && d.dados.length > 0) setConversa(d.dados[0]);
    } catch {}
  }

  useEffect(() => { carregar(); }, [accessToken]);
  useEffect(() => {
    const i = setInterval(carregar, 4000);
    return () => clearInterval(i);
  }, [accessToken]);
  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversa?.mensagens]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!novaMensagem.trim()) return;
    setEnviando(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ texto: novaMensagem }),
      });
      setNovaMensagem("");
      carregar();
    } catch {}
    setEnviando(false);
  }

  const nomeUsuario = usuario?.nomeCompleto || "Você";

  return (
    <>
      <Cabecalho />
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-6" style={{ height: "calc(100dvh - 7rem)" }}>
        <h1 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
          <Smile className="h-5 w-5 text-[var(--color-berry)]" /> Fale Conosco
        </h1>

        <div className="flex-1 overflow-y-auto rounded-2xl border border-[var(--color-linha)] bg-white p-4 space-y-3">
          {!conversa || conversa.mensagens.length === 0 ? (
            <p className="text-center text-[var(--color-texto)]/40 py-16 text-sm">
              Envie uma mensagem abaixo. Nosso time responde em até 24h.
            </p>
          ) : (
            conversa.mensagens.map(msg => {
              const meu = msg.remetente.nomeCompleto === nomeUsuario || msg.remetente.nomeCompleto === usuario?.nomeCompleto;
              return (
                <div key={msg.id} className={`flex ${meu ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm ${
                    meu ? "bg-[var(--color-berry)] text-white rounded-br-md" : "bg-[var(--color-linha)] text-[var(--color-texto)] rounded-bl-md"
                  }`}>
                    <p className="text-[10px] opacity-70 mb-0.5 font-medium">{msg.remetente.nomeCompleto}</p>
                    <p className="whitespace-pre-wrap break-words">{msg.texto}</p>
                    <span className="text-[10px] opacity-50 mt-1 block">
                      {new Date(msg.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={fimRef} />
        </div>

        <form onSubmit={enviar} className="mt-3 flex gap-2">
          <input type="text" value={novaMensagem} onChange={e => setNovaMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 rounded-xl border border-[var(--color-linha-forte)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-berry)]/20" />
          <Botao type="submit" carregando={enviando} disabled={!novaMensagem.trim()} tamanho="medio">
            <Send className="h-4 w-4" />
          </Botao>
        </form>
      </div>
      <Rodape />
    </>
  );
}
