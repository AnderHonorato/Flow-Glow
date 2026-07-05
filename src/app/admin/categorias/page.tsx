"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao, CampoTexto } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";

export default function PaginaAdminCategorias() {
  const { accessToken } = useAutenticacao();
  const [categorias, setCategorias] = useState<{ id: string; nome: string; slug: string }[]>([]);
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState("");

  async function carregar() {
    const r = await fetch("/api/categorias");
    const d = await r.json();
    if (d.sucesso) setCategorias(d.dados);
  }
  useEffect(() => { carregar(); }, []);

  async function criar() {
    if (!nome.trim()) return;
    const slug = nome.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[^a-z0-9-]/g, "");
    await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ nome: nome.trim(), slug }),
    });
    setNome("");
    setMsg("Categoria criada!");
    carregar();
  }

  async function remover(id: string) {
    await fetch(`/api/categorias?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
    carregar();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Categorias</h1>
      {msg && <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg mb-4">{msg}</p>}
      <div className="flex gap-2 mb-6">
        <CampoTexto rotulo="Nova categoria" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Penteados" />
        <Botao onClick={criar} className="self-end"><Plus className="h-4 w-4" /> Criar</Botao>
      </div>
      <div className="space-y-2">
        {categorias.map(c => (
          <Cartao key={c.id} className="flex items-center justify-between py-3">
            <div><span className="font-medium">{c.nome}</span><span className="text-xs text-[#715f55] ml-2">{c.slug}</span></div>
            <button onClick={() => remover(c.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="h-4 w-4" /></button>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
