"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao, CampoTexto } from "@/components/ui";
import { Ticket, Trash2 } from "lucide-react";

interface CupomItem { id: string; codigo: string; descontoPercentual: number; ativo: boolean; validoAte: string; }

export default function PaginaAdminCupons() {
  const { accessToken } = useAutenticacao();
  const [cupons, setCupons] = useState<CupomItem[]>([]);
  const [codigo, setCodigo] = useState(""); const [desconto, setDesconto] = useState("");
  const [validade, setValidade] = useState(""); const [msg, setMsg] = useState(""); const [erro, setErro] = useState("");

  async function carregar() {
    const r = await fetch("/api/cupons", { credentials: "include" });
    const d = await r.json(); if (d.sucesso) setCupons(d.dados);
  }
  useEffect(() => { carregar(); }, [accessToken]);

  async function criar() {
    setErro(""); setMsg("");
    if (!codigo || !desconto || !validade) { setErro("Preencha todos os campos."); return; }
    const r = await fetch("/api/cupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ codigo: codigo.toUpperCase().trim(), descontoPercentual: Number(desconto), validoAte: new Date(validade).toISOString() }),
    });
    const d = await r.json();
    if (d.sucesso) { setMsg("Cupom criado!"); setCodigo(""); setDesconto(""); setValidade(""); carregar(); }
    else setErro(d.erro || "Erro ao criar cupom.");
  }

  async function desativar(id: string) {
    await fetch("/api/cupons", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id }) });
    carregar();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Cupons de Desconto</h1>
      {msg && <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg mb-4">{msg}</p>}
      {erro && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{erro}</p>}

      <Cartao className="mb-6">
        <h2 className="font-medium mb-4">Novo cupom</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <CampoTexto rotulo="Código" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} placeholder="LIL0102" />
          <CampoTexto rotulo="Desconto (%)" type="number" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="10" />
          <CampoTexto rotulo="Válido até" type="date" value={validade} onChange={e => setValidade(e.target.value)} />
        </div>
        <Botao onClick={criar}><Ticket className="h-4 w-4" /> Criar cupom</Botao>
      </Cartao>

      <div className="space-y-3">
        {cupons.map(c => (
          <Cartao key={c.id} className="flex items-center justify-between">
            <div>
              <h3 className="font-bold font-mono text-lg">{c.codigo}</h3>
              <p className="text-sm text-[var(--color-texto)]/50">{c.descontoPercentual}% de desconto · válido até {new Date(c.validoAte).toLocaleDateString("pt-BR")}</p>
            </div>
            <button onClick={() => desativar(c.id)} className="text-red-400 hover:text-red-600 cursor-pointer p-2"><Trash2 className="h-4 w-4" /></button>
          </Cartao>
        ))}
        {cupons.length === 0 && <p className="text-[var(--color-texto)]/40 text-sm">Nenhum cupom cadastrado.</p>}
      </div>
    </div>
  );
}
