"use client";

import {
  Bold,
  ImageIcon,
  Italic,
  List,
  MessageCircle,
  Paperclip,
  Plus,
  Send,
  Star,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AvatarUsuario, Botao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

interface AnexoChat {
  id?: string;
  tipo: "IMAGEM" | "VIDEO";
  url: string;
}

interface MensagemChat {
  id: string;
  texto: string | null;
  tipo: "CLIENTE" | "ATENDENTE" | "BOT" | "SISTEMA";
  remetente: {
    id: string;
    nomeCompleto: string;
    fotoPerfilUrl: string | null;
    papel?: string;
  };
  anexos: AnexoChat[];
  lida: boolean;
  criadoEm: string;
}

interface ConversaChat {
  id: string;
  protocolo: string;
  status: "TRIAGEM" | "AGUARDANDO_ATENDENTE" | "EM_ATENDIMENTO" | "ENCERRADA";
  assunto: string | null;
  posicaoFila: number;
  tempoFilaMinutos: number;
  avaliacaoNota: number | null;
  avaliacaoTexto: string | null;
  atendente: { nomeCompleto: string; fotoPerfilUrl: string | null } | null;
  usuario: { id: string; nomeCompleto: string; fotoPerfilUrl: string | null };
  mensagens: MensagemChat[];
}

const opcoesBot = [
  { id: "pedido", texto: "Pedido ou compra" },
  { id: "pagamento", texto: "Pagamento" },
  { id: "acesso", texto: "Acesso a conta" },
  { id: "outro", texto: "Outro assunto" },
];

function renderizarTexto(texto: string) {
  const partes: (string | { tipo: "bold" | "italic"; texto: string })[] = [];
  let restante = texto;
  while (restante.length > 0) {
    const boldMatch = restante.match(/\*\*(.+?)\*\*/);
    const italicMatch = restante.match(/_(.+?)_/);
    const primeiroBold = boldMatch?.index ?? Infinity;
    const primeiroItalic = italicMatch?.index ?? Infinity;
    if (primeiroBold < primeiroItalic && boldMatch) {
      if (primeiroBold > 0) partes.push(restante.slice(0, primeiroBold));
      partes.push({ tipo: "bold", texto: boldMatch[1] });
      restante = restante.slice(primeiroBold + boldMatch[0].length);
    } else if (italicMatch) {
      if (primeiroItalic > 0) partes.push(restante.slice(0, primeiroItalic));
      partes.push({ tipo: "italic", texto: italicMatch[1] });
      restante = restante.slice(primeiroItalic + italicMatch[0].length);
    } else {
      partes.push(restante);
      restante = "";
    }
  }
  return partes.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : p.tipo === "bold" ? (
      <strong key={i}>{p.texto}</strong>
    ) : (
      <em key={i}>{p.texto}</em>
    )
  );
}

function MensagemBot({ texto, ehUltima }: { texto: string; ehUltima: boolean }) {
  const [visivel, setVisivel] = useState(ehUltima ? 0 : texto.length);
  useEffect(() => {
    if (!ehUltima || visivel >= texto.length) return;
    const intervalo = setInterval(() => {
      setVisivel((v) => {
        const proximo = v + 1;
        if (proximo >= texto.length) clearInterval(intervalo);
        return proximo;
      });
    }, 35);
    return () => clearInterval(intervalo);
  }, [ehUltima, texto.length, visivel]);
  const trecho = texto.slice(0, visivel);
  return <span>{renderizarTexto(trecho)}{visivel < texto.length && <span className="animate-pulse">|</span>}</span>;
}

export function ChatFlutuante() {
  const pathname = usePathname();
  const { usuario, accessToken } = useAutenticacao();
  const [aberto, setAberto] = useState(false);
  const [conversa, setConversa] = useState<ConversaChat | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [anexos, setAnexos] = useState<AnexoChat[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [avaliacaoTexto, setAvaliacaoTexto] = useState("");
  const [avaliando, setAvaliando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const enviandoRef = useRef(false);

  const ocultar =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/recuperar-senha") ||
    pathname.startsWith("/redefinir-senha") ||
    pathname.startsWith("/chat");

  const carregar = useCallback(async () => {
    if (!accessToken || !aberto || enviandoRef.current) return;
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

  async function iniciarNovo() {
    if (!accessToken) return;
    setErro("");
    setEnviando(true);
    enviandoRef.current = true;
    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ acao: "novo" }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) setConversa(dados.dados);
      else setErro(dados.erro || "Nao foi possivel iniciar.");
    } catch {
      setErro("Erro ao iniciar atendimento.");
    }
    setEnviando(false);
    enviandoRef.current = false;
  }

  function inserirFormato(prefixo: string, sufixo = prefixo) {
    const campo = textareaRef.current;
    if (!campo) {
      setMensagem((atual) => `${prefixo}${atual}${sufixo}`);
      return;
    }
    const inicio = campo.selectionStart;
    const fim = campo.selectionEnd;
    const antes = mensagem.slice(0, inicio);
    const selecionado = mensagem.slice(inicio, fim) || "texto";
    const depois = mensagem.slice(fim);
    const proxima = `${antes}${prefixo}${selecionado}${sufixo}${depois}`;
    setMensagem(proxima);
    window.requestAnimationFrame(() => {
      campo.focus();
      campo.setSelectionRange(inicio + prefixo.length, inicio + prefixo.length + selecionado.length);
    });
  }

  async function anexarArquivos(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setErro("");
    setEnviando(true);
    enviandoRef.current = true;
    const novos: AnexoChat[] = [];
    for (const arquivo of Array.from(arquivos).slice(0, 4)) {
      const form = new FormData();
      form.append("arquivo", arquivo);
      try {
        const resposta = await fetch("/api/upload", { method: "POST", body: form });
        const dados = await resposta.json();
        if (dados.sucesso) novos.push({ tipo: dados.dados.tipo, url: dados.dados.url });
        else setErro(dados.erro || "Nao foi possivel anexar.");
      } catch {
        setErro("Erro ao anexar arquivo.");
      }
    }
    setAnexos((atuais) => [...atuais, ...novos].slice(0, 4));
    setEnviando(false);
    enviandoRef.current = false;
    if (fileRef.current) fileRef.current.value = "";
  }

  async function enviarPayload(payload: Record<string, unknown>) {
    if (!usuario || !accessToken) return;
    setEnviando(true);
    enviandoRef.current = true;
    setErro("");
    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setConversa(dados.dados);
        setMensagem("");
        setAnexos([]);
      } else {
        setErro(dados.erro || "Nao foi possivel enviar.");
      }
    } catch {
      setErro("Erro de conexao ao enviar.");
    }
    setEnviando(false);
    enviandoRef.current = false;
  }

  async function enviar(evento?: FormEvent<HTMLFormElement>) {
    evento?.preventDefault();
    const texto = mensagem.trim();
    if (!texto && anexos.length === 0) return;
    await enviarPayload({ texto, anexos });
  }

  async function escolherOpcao(opcaoId: string, texto: string) {
    await enviarPayload({ texto, opcaoId });
  }

  async function avaliar(nota: number) {
    if (!conversa || !accessToken) return;
    setAvaliando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          acao: "avaliar",
          conversaId: conversa.id,
          nota,
          texto: avaliacaoTexto,
        }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) setConversa(dados.dados);
      else setErro(dados.erro || "Nao foi possivel avaliar.");
    } catch {
      setErro("Erro ao enviar avaliacao.");
    }
    setAvaliando(false);
  }

  function aoPressionarTecla(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      evento.currentTarget.form?.requestSubmit();
    }
  }

  if (ocultar) return null;

  const statusTexto = conversa
    ? conversa.status === "TRIAGEM"
      ? "Triagem automatica"
      : conversa.status === "AGUARDANDO_ATENDENTE"
        ? `Fila: aprox. ${conversa.tempoFilaMinutos} min`
        : conversa.status === "EM_ATENDIMENTO"
          ? `Com ${conversa.atendente?.nomeCompleto || "atendente"}`
          : "Encerrado"
    : "Atendimento por protocolo";

  return (
    <div className="fixed inset-x-3 bottom-3 z-[75] sm:inset-x-auto sm:bottom-5 sm:right-5">
      {aberto && (
        <section className="mb-3 flex h-[min(30rem,calc(100dvh-8rem))] w-full flex-col overflow-hidden rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] shadow-[0_18px_60px_rgba(23,32,51,0.22)] sm:w-[24rem]">
          <div className="flex items-center justify-between border-b border-[var(--color-linha)] px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-berry)] text-white">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black">
                  {conversa?.protocolo || "Atendimento MCA"}
                </h2>
                <p className="truncate text-xs text-[var(--color-texto-suave)]">{statusTexto}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {usuario && (
                <button
                  type="button"
                  onClick={iniciarNovo}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-texto-suave)] hover:bg-[var(--color-linha)]/50"
                  aria-label="Novo atendimento"
                  title="Novo atendimento"
                >
                  <Plus className="h-5 w-5" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-texto-suave)] hover:bg-[var(--color-linha)]/50"
                aria-label="Fechar chat"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
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
              <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
                {erro && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {erro}
                  </p>
                )}

                {!conversa ? (
                  <div className="grid gap-3 py-10 text-center">
                    <p className="text-sm text-[var(--color-texto-suave)]">
                      Abra um protocolo para falar com o Bot MCA e entrar na fila.
                    </p>
                    <Botao type="button" onClick={iniciarNovo} carregando={enviando}>
                      <Plus className="h-4 w-4" aria-hidden />
                      Novo atendimento
                    </Botao>
                  </div>
                ) : (
                  conversa.mensagens.map((msg, idx) => {
                    const minha = msg.remetente.id === usuario.id;
                    const sistema = msg.tipo === "SISTEMA";
                    const ehBot = msg.tipo === "BOT";
                    const ehUltima = idx === conversa.mensagens.length - 1;
                    if (sistema) {
                      return (
                        <p key={msg.id} className="mx-auto max-w-[88%] rounded-full bg-[var(--color-linha)]/70 px-3 py-1.5 text-center text-[11px] font-semibold text-[var(--color-texto-suave)]">
                          {msg.texto}
                        </p>
                      );
                    }
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${minha ? "justify-end" : "justify-start"}`}>
                        {!minha && <AvatarUsuario nome={msg.remetente.nomeCompleto} fotoUrl={msg.remetente.fotoPerfilUrl} tamanho="pequeno" />}
                        <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${minha ? "rounded-br-md bg-[var(--color-berry)] text-white" : "rounded-bl-md bg-[var(--color-linha)] text-[var(--color-texto)]"}`}>
                          <p className="mb-0.5 text-[10px] font-medium opacity-70">{msg.remetente.nomeCompleto}</p>
                          {msg.texto && (
                            <p className="whitespace-pre-wrap break-words">
                              {ehBot ? <MensagemBot texto={msg.texto} ehUltima={ehUltima} /> : renderizarTexto(msg.texto)}
                            </p>
                          )}
                          {msg.anexos?.length > 0 && (
                            <div className="mt-2 grid gap-2">
                              {msg.anexos.map((anexo, indice) =>
                                anexo.tipo === "VIDEO" ? (
                                  <video key={`${msg.id}-${indice}`} src={anexo.url} controls className="max-h-40 rounded-lg" />
                                ) : (
                                  <img key={`${msg.id}-${indice}`} src={anexo.url} alt="Anexo enviado" className="max-h-40 rounded-lg object-cover" />
                                )
                              )}
                            </div>
                          )}
                          <span className="mt-1 block text-[10px] opacity-55">
                            {new Date(msg.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {minha && <AvatarUsuario nome={msg.remetente.nomeCompleto} fotoUrl={msg.remetente.fotoPerfilUrl} tamanho="pequeno" />}
                      </div>
                    );
                  })
                )}
                <div ref={fimRef} />
              </div>

              {conversa?.status === "TRIAGEM" && (
                <div className="border-t border-[var(--color-linha)] px-3 py-2">
                  <div className="grid grid-cols-2 gap-2">
                    {opcoesBot.map((opcao) => (
                      <button
                        key={opcao.id}
                        type="button"
                        onClick={() => escolherOpcao(opcao.id, opcao.texto)}
                        className="min-h-10 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-2 text-xs font-bold text-[var(--color-texto)] hover:border-[var(--color-berry)]"
                      >
                        {opcao.texto}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {conversa?.status === "ENCERRADA" ? (
                <div className="border-t border-[var(--color-linha)] p-3">
                  {conversa.avaliacaoNota ? (
                    <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                      Avaliacao enviada. Para falar de novo, abra um novo protocolo no botao +.
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      <p className="text-sm font-bold">Como foi o atendimento?</p>
                      <textarea
                        value={avaliacaoTexto}
                        onChange={(e) => setAvaliacaoTexto(e.target.value)}
                        placeholder="Comentario opcional"
                        className="max-h-24 min-h-16 rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-berry)]"
                      />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((nota) => (
                          <button
                            key={nota}
                            type="button"
                            onClick={() => avaliar(nota)}
                            disabled={avaliando}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ouro)] hover:bg-[var(--color-linha)]/60"
                            aria-label={`Avaliar com ${nota} estrela(s)`}
                          >
                            <Star className="h-5 w-5 fill-current" aria-hidden />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : conversa ? (
                <form onSubmit={enviar} className="border-t border-[var(--color-linha)] p-3">
                  {anexos.length > 0 && (
                    <div className="mb-2 flex gap-2 overflow-x-auto">
                      {anexos.map((anexo, indice) => (
                        <span key={`${anexo.url}-${indice}`} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-linha)] px-2 py-1 text-xs font-bold">
                          {anexo.tipo === "VIDEO" ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                          {anexo.tipo.toLowerCase()}
                          <button type="button" onClick={() => setAnexos((atuais) => atuais.filter((_, i) => i !== indice))}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mb-2 flex items-center gap-1">
                    <button type="button" onClick={() => inserirFormato("**")} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--color-linha)]/60" aria-label="Negrito">
                      <Bold className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => inserirFormato("_")} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--color-linha)]/60" aria-label="Italico">
                      <Italic className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => inserirFormato("- ", "")} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--color-linha)]/60" aria-label="Lista">
                      <List className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--color-linha)]/60" aria-label="Anexar imagem ou video">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple className="hidden" onChange={(e) => anexarArquivos(e.target.files)} />
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={mensagem}
                      onChange={(evento) => setMensagem(evento.target.value)}
                      onKeyDown={aoPressionarTecla}
                      placeholder="Digite sua mensagem..."
                      rows={1}
                      className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2.5 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
                    />
                    <Botao type="submit" tamanho="pequeno" carregando={enviando} disabled={!mensagem.trim() && anexos.length === 0} aria-label="Enviar mensagem">
                      <Send className="h-4 w-4" aria-hidden />
                    </Botao>
                  </div>
                </form>
              ) : null}
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-berry)] shadow-[0_14px_36px_rgba(23,32,51,0.16)]"
        aria-label={aberto ? "Fechar chat" : "Abrir chat"}
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
      </button>
    </div>
  );
}
