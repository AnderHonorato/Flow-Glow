"use client";

import { Send, Smile } from "lucide-react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao } from "@/components/ui";
import { useParams } from "next/navigation";

export default function PaginaAdminChatDetalhe() {
  const { accessToken, usuario } = useAutenticacao();
  const params = useParams();
  const conversaId = params.id as string;
  const [mensagens, setMensagens] = useState<{ id: string; texto: string; remetente: { nomeCompleto: string }; lida: boolean; criadoEm: string }[]>([]);
  const [nova, setNova] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  async function carregar() {
    const r = await fetch("/api/chat", { headers: { Authorization: `Bearer ${accessToken}` } });
    const d = await r.json();
    if (d.sucesso) {
      const conv = d.dados.find((c: { id: string }) => c.id === conversaId);
      if (conv) setMensagens(conv.mensagens);
    }
  }

  useEffect(() => { carregar(); const i = setInterval(carregar, 4000); return () => clearInterval(i); }, [accessToken, conversaId]);
  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensagens]);

  async function responder(e: FormEvent) {
    e.preventDefault();
    if (!nova.trim()) return;
    setEnviando(true);
    try {
      await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ conversaId, texto: nova }),
      });
      setNova("");
      carregar();
    } catch {}
    setEnviando(false);
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 6rem)" }}>
      <h1 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
        <Smile className="h-5 w-5 text-[var(--color-berry)]" /> Atendimento
      </h1>
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[var(--color-linha)] bg-white p-4 space-y-3">
        {mensagens.length === 0 ? (
          <p className="text-center text-[var(--color-texto)]/40 py-16">Nenhuma mensagem.</p>
        ) : (
          mensagens.map(msg => {
            const meu = msg.remetente.nomeCompleto === usuario?.nomeCompleto || msg.remetente.nomeCompleto === "Administrador Studio Glow";
            return (
              <div key={msg.id} className={`flex ${meu ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
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
      <form onSubmit={responder} className="mt-3 flex gap-2">
        <input type="text" value={nova} onChange={e => setNova(e.target.value)}
          placeholder="Responder..."
          className="flex-1 rounded-xl border border-[var(--color-linha-forte)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-berry)]/20" />
        <Botao type="submit" carregando={enviando} disabled={!nova.trim()}>
          <Send className="h-4 w-4" />
        </Botao>
      </form>
    </div>
  );
}
