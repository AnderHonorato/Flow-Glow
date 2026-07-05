"use client";

import { Send, Smile } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { AvatarUsuario, Botao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

interface Msg {
  id: string;
  texto: string;
  remetente: {
    id: string;
    nomeCompleto: string;
    fotoPerfilUrl: string | null;
    papel?: string;
  };
  lida: boolean;
  criadoEm: string;
}

interface Conv {
  id: string;
  usuario: { id: string; nomeCompleto: string; fotoPerfilUrl: string | null };
  mensagens: Msg[];
}

export default function PaginaChat() {
  const { usuario, accessToken } = useAutenticacao();
  const [conversa, setConversa] = useState<Conv | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  async function carregar() {
    if (!accessToken) return;
    try {
      const r = await fetch("/api/chat", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const d = await r.json();
      if (d.sucesso && d.dados.length > 0) setConversa(d.dados[0]);
    } catch {
      setErro("Não foi possível carregar o chat.");
    }
  }

  useEffect(() => {
    carregar();
  }, [accessToken]);

  useEffect(() => {
    const i = window.setInterval(carregar, 4000);
    return () => window.clearInterval(i);
  }, [accessToken]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversa?.mensagens]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const texto = novaMensagem.trim();
    if (!texto || !usuario) return;

    setEnviando(true);
    setErro("");
    setNovaMensagem("");

    const temporaria: Msg = {
      id: `temp-${Date.now()}`,
      texto,
      remetente: {
        id: usuario.id,
        nomeCompleto: usuario.nomeCompleto,
        fotoPerfilUrl: usuario.fotoPerfilUrl,
      },
      lida: false,
      criadoEm: new Date().toISOString(),
    };

    setConversa((atual) =>
      atual
        ? { ...atual, mensagens: [...atual.mensagens, temporaria] }
        : {
            id: "temp",
            usuario: {
              id: usuario.id,
              nomeCompleto: usuario.nomeCompleto,
              fotoPerfilUrl: usuario.fotoPerfilUrl,
            },
            mensagens: [temporaria],
          }
    );

    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ texto }),
      });
      const dados = await resposta.json();
      if (!dados.sucesso) setErro(dados.erro || "Não foi possível enviar.");
      await carregar();
    } catch {
      setErro("Erro de conexão ao enviar.");
    }

    setEnviando(false);
  }

  return (
    <>
      <Cabecalho />
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-5" style={{ height: "calc(100dvh - 7rem)" }}>
        <h1 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Smile className="h-5 w-5 text-[var(--color-berry)]" aria-hidden />
          Fale conosco
        </h1>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_90%,transparent)] p-4 backdrop-blur-sm">
          {erro && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {erro}
            </p>
          )}
          {!conversa || conversa.mensagens.length === 0 ? (
            <p className="py-12 text-center text-sm text-[var(--color-texto-suave)]">
              Envie uma mensagem abaixo. Nosso time responde por aqui.
            </p>
          ) : (
            conversa.mensagens.map((msg) => {
              const meu = msg.remetente.id === usuario?.id;
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${meu ? "justify-end" : "justify-start"}`}>
                  {!meu && (
                    <AvatarUsuario
                      nome={msg.remetente.nomeCompleto}
                      fotoUrl={msg.remetente.fotoPerfilUrl}
                      tamanho="pequeno"
                    />
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                      meu
                        ? "rounded-br-md bg-[var(--color-berry)] text-white"
                        : "rounded-bl-md bg-[var(--color-linha)] text-[var(--color-texto)]"
                    }`}
                  >
                    <p className="mb-0.5 text-[10px] font-medium opacity-70">
                      {msg.remetente.nomeCompleto}
                    </p>
                    <p className="whitespace-pre-wrap break-words">{msg.texto}</p>
                    <span className="mt-1 block text-[10px] opacity-50">
                      {new Date(msg.criadoEm).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {meu && (
                    <AvatarUsuario
                      nome={msg.remetente.nomeCompleto}
                      fotoUrl={msg.remetente.fotoPerfilUrl}
                      tamanho="pequeno"
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={fimRef} />
        </div>

        <form onSubmit={enviar} className="mt-3 flex gap-2">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="min-w-0 flex-1 rounded-xl border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-4 py-3 text-sm text-[var(--color-texto)] outline-none focus:ring-2 focus:ring-[var(--color-berry)]/20"
          />
          <Botao type="submit" carregando={enviando} disabled={!novaMensagem.trim()}>
            <Send className="h-4 w-4" aria-hidden />
          </Botao>
        </form>
      </div>
      <Rodape />
    </>
  );
}
