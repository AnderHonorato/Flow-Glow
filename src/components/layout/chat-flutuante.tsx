"use client";

import {
  Bold,
  ImageIcon,
  Italic,
  Briefcase,
  List,
  Link as LinkIcon,
  Mail,
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
  useMemo,
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

const MARCADOR_CONTATOS_DESENVOLVEDOR = "[[CARTOES_DESENVOLVEDOR]]";

const contatosDesenvolvedor = [
  {
    titulo: "E-mail",
    texto: "contato.anderflow@gmail.com",
    href: "mailto:contato.anderflow@gmail.com",
    icone: Mail,
  },
  {
    titulo: "WhatsApp",
    texto: "+55 11 94065-2843",
    href: "https://wa.me/5511940652843",
    icone: MessageCircle,
  },
  {
    titulo: "Portfolio",
    texto: "Projetos e trabalhos",
    href: "https://anderhonorato.github.io/meu-portfolio/index.html",
    icone: Briefcase,
  },
  {
    titulo: "Links",
    texto: "Canais principais",
    href: "https://anderhonorato.github.io/links/",
    icone: LinkIcon,
  },
] as const;

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

function CartoesContatoDesenvolvedor() {
  return (
    <div className="mt-2 grid gap-2">
      {contatosDesenvolvedor.map((contato) => {
        const Icone = contato.icone;
        return (
          <a
            key={contato.href}
            href={contato.href}
            target={contato.href.startsWith("http") ? "_blank" : undefined}
            rel={contato.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2 text-[var(--color-texto)] transition hover:border-[var(--color-berry)] hover:text-[var(--color-berry)]"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-berry)_12%,transparent)] text-[var(--color-berry)]">
              <Icone className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-black">{contato.titulo}</span>
              <span className="block truncate text-[11px] font-semibold text-[var(--color-texto-suave)]">
                {contato.texto}
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

function renderizarMensagemBot(texto: string) {
  const mostrarCartoes = texto.includes(MARCADOR_CONTATOS_DESENVOLVEDOR);
  const textoLimpo = texto.replace(MARCADOR_CONTATOS_DESENVOLVEDOR, "").trim();
  const linhas = textoLimpo ? textoLimpo.split(/\n+/) : [];

  return (
    <>
      {linhas.map((linha, indice) => (
        <span
          key={`${linha}-${indice}`}
          className="ghost-line"
          style={{ animationDelay: `${indice * 90}ms` }}
        >
          {renderizarTexto(linha)}
        </span>
      ))}
      {mostrarCartoes && <CartoesContatoDesenvolvedor />}
    </>
  );
}

function PensamentoBot() {
  const frases = [
    "Estou pensando...",
    "Aguarde mais um pouco enquanto verifico...",
    "Estou organizando a melhor resposta...",
  ];
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setIndice(1), 1800),
      window.setTimeout(() => setIndice(2), 4200),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold italic text-[var(--color-texto-suave)]">
      <span className="inline-flex gap-0.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-berry)]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-berry)] [animation-delay:160ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-berry)] [animation-delay:320ms]" />
      </span>
      {frases[indice]}
    </span>
  );
}

function MensagemBot({ texto, ehUltima, animada, onAnimacaoCompleta }: { texto: string; ehUltima: boolean; animada: boolean; onAnimacaoCompleta?: () => void }) {
  const [fase, setFase] = useState<"digitando" | "revelando" | "pronto">(
    !ehUltima || !animada ? "pronto" : "digitando"
  );
  const [visivel, setVisivel] = useState(0);
  const tokens = useMemo(() => texto.split(/(\s+)/), [texto]);
  const digitandoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const concluidoRef = useRef(false);

  useEffect(() => {
    if (!ehUltima || !animada) {
      setFase("pronto");
      return;
    }
    digitandoRef.current = setTimeout(() => {
      setFase("revelando");
    }, 900);
    return () => {
      if (digitandoRef.current) clearTimeout(digitandoRef.current);
    };
  }, [ehUltima, animada]);

  useEffect(() => {
    if (fase !== "revelando") return;
    const intervalo = setInterval(() => {
      setVisivel((v) => {
        const proximo = v + 1;
        if (proximo >= tokens.length) {
          clearInterval(intervalo);
          setFase("pronto");
        }
        return proximo;
      });
    }, 46);
    return () => clearInterval(intervalo);
  }, [fase, tokens.length]);

  useEffect(() => {
    if (fase === "pronto" && !concluidoRef.current && animada) {
      concluidoRef.current = true;
      onAnimacaoCompleta?.();
    }
  }, [fase, animada, onAnimacaoCompleta]);

  if (fase === "digitando") {
    return <PensamentoBot />;
  }

  if (fase === "pronto" || !ehUltima) {
    return <span className="animate-[entrada-suave_400ms_ease]">{renderizarMensagemBot(texto)}</span>;
  }

  const trecho = tokens.slice(0, visivel).join("");
  return (
    <span>
      {renderizarMensagemBot(trecho)}
      {visivel < tokens.length && <span className="animate-pulse">|</span>}
    </span>
  );
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
  const [ultimaMsgBotAnimada, setUltimaMsgBotAnimada] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const enviandoRef = useRef(false);
  const [mensagemInicial, setMensagemInicial] = useState(
    "Ola! Posso ajudar com anuncios, compras, favoritos, conta ou suporte."
  );

  const ocultar =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/recuperar-senha") ||
    pathname.startsWith("/redefinir-senha") ||
    pathname.startsWith("/chat");

  useEffect(() => {
    const opcoes = [
      "Oi! Eu sou o AlphaBot. Me diga o que voce procura e eu te ajudo.",
      "Ola! Posso ajudar com anuncios, compras, favoritos, conta ou suporte.",
      "Boas-vindas! Envie sua duvida e eu verifico o melhor caminho.",
      "Tudo certo por aqui. Como posso ajudar voce hoje?",
    ];
    setMensagemInicial(opcoes[Math.floor(Math.random() * opcoes.length)]);
  }, []);

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

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("mca_ultima_msg_bot_animada");
      if (saved) setUltimaMsgBotAnimada(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (ultimaMsgBotAnimada) {
      try { sessionStorage.setItem("mca_ultima_msg_bot_animada", ultimaMsgBotAnimada); } catch {}
    }
  }, [ultimaMsgBotAnimada]);

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

  const idsMsgsBot = conversa?.mensagens.filter((m) => m.tipo === "BOT").map((m) => m.id) ?? [];
  const ultimaMsgBotId = idsMsgsBot[idsMsgsBot.length - 1];
  const animadaMsgId = ultimaMsgBotAnimada;

  const mensagensRenderizadas = conversa?.mensagens.map((msg, idx) => {
    const minha = msg.remetente.id === (usuario?.id ?? "");
    const sistema = msg.tipo === "SISTEMA";
    const ehBot = msg.tipo === "BOT";
    const ehUltima = idx === (conversa?.mensagens.length ?? 0) - 1;
    if (sistema) {
      return (
        <p key={msg.id} className="mx-auto max-w-[88%] rounded-full bg-[var(--color-linha)]/70 px-3 py-1.5 text-center text-[11px] font-semibold text-[var(--color-texto-suave)]">
          {msg.texto}
        </p>
      );
    }
    return (
      <div key={msg.id} className={`flex items-end gap-2 ${minha ? "justify-end" : "justify-start"}`}>
        {!minha && (ehBot ? (
          <img src="/alphabot.png" alt="Bot MCA" className="h-8 w-8 shrink-0 rounded-full border border-white/60 object-cover shadow-sm" />
        ) : (
          <AvatarUsuario nome={msg.remetente.nomeCompleto} fotoUrl={msg.remetente.fotoPerfilUrl} tamanho="pequeno" />
        ))}
        <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${minha ? "rounded-br-md bg-[var(--color-berry)] text-white" : "rounded-bl-md bg-[var(--color-linha)] text-[var(--color-texto)]"}`}>
          <p className="mb-0.5 text-[10px] font-medium opacity-70">{msg.remetente.nomeCompleto}</p>
          {msg.texto && (
            <div className="whitespace-pre-wrap break-words">
              {ehBot ? (
                <MensagemBot
                  texto={msg.texto!}
                  ehUltima={ehUltima}
                  animada={ehUltima && msg.id === ultimaMsgBotId && msg.id !== animadaMsgId}
                  onAnimacaoCompleta={() => { setUltimaMsgBotAnimada(msg.id); }}
                />
              ) : (
                renderizarTexto(msg.texto)
              )}
            </div>
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
  });
  const aguardandoHumano = conversa?.status === "AGUARDANDO_ATENDENTE";

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-3 z-[85] w-[calc(100vw-1.5rem)] max-w-[24rem] sm:bottom-5 sm:right-5 sm:w-[24rem]">
      {aberto && (
        <section className="mb-3 flex h-[min(32rem,calc(100dvh-7rem))] w-full flex-col overflow-hidden rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] shadow-[0_18px_60px_rgba(23,32,51,0.22)]">
          <div className="flex items-center justify-between border-b border-[var(--color-linha)] px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <img
                src="/alphabot.png"
                alt="Bot MCA"
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black">
                  AlphaBot Atendente Virtual
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
                  <div className="grid grid-cols-[auto_1fr] items-end gap-2 py-4">
                    <img src="/alphabot.png" alt="Bot MCA" className="h-8 w-8 shrink-0 rounded-full border border-white/60 object-cover shadow-sm" />
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[var(--color-linha)] px-3 py-2 text-sm text-[var(--color-texto)]">
                      <p className="mb-0.5 text-[10px] font-medium opacity-70">AlphaBot</p>
                      <p className="whitespace-pre-wrap break-words">{mensagemInicial}</p>
                    </div>
                  </div>
                ) : (
                  mensagensRenderizadas
                )}
                {enviando && usuario && conversa?.status !== "AGUARDANDO_ATENDENTE" && (
                  <div className="flex items-end gap-2">
                    <img src="/alphabot.png" alt="AlphaBot" className="h-8 w-8 shrink-0 rounded-full border border-white/60 object-cover shadow-sm" />
                    <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-[var(--color-linha)] px-3 py-2 text-sm text-[var(--color-texto)]">
                      <p className="mb-0.5 text-[10px] font-medium opacity-70">AlphaBot</p>
                      <PensamentoBot />
                    </div>
                  </div>
                )}
                <div ref={fimRef} />
              </div>

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
              ) : (
                <form onSubmit={enviar} className="border-t border-[var(--color-linha)] p-3">
                  {aguardandoHumano && (
                    <p className="mb-2 rounded-lg border border-[var(--color-ouro)]/30 bg-[color-mix(in_srgb,var(--color-ouro)_12%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--color-texto-suave)]">
                      Protocolo aberto. O AlphaBot pausou as respostas e um humano assume a partir daqui.
                    </p>
                  )}
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
                      placeholder={aguardandoHumano ? "Envie detalhes para o atendente humano..." : "Digite sua mensagem..."}
                      rows={1}
                      className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2.5 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
                    />
                    <Botao type="submit" tamanho="pequeno" carregando={enviando} disabled={!mensagem.trim() && anexos.length === 0} aria-label="Enviar mensagem">
                      <Send className="h-4 w-4" aria-hidden />
                    </Botao>
                  </div>
                </form>
              )}
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
