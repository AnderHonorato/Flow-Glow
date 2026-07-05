"use client";

import { ImageIcon, Link2, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Botao, CampoTexto, Cartao } from "@/components/ui";

interface UploadImagemProps {
  valor: string;
  aoAlterar: (url: string) => void;
}

export function UploadImagem({ valor, aoAlterar }: UploadImagemProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [modo, setModo] = useState<"link" | "upload" | null>(null);
  const [link, setLink] = useState(valor);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const form = new FormData();
      form.append("arquivo", file);
      const r = await fetch("/api/upload", { method: "POST", body: form });
      const d = await r.json();
      if (d.sucesso) {
        aoAlterar(d.dados.url);
        setLink(d.dados.url);
        setModo(null);
      }
    } catch {}
    setUploading(false);
  }

  return (
    <div>
      {valor ? (
        <div className="relative mb-3 inline-block">
          <img src={valor} alt="Preview" className="h-32 rounded-lg border object-cover" />
          <button
            type="button"
            onClick={() => { aoAlterar(""); setLink(""); }}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : preview ? (
        <div className="relative mb-3 inline-block">
          <img src={preview} alt="Preview upload" className="h-32 rounded-lg border object-cover" />
          {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg text-white text-xs">Enviando...</div>}
        </div>
      ) : null}

      {!modo ? (
        <div className="flex gap-2">
          <Botao type="button" variante="contorno" tamanho="pequeno" onClick={() => setModo("link")}>
            <Link2 className="h-4 w-4" /> Link
          </Botao>
          <Botao type="button" variante="contorno" tamanho="pequeno" onClick={() => { setModo("upload"); fileRef.current?.click(); }}>
            <Upload className="h-4 w-4" /> Dispositivo
          </Botao>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      ) : modo === "link" ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-[#eadfd5] px-3 py-1.5 text-sm"
          />
          <Botao type="button" tamanho="pequeno" onClick={() => { aoAlterar(link); setModo(null); }}>OK</Botao>
          <Botao type="button" variante="fantasma" tamanho="pequeno" onClick={() => setModo(null)}>Cancelar</Botao>
        </div>
      ) : null}
    </div>
  );
}
