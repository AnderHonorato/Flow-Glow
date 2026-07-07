"use client";

import { ImageIcon, Megaphone, Power, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Botao, CampoTexto, Cartao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";
import logoDog from "../../../../assets/imagens/logo-dog.jpg";
import iconeLeopardo from "../../../../assets/imagens/icone-leopardo-semfundo.png";

interface AvisoTopo {
  id: string;
  titulo: string;
  mensagem: string;
  linkTexto: string | null;
  linkUrl: string | null;
  corFundo: string;
  corTexto: string;
  ativo: boolean;
  inicioEm: string;
  fimEm: string;
  desativadoEm: string | null;
  desativadoMotivo: string | null;
  criadoEm: string;
}

function paraInputLocal(data: Date) {
  const offset = data.getTimezoneOffset();
  const local = new Date(data.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function formatarData(valor: string | null) {
  if (!valor) return "-";
  return new Date(valor).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PaginaAdminConfiguracoes() {
  const { accessToken } = useAutenticacao();
  const agora = useMemo(() => new Date(), []);
  const [avisos, setAvisos] = useState<AvisoTopo[]>([]);
  const [titulo, setTitulo] = useState("Oferta especial");
  const [mensagem, setMensagem] = useState("Descontos exclusivos por tempo limitado.");
  const [linkTexto, setLinkTexto] = useState("Ver ofertas");
  const [linkUrl, setLinkUrl] = useState("/tutoriais?promocao=true");
  const [corFundo, setCorFundo] = useState("#b9923d");
  const [corTexto, setCorTexto] = useState("#ffffff");
  const [ativo, setAtivo] = useState(true);
  const [inicioEm, setInicioEm] = useState(paraInputLocal(agora));
  const [fimEm, setFimEm] = useState(paraInputLocal(new Date(agora.getTime() + 3 * 24 * 60 * 60 * 1000)));
  const [mensagemStatus, setMensagemStatus] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    if (!accessToken) return;
    try {
      const resposta = await fetch("/api/admin/aviso-topo", {
        cache: "no-store",
        credentials: "include",
      });
      const dados = await resposta.json();
      if (dados.sucesso) setAvisos(dados.dados);
    } catch {
      setErro("Nao foi possivel carregar as faixas.");
    }
  }

  useEffect(() => {
    carregar();
  }, [accessToken]);

  async function salvar() {
    setErro("");
    setMensagemStatus("");
    setSalvando(true);
    try {
      const resposta = await fetch("/api/admin/aviso-topo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          titulo,
          mensagem,
          linkTexto,
          linkUrl,
          corFundo,
          corTexto,
          ativo,
          inicioEm,
          fimEm,
        }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setMensagemStatus("Faixa salva. Se estiver no periodo ativo, aparece acima do cabecalho.");
        await carregar();
      } else {
        setErro(dados.erro || "Nao foi possivel salvar.");
      }
    } catch {
      setErro("Erro de conexao ao salvar.");
    }
    setSalvando(false);
  }

  async function desativar(id: string) {
    setErro("");
    setMensagemStatus("");
    await fetch("/api/admin/aviso-topo", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
    setMensagemStatus("Faixa desativada manualmente.");
    await carregar();
  }

  return (
    <div>
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
          <Megaphone className="h-4 w-4" aria-hidden />
          Configuracoes
        </span>
        <h1 className="mt-1 text-3xl font-bold">Faixa de avisos do topo</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-texto-suave)]">
          Cadastre avisos importantes com periodo ativo. Ao vencer, a API desativa automaticamente e remove o espaco da pagina.
        </p>
      </div>

      {mensagemStatus && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{mensagemStatus}</p>}
      {erro && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{erro}</p>}

      <div className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <Cartao>
          <h2 className="mb-4 text-xl font-bold">Nova faixa</h2>
          <div className="grid gap-4">
            <CampoTexto rotulo="Titulo interno" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <CampoTexto rotulo="Mensagem exibida" value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto rotulo="Texto do link" value={linkTexto} onChange={(e) => setLinkTexto(e.target.value)} />
              <CampoTexto rotulo="URL do link" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/tutoriais?promocao=true" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold">
                Cor de fundo
                <input type="color" value={corFundo} onChange={(e) => setCorFundo(e.target.value)} className="h-11 w-full rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] p-1" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                Cor do texto
                <input type="color" value={corTexto} onChange={(e) => setCorTexto(e.target.value)} className="h-11 w-full rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] p-1" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto rotulo="Inicio" type="datetime-local" value={inicioEm} onChange={(e) => setInicioEm(e.target.value)} />
              <CampoTexto rotulo="Fim" type="datetime-local" value={fimEm} onChange={(e) => setFimEm(e.target.value)} />
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-4 w-4 accent-[var(--color-berry)]" />
              Ativar dentro do periodo informado
            </label>
            <Botao type="button" onClick={salvar} carregando={salvando} className="sm:w-fit">
              <Save className="h-4 w-4" aria-hidden />
              Salvar faixa
            </Botao>
          </div>
        </Cartao>

        <Cartao destaque>
          <h2 className="text-lg font-bold">Previa</h2>
          <div className="mt-4 rounded-lg px-4 py-3 text-sm font-semibold" style={{ background: corFundo, color: corTexto }}>
            {mensagem || "Mensagem da faixa"}
            {linkTexto && <span className="ml-2 underline">{linkTexto}</span>}
          </div>
        </Cartao>
      </div>

      <Cartao className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[var(--color-sage)]" aria-hidden />
          <div>
            <h2 className="text-xl font-bold">Previa de identidade visual</h2>
            <p className="mt-1 text-sm text-[var(--color-texto-suave)]">
              Exemplo com as duas imagens anexadas, sem aplicar ainda como marca global do site.
            </p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <div className="overflow-hidden rounded-xl border border-[var(--color-linha)] bg-[var(--color-grafite)]">
            <img
              src={logoDog.src}
              alt="Previa vertical da marca MCA"
              className="h-72 w-full object-cover sm:h-80"
            />
          </div>
          <div className="grid content-center gap-4 rounded-xl border border-[var(--color-linha)] bg-[var(--color-grafite)] p-4 text-white">
            <div className="rounded-xl bg-white/8 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-ouro-claro)]">
                Cabeçalho / assinatura
              </p>
              <img
                src={iconeLeopardo.src}
                alt="Previa horizontal da marca MCA com leopardo"
                className="mt-3 max-h-48 w-full object-contain"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/12 bg-white/7 p-4">
                <p className="text-sm font-black text-[var(--color-ouro-claro)]">Uso sugerido</p>
                <p className="mt-1 text-sm text-white/70">
                  Banner institucional, capa de marca ou tela de boas-vindas.
                </p>
              </div>
              <div className="rounded-xl border border-white/12 bg-white/7 p-4">
                <p className="text-sm font-black text-[var(--color-ouro-claro)]">Antes de aplicar</p>
                <p className="mt-1 text-sm text-white/70">
                  Confirme se prefere trocar logo, fundo do rodape ou criar uma pagina de marca.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Cartao>

      <div className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Historico</h2>
        {avisos.length === 0 ? (
          <Cartao>Nenhuma faixa cadastrada.</Cartao>
        ) : (
          avisos.map((aviso) => (
            <Cartao key={aviso.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{aviso.titulo}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${aviso.ativo ? "bg-green-100 text-green-700" : "bg-[var(--color-linha)] text-[var(--color-texto-suave)]"}`}>
                      {aviso.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-texto-suave)]">{aviso.mensagem}</p>
                  <p className="mt-2 text-xs text-[var(--color-texto-suave)]">
                    Periodo: {formatarData(aviso.inicioEm)} ate {formatarData(aviso.fimEm)}
                  </p>
                  {!aviso.ativo && (
                    <p className="mt-1 text-xs text-[var(--color-texto-suave)]">
                      Desativada em {formatarData(aviso.desativadoEm)}. {aviso.desativadoMotivo || ""}
                    </p>
                  )}
                </div>
                {aviso.ativo && (
                  <Botao type="button" variante="contorno" tamanho="pequeno" onClick={() => desativar(aviso.id)}>
                    <Power className="h-4 w-4" aria-hidden />
                    Desativar
                  </Botao>
                )}
              </div>
            </Cartao>
          ))
        )}
      </div>
    </div>
  );
}
