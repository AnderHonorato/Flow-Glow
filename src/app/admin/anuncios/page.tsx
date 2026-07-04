"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao, CampoTexto } from "@/components/ui";
import { Image, Link2, Trash2 } from "lucide-react";

interface AnuncioItem { id: string; titulo: string; imagemUrl: string; linkUrl: string; ordem: number; ativo: boolean; }

export default function PaginaAdminAnuncios() {
  const { accessToken } = useAutenticacao();
  const [anuncios, setAnuncios] = useState<AnuncioItem[]>([]);
  const [titulo, setTitulo] = useState(""); const [imagemUrl, setImagemUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState(""); const [msg, setMsg] = useState(""); const [erro, setErro] = useState("");

  async function carregar() {
    const r = await fetch("/api/anuncios", { headers: { Authorization: `Bearer ${accessToken}` } });
    const d = await r.json(); if (d.sucesso) setAnuncios(d.dados);
  }
  useEffect(() => { carregar(); }, [accessToken]);

  async function criar() {
    setErro(""); setMsg("");
    const r = await fetch("/api/anuncios", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ titulo, imagemUrl, linkUrl }),
    });
    const d = await r.json();
    if (d.sucesso) { setMsg("Anúncio criado!"); setTitulo(""); setImagemUrl(""); setLinkUrl(""); carregar(); }
    else setErro(d.erro);
  }

  async function remover(id: string) {
    await fetch(`/api/anuncios?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
    carregar();
  }

  async function moverParaCima(index: number) {
    if (index === 0) return;
    const nova = [...anuncios];
    [nova[index - 1], nova[index]] = [nova[index], nova[index - 1]];
    setAnuncios(nova);
    await fetch("/api/anuncios", {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ ids: nova.map(a => a.id) }),
    });
  }

  async function moverParaBaixo(index: number) {
    if (index === anuncios.length - 1) return;
    const nova = [...anuncios];
    [nova[index], nova[index + 1]] = [nova[index + 1], nova[index]];
    setAnuncios(nova);
    await fetch("/api/anuncios", {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ ids: nova.map(a => a.id) }),
    });
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Anúncios</h1>
      {msg && <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg mb-4">{msg}</p>}
      {erro && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{erro}</p>}

      <Cartao className="mb-6">
        <h2 className="font-medium mb-4">Novo anúncio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <CampoTexto rotulo="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
          <CampoTexto rotulo="URL do link" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="/tutoriais?categoria=maquiagem" />
        </div>
        <CampoTexto rotulo="URL da imagem" value={imagemUrl} onChange={e => setImagemUrl(e.target.value)} placeholder="https://..." className="mb-4" />
        <Botao onClick={criar}><Image className="h-4 w-4" /> Criar anúncio</Botao>
      </Cartao>

      <div className="space-y-3">
        {anuncios.map((a, i) => (
          <Cartao key={a.id} className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 mr-2">
              <button onClick={() => moverParaCima(i)} className="text-xs text-[var(--color-texto)]/40 hover:text-[var(--color-berry)] cursor-pointer">▲</button>
              <span className="text-xs font-mono text-[var(--color-texto)]/30">{i + 1}</span>
              <button onClick={() => moverParaBaixo(i)} className="text-xs text-[var(--color-texto)]/40 hover:text-[var(--color-berry)] cursor-pointer">▼</button>
            </div>
            <div className="w-16 h-10 bg-[var(--color-linha)] rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
              {a.imagemUrl ? <img src={a.imagemUrl} alt="" className="w-full h-full object-cover" /> : <Image className="h-4 w-4 text-[var(--color-texto)]/30" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{a.titulo}</h3>
              <p className="text-xs text-[var(--color-texto)]/50 flex items-center gap-1"><Link2 className="h-3 w-3" />{a.linkUrl}</p>
            </div>
            <button onClick={() => remover(a.id)} className="text-red-400 hover:text-red-600 cursor-pointer p-1"><Trash2 className="h-4 w-4" /></button>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
