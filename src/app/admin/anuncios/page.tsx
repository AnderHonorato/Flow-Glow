"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao, CampoTexto } from "@/components/ui";
import { UploadImagem } from "@/components/ui/upload-imagem";
import { Image, Link2, Trash2, Palette } from "lucide-react";

interface AnuncioItem { id: string; titulo: string; imagemUrl: string; linkUrl: string; corFundo: string | null; ordem: number; ativo: boolean; }

export default function PaginaAdminAnuncios() {
  const { accessToken } = useAutenticacao();
  const [anuncios, setAnuncios] = useState<AnuncioItem[]>([]);
  const [titulo, setTitulo] = useState(""); const [imagemUrl, setImagemUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState(""); const [corFundo, setCorFundo] = useState("#e9efed");
  const [msg, setMsg] = useState(""); const [erro, setErro] = useState("");

  function aoAlterarImagem(url: string) {
    setImagemUrl(url);
    setMsg("");
  }

  async function carregar() {
    const r = await fetch("/api/anuncios", { headers: { Authorization: `Bearer ${accessToken}` } });
    const d = await r.json(); if (d.sucesso) setAnuncios(d.dados);
  }
  useEffect(() => { carregar(); }, [accessToken]);

  async function criar() {
    setErro(""); setMsg("");
    const r = await fetch("/api/anuncios", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ titulo, imagemUrl, linkUrl, corFundo }),
    });
    const d = await r.json();
    if (d.sucesso) { setMsg("Anúncio criado!"); setTitulo(""); setImagemUrl(""); setLinkUrl(""); setCorFundo("#e9efed"); carregar(); }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-texto)] mb-1 block">Imagem do banner</label>
            <UploadImagem valor={imagemUrl} aoAlterar={aoAlterarImagem} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-texto)] mb-1 block">Cor de fundo / degrade</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={corFundo}
                onChange={e => setCorFundo(e.target.value)}
                className="h-11 w-16 cursor-pointer rounded-lg border border-[var(--color-linha-forte)] bg-[var(--color-papel)]"
              />
              <input
                type="text"
                value={corFundo}
                onChange={e => setCorFundo(e.target.value)}
                placeholder="ex: linear-gradient(135deg, #f06a98, #e5bd5d)"
                className="h-11 flex-1 rounded-lg border border-[var(--color-linha-forte)] bg-[color-mix(in_srgb,var(--color-papel)_88%,transparent)] px-3 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
              />
            </div>
            <p className="mt-1 text-xs text-[var(--color-texto-suave)]">Use cor sólida, degrade CSS ou hex (#FF0000)</p>
          </div>
        </div>
        <Botao onClick={criar}><Palette className="h-4 w-4" /> Criar anúncio</Botao>
      </Cartao>

      <div className="space-y-3">
        {anuncios.map((a, i) => (
          <Cartao key={a.id} className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 mr-2">
              <button onClick={() => moverParaCima(i)} className="text-xs text-[var(--color-texto)]/40 hover:text-[var(--color-berry)] cursor-pointer">▲</button>
              <span className="text-xs font-mono text-[var(--color-texto)]/30">{i + 1}</span>
              <button onClick={() => moverParaBaixo(i)} className="text-xs text-[var(--color-texto)]/40 hover:text-[var(--color-berry)] cursor-pointer">▼</button>
            </div>
            <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: a.corFundo || "var(--color-bege)" }}>
              {a.imagemUrl ? <img src={a.imagemUrl} alt="" className="w-full h-full object-cover" /> : <Image className="h-4 w-4 text-[var(--color-texto)]/30" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{a.titulo}</h3>
              <p className="text-xs text-[var(--color-texto)]/50 flex items-center gap-1"><Link2 className="h-3 w-3" />{a.linkUrl}</p>
              {a.corFundo && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-[var(--color-texto-suave)]">
                  <span className="inline-block h-3 w-3 rounded-full border border-[var(--color-linha)]" style={{ background: a.corFundo }} />
                  {a.corFundo}
                </span>
              )}
            </div>
            <button onClick={() => remover(a.id)} className="text-red-400 hover:text-red-600 cursor-pointer p-1"><Trash2 className="h-4 w-4" /></button>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
