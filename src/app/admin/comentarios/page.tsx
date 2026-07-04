"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao } from "@/components/ui";

export default function PaginaAdminComentarios() {
  const { accessToken } = useAutenticacao();
  const [comentarios, setComentarios] = useState<{id:string;nota:number;texto:string;usuario:{nomeCompleto:string};tutorial:{titulo:string};criadoEm:string}[]>([]);
  useEffect(() => { fetch("/api/admin/comentarios", { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()).then(d => { if (d.sucesso) setComentarios(d.dados); }); }, [accessToken]);
  async function remover(id: string) { await fetch(`/api/admin/comentarios?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }); setComentarios(p => p.filter(c => c.id !== id)); }
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Moderação de Comentários</h1>
      <div className="space-y-4">
        {comentarios.map((c) => (
          <Cartao key={c.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{c.usuario.nomeCompleto}</span><span className="text-[var(--color-dourado)] text-sm">{"★".repeat(c.nota)}{"☆".repeat(5-c.nota)}</span></div>
                <p className="text-sm text-[var(--color-texto)]/60 mb-1">Tutorial: {c.tutorial.titulo}</p>
                <p className="text-sm">{c.texto}</p>
                <span className="text-xs text-[var(--color-texto)]/40">{new Date(c.criadoEm).toLocaleDateString("pt-BR")}</span>
              </div>
              <Botao variante="fantasma" tamanho="pequeno" onClick={() => remover(c.id)} className="text-red-500 hover:text-red-700">Remover</Botao>
            </div>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
