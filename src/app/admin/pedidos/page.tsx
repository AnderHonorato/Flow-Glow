"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao } from "@/components/ui";
import { Download } from "lucide-react";
import { exportarCSV, exportarTXT } from "@/lib/exportar";

const coresStatus: Record<string, string> = { PENDENTE: "bg-yellow-100 text-yellow-700", PROCESSANDO: "bg-blue-100 text-blue-700", APROVADO: "bg-green-100 text-green-700", RECUSADO: "bg-red-100 text-red-700", REEMBOLSADO: "bg-purple-100 text-purple-700" };

export default function PaginaAdminPedidos() {
  const { accessToken } = useAutenticacao();
  const [pedidos, setPedidos] = useState<{id:string;status:string;valorTotal:number;comprovanteUrl:string|null;usuario:{nomeCompleto:string;email:string};itens:{tutorial:string;preco:number}[];criadoEm:string}[]>([]);
  useEffect(() => { fetch("/api/admin/pedidos", { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()).then(d => { if (d.sucesso) setPedidos(d.dados); }); }, [accessToken]);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-2">
          <Botao tamanho="pequeno" variante="contorno" onClick={() => {
            exportarCSV(
              ["ID", "Cliente", "Email", "Status", "Valor", "Itens", "Data"],
              pedidos.map(p => [p.id.slice(0,8), p.usuario.nomeCompleto, p.usuario.email, p.status, String(p.valorTotal.toFixed(2)), p.itens.map(i => i.tutorial).join(" | "), new Date(p.criadoEm).toLocaleDateString("pt-BR")]),
              "pedidos"
            );
          }}>
            <Download className="h-4 w-4" /> CSV
          </Botao>
          <Botao tamanho="pequeno" variante="contorno" onClick={() => {
            const txt = pedidos.map(p =>
              `ID: ${p.id.slice(0,8)}\nCliente: ${p.usuario.nomeCompleto}\nEmail: ${p.usuario.email}\nStatus: ${p.status}\nValor: R$ ${p.valorTotal.toFixed(2)}\nItens: ${p.itens.map(i => i.tutorial+" R$ "+i.preco).join(", ")}\nData: ${new Date(p.criadoEm).toLocaleDateString("pt-BR")}\n---`
            ).join("\n");
            exportarTXT(txt, "pedidos");
          }}>
            <Download className="h-4 w-4" /> TXT
          </Botao>
        </div>
      </div>
      <div className="space-y-4">
        {pedidos.map((p) => (
          <Cartao key={p.id}>
            <div className="flex items-center justify-between mb-2">
              <div><span className="text-xs text-[var(--color-texto)]/40 font-mono">{p.id.slice(0,8)}...</span><p className="text-sm">{p.usuario.nomeCompleto} · {p.usuario.email}</p></div>
              <div className="text-right"><span className={`text-xs px-2 py-1 rounded-full ${coresStatus[p.status]||""}`}>{p.status}</span><p className="font-bold mt-1">R$ {p.valorTotal.toFixed(2)}</p></div>
            </div>
            <div className="text-xs text-[var(--color-texto)]/50">{p.itens.map((i,idx)=><span key={idx}>{i.tutorial}{idx<p.itens.length-1?" · ":""}</span>)}<span className="ml-2">{new Date(p.criadoEm).toLocaleDateString("pt-BR")}</span></div>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
