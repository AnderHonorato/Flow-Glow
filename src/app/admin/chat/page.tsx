"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { useRouter } from "next/navigation";
import { Botao } from "@/components/ui";

interface ConversaAdmin { id: string; usuario: { nomeCompleto: string; fotoPerfilUrl: string | null }; mensagens: { id: string; texto: string; remetente: { nomeCompleto: string }; lida: boolean; criadoEm: string }[]; }

export default function PaginaAdminChat() {
  const { accessToken } = useAutenticacao();
  const router = useRouter();
  const [conversas, setConversas] = useState<ConversaAdmin[]>([]);
  useEffect(() => {
    async function carregar() { const r = await fetch("/api/chat", { headers: { Authorization: `Bearer ${accessToken}` } }); const d = await r.json(); if (d.sucesso) setConversas(d.dados); }
    carregar(); const i = setInterval(carregar, 5000); return () => clearInterval(i);
  }, [accessToken]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Conversas de Suporte</h1>
      {conversas.length === 0 ? <p className="text-[var(--color-texto)]/40">Nenhuma conversa ativa.</p> : (
        <div className="space-y-4">
          {conversas.map((conv) => {
            const ultima = conv.mensagens[conv.mensagens.length - 1];
            const naoLidas = conv.mensagens.filter(m => !m.lida && m.remetente.nomeCompleto !== "Admin").length;
            return (
              <div key={conv.id} onClick={() => router.push(`/admin/chat/${conv.id}`)} className="bg-white rounded-xl border border-[var(--color-bege)] p-4 shadow-sm hover:border-[var(--color-berry)] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div><h3 className="font-medium">{conv.usuario.nomeCompleto}</h3>{ultima && <p className="text-sm text-[var(--color-texto)]/50 truncate max-w-md">{ultima.texto}</p>}</div>
                  {naoLidas > 0 && <span className="bg-[var(--color-berry)] text-white text-xs font-bold px-2 py-1 rounded-full">{naoLidas}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
