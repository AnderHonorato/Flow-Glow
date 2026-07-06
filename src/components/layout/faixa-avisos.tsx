"use client";

import { Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AvisoTopo {
  titulo: string;
  mensagem: string;
  linkTexto: string | null;
  linkUrl: string | null;
  corFundo: string;
  corTexto: string;
}

export function FaixaAvisos() {
  const [aviso, setAviso] = useState<AvisoTopo | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch("/api/aviso-topo", { cache: "no-store" })
      .then((resposta) => resposta.json())
      .then((dados) => {
        if (ativo && dados.sucesso && dados.dados) setAviso(dados.dados);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  if (!aviso) return null;

  return (
    <div
      className="relative z-30 px-3 py-2 text-center text-xs font-bold sm:text-sm"
      style={{ background: aviso.corFundo, color: aviso.corTexto }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 truncate">{aviso.mensagem}</span>
        {aviso.linkTexto && aviso.linkUrl && (
          <Link href={aviso.linkUrl} className="shrink-0 underline underline-offset-4">
            {aviso.linkTexto}
          </Link>
        )}
      </div>
    </div>
  );
}
