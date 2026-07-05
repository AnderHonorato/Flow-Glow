"use client";

import { MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AvatarUsuario, Botao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

interface MensagemChat {
  id: string;
  texto: string | null;
  remetente: {
    id: string;
    nomeCompleto: string;
    fotoPerfilUrl: string | null;
    papel?: string;
  };
  lida: boolean;
  criadoEm: string;
}

interface ConversaChat {
  id: string;
  usuario: { id: string; nomeCompleto: string; fotoPerfilUrl: string | null };
  mensagens: MensagemChat[];
}

export function ChatFlutuante() {
  const pathname = usePathname();
  const { usuario, accessToken } = useAutenticacao();
  const [aberto, setAberto] = useState(false);
  const [conversa, setConversa] = useState<ConversaChat | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  const ocultar =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/recuperar-senha") ||
    pathname.startsWith("/redefinir-senha") ||
    pathname.startsWith("/chat");

  const carregar = useCallback(async () => {
    if (!accessToken || !aberto) return;
    try {
      const resposta = await fetch("/api/chat", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const dados = await resposta.json();
      if (dados.sucesso) setConversa(dados.dados[0] || null);
    } catch {
      setErro("Nao foi possivel carregar o chat.");
    }
  }, [aberto, accessToken]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (!aberto || !accessToken) return;
    const intervalo = window.setInterval(carregar, 4000);
    return () => window.clearInterval(intervalo);
  }, [aberto, accessToken, carregar]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversa?.mensagens, aberto]);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = mensagem.trim();
    if (!texto || !usuario || !accessToken) return;

    setEnviando(true);
    setErro("");
    setMensagem("");

    const temporaria: MensagemChat = {
      id: `temp-${Date.now()}`,
      texto,
      remetente: {
        id: usuario.id,
        nomeCompleto: usuario.nomeCompleto,
        fotoPerfilUrl: usuario.fotoPerfilUrl,
        papel: usuario.papel,
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
      if (!dados.sucesso) setErro(dados.erro || "Nao foi possivel enviar.");
      await carregar();
    } catch {
      setErro("Erro de conexao ao enviar.");
    }

    setEnviando(false);
  }

  if (ocultar) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[75] sm:bottom-5 sm:right-5">
      {aberto && (
        <section className="liquid-glass mb-3 flex h-[min(34rem,72dvh)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-linha)] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="icon-hover inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-berry)] text-white">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold">Atendimento</h2>
                <p className="text-xs text-[var(--color-texto-suave)]">
                  Respostas pelo chat da conta
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="icon-hover inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-texto-suave)] hover:bg-[color-mix(in_srgb,var(--color-papel)_78%,transparent)]"
              aria-label="Fechar chat"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {!usuario ? (
            <div className="grid flex-1 content-center gap-3 px-4 text-center">
              <p className="text-sm text-[var(--color-texto-suave)]">
                Entre na conta para falar com o atendimento e manter o historico.
              </p>
              <Link href="/login">
                <Botao className="w-full">Entrar para conversar</Botao>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {erro && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {erro}
                  </p>
                )}

                {!conversa || conversa.mensagens.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[var(--color-texto-suave)]">
                    Envie uma mensagem. O time responde por aqui.
                  </p>
                ) : (
                  conversa.mensagens.map((msg) => {
                    const minha = msg.remetente.id === usuario.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${minha ? "justify-end" : "justify-start"}`}
                      >
                        {!minha && (
                          <AvatarUsuario
                            nome={msg.remetente.nomeCompleto}
                            fotoUrl={msg.remetente.fotoPerfilUrl}
                            tamanho="pequeno"
                          />
                        )}
                        <div
                          className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                            minha
                              ? "rounded-br-md bg-[var(--color-berry)] text-white"
                              : "rounded-bl-md bg-[var(--color-linha)] text-[var(--color-texto)]"
                          }`}
                        >
                          <p className="mb-0.5 text-[10px] font-medium opacity-70">
                            {msg.remetente.nomeCompleto}
                          </p>
                          <p className="whitespace-pre-wrap break-words">{msg.texto || ""}</p>
                          <span className="mt-1 block text-[10px] opacity-55">
                            {new Date(msg.criadoEm).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {minha && (
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

              <form onSubmit={enviar} className="flex gap-2 border-t border-[var(--color-linha)] p-3">
                <input
                  value={mensagem}
                  onChange={(evento) => setMensagem(evento.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="min-w-0 flex-1 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
                />
                <Botao
                  type="submit"
                  tamanho="pequeno"
                  carregando={enviando}
                  disabled={!mensagem.trim()}
                  aria-label="Enviar mensagem"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </Botao>
              </form>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        className="icon-hover liquid-glass ml-auto flex h-14 w-14 items-center justify-center rounded-full text-[var(--color-berry)] shadow-[0_14px_36px_rgba(23,32,51,0.16)]"
        aria-label={aberto ? "Fechar chat" : "Abrir chat"}
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
      </button>
    </div>
  );
}
