"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Link2,
  Palette,
  Pencil,
  Power,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Botao, CampoTexto, Cartao } from "@/components/ui";
import { UploadImagem } from "@/components/ui/upload-imagem";
import { useAutenticacao } from "@/contexto/autenticacao";

interface AnuncioItem {
  id: string;
  titulo: string;
  imagemUrl: string;
  linkUrl: string;
  corFundo: string | null;
  ordem: number;
  ativo: boolean;
}

interface TutorialDestino {
  id: string;
  titulo: string;
  slug: string;
  imagemCapaUrl: string;
  categoria: {
    nome: string;
    slug: string;
  };
}

const destinosFixos = [
  { rotulo: "Vitrine completa", url: "/tutoriais" },
  { rotulo: "Ofertas ativas", url: "/tutoriais?promocao=true" },
  { rotulo: "Anuncios bombando", url: "/tutoriais?bombando=true" },
  { rotulo: "Criar conta", url: "/cadastro" },
];

const estadoInicial = {
  titulo: "",
  imagemUrl: "",
  linkUrl: "/tutoriais",
  corFundo: "#e9efed",
  ativo: true,
};

function normalizarLink(valor: string) {
  const limpo = valor.trim();
  if (!limpo) return "/tutoriais";
  if (limpo.startsWith("/") || limpo.startsWith("https://") || limpo.startsWith("http://")) {
    return limpo;
  }
  return `/${limpo}`;
}

export default function PaginaAdminAnuncios() {
  const { accessToken } = useAutenticacao();
  const [anuncios, setAnuncios] = useState<AnuncioItem[]>([]);
  const [tutoriais, setTutoriais] = useState<TutorialDestino[]>([]);
  const [formulario, setFormulario] = useState(estadoInicial);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(editandoId);
  const bannersAtivos = useMemo(() => anuncios.filter((a) => a.ativo).length, [anuncios]);

  function atualizarFormulario(campo: keyof typeof estadoInicial, valor: string | boolean) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setMsg("");
    setErro("");
  }

  function resetarFormulario() {
    setFormulario(estadoInicial);
    setEditandoId(null);
  }

  async function carregar() {
    if (!accessToken) return;
    try {
      const resposta = await fetch("/api/anuncios?todos=true", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const dados = await resposta.json();
      if (dados.sucesso) setAnuncios(dados.dados);
    } catch {
      setErro("Nao foi possivel carregar os banners.");
    }
  }

  async function carregarTutoriais() {
    try {
      const resposta = await fetch("/api/tutoriais?limite=50", { cache: "no-store" });
      const dados = await resposta.json();
      if (dados.sucesso) setTutoriais(dados.dados);
    } catch {}
  }

  useEffect(() => {
    carregar();
    carregarTutoriais();
  }, [accessToken]);

  function editar(anuncio: AnuncioItem) {
    setEditandoId(anuncio.id);
    setFormulario({
      titulo: anuncio.titulo,
      imagemUrl: anuncio.imagemUrl,
      linkUrl: anuncio.linkUrl,
      corFundo: anuncio.corFundo || "#e9efed",
      ativo: anuncio.ativo,
    });
    setMsg("");
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar() {
    setErro("");
    setMsg("");

    if (!formulario.titulo.trim()) {
      setErro("Informe o titulo do banner.");
      return;
    }
    if (!formulario.imagemUrl.trim()) {
      setErro("Informe ou envie uma imagem para o banner.");
      return;
    }

    setSalvando(true);
    try {
      const resposta = await fetch("/api/anuncios", {
        method: editando ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editandoId,
          ...formulario,
          linkUrl: normalizarLink(formulario.linkUrl),
        }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setMsg(editando ? "Banner atualizado." : "Banner criado.");
        resetarFormulario();
        await carregar();
      } else {
        setErro(dados.erro || "Nao foi possivel salvar o banner.");
      }
    } catch {
      setErro("Erro de conexao ao salvar o banner.");
    }
    setSalvando(false);
  }

  async function remover(id: string) {
    await fetch(`/api/anuncios?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (editandoId === id) resetarFormulario();
    await carregar();
  }

  async function alternarAtivo(anuncio: AnuncioItem) {
    await fetch("/api/anuncios", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: anuncio.id, ativo: !anuncio.ativo }),
    });
    await carregar();
  }

  async function reordenar(proximaLista: AnuncioItem[]) {
    setAnuncios(proximaLista);
    await fetch("/api/anuncios", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ids: proximaLista.map((a) => a.id) }),
    });
  }

  function mover(index: number, direcao: -1 | 1) {
    const destino = index + direcao;
    if (destino < 0 || destino >= anuncios.length) return;
    const nova = [...anuncios];
    [nova[index], nova[destino]] = [nova[destino], nova[index]];
    reordenar(nova);
  }

  function aplicarDestino(valor: string) {
    if (!valor) return;
    atualizarFormulario("linkUrl", valor);
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
            <Palette className="h-4 w-4" aria-hidden />
            Controle do site
          </span>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Banners principais</h1>
          <p className="mt-1 text-sm text-[var(--color-texto-suave)]">
            Defina imagem, link de destino, cor, ordem e status do carrossel da pagina inicial.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2 text-sm font-bold text-[var(--color-texto)]">
          {bannersAtivos} ativo(s) de {anuncios.length}
        </div>
      </div>

      {msg && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{msg}</p>}
      {erro && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{erro}</p>}

      <div className="grid gap-5 xl:grid-cols-[1fr_25rem]">
        <Cartao>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">{editando ? "Editar banner" : "Novo banner"}</h2>
            {editando && (
              <Botao type="button" variante="fantasma" tamanho="pequeno" onClick={resetarFormulario}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Cancelar edicao
              </Botao>
            )}
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <CampoTexto
                rotulo="Titulo exibido no banner"
                value={formulario.titulo}
                onChange={(e) => atualizarFormulario("titulo", e.target.value)}
                placeholder="Ex.: Pele real com desconto"
              />
              <CampoTexto
                rotulo="Link de destino"
                value={formulario.linkUrl}
                onChange={(e) => atualizarFormulario("linkUrl", e.target.value)}
                placeholder="/tutoriais/maquiagem-pele-real-eventos"
                sufixo={<Link2 className="h-4 w-4" aria-hidden />}
              />
            </div>

            <label className="grid gap-1.5 text-sm font-semibold text-[var(--color-texto)]">
              Enviar cliente para um anuncio existente
              <select
                value=""
                onChange={(e) => aplicarDestino(e.target.value)}
                className="h-11 rounded-lg border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-3 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
              >
                <option value="">Escolher destino rapido...</option>
                {destinosFixos.map((destino) => (
                  <option key={destino.url} value={destino.url}>
                    {destino.rotulo}
                  </option>
                ))}
                {tutoriais.map((tutorial) => (
                  <option key={tutorial.id} value={`/tutoriais/${tutorial.slug}`}>
                    {tutorial.titulo} - {tutorial.categoria.nome}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--color-texto)]">
                  Imagem do banner
                </label>
                <UploadImagem
                  valor={formulario.imagemUrl}
                  aoAlterar={(url) => atualizarFormulario("imagemUrl", url)}
                />
              </div>
              <div className="grid content-start gap-3">
                <label className="grid gap-1.5 text-sm font-semibold text-[var(--color-texto)]">
                  Cor de fundo
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formulario.corFundo.startsWith("#") ? formulario.corFundo : "#e9efed"}
                      onChange={(e) => atualizarFormulario("corFundo", e.target.value)}
                      className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-[var(--color-linha-forte)] bg-[var(--color-papel)]"
                    />
                    <input
                      type="text"
                      value={formulario.corFundo}
                      onChange={(e) => atualizarFormulario("corFundo", e.target.value)}
                      placeholder="linear-gradient(...)"
                      className="min-w-0 flex-1 rounded-lg border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-3 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
                    />
                  </div>
                </label>
                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 text-sm font-semibold text-[var(--color-texto)]">
                  <input
                    type="checkbox"
                    checked={formulario.ativo}
                    onChange={(e) => atualizarFormulario("ativo", e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-berry)]"
                  />
                  Publicar banner
                </label>
              </div>
            </div>

            <Botao type="button" onClick={salvar} carregando={salvando} className="w-full sm:w-fit">
              {editando ? <Save className="h-4 w-4" aria-hidden /> : <Palette className="h-4 w-4" aria-hidden />}
              {editando ? "Salvar alteracoes" : "Criar banner"}
            </Botao>
          </div>
        </Cartao>

        <Cartao destaque>
          <div className="mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4 text-[var(--color-sage)]" aria-hidden />
            <h2 className="text-lg font-bold">Previa</h2>
          </div>
          <div
            className="overflow-hidden rounded-lg border border-[var(--color-linha)]"
            style={{ background: formulario.corFundo || "var(--color-bege)" }}
          >
            <div className="relative aspect-[1.85/1] min-h-32">
              {formulario.imagemUrl ? (
                <img src={formulario.imagemUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-bold text-[var(--color-texto-suave)]">
                  Sem imagem
                </div>
              )}
              {formulario.titulo && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3">
                  <p className="text-sm font-bold text-white">{formulario.titulo}</p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 break-all text-xs font-semibold text-[var(--color-texto-suave)]">
            Destino: {normalizarLink(formulario.linkUrl)}
          </p>
        </Cartao>
      </div>

      <div className="mt-6 space-y-3">
        {anuncios.length === 0 ? (
          <Cartao>Nenhum banner cadastrado.</Cartao>
        ) : (
          anuncios.map((anuncio, i) => (
            <Cartao
              key={anuncio.id}
              className={`grid gap-3 sm:grid-cols-[auto_4.5rem_1fr_auto] sm:items-center ${
                !anuncio.ativo ? "opacity-65" : ""
              }`}
            >
              <div className="flex items-center gap-1 sm:flex-col">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-texto-suave)] hover:bg-[var(--color-linha)]/55 hover:text-[var(--color-berry)] disabled:opacity-30"
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </button>
                <span className="w-8 text-center font-mono text-xs text-[var(--color-texto-suave)]">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === anuncios.length - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-texto-suave)] hover:bg-[var(--color-linha)]/55 hover:text-[var(--color-berry)] disabled:opacity-30"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div
                className="flex h-16 w-full items-center justify-center overflow-hidden rounded-lg border border-[var(--color-linha)] sm:h-12"
                style={{ background: anuncio.corFundo || "var(--color-bege)" }}
              >
                {anuncio.imagemUrl ? (
                  <img src={anuncio.imagemUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-[var(--color-texto-suave)]" aria-hidden />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-bold">{anuncio.titulo}</h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black ${
                      anuncio.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-[var(--color-linha)] text-[var(--color-texto-suave)]"
                    }`}
                  >
                    {anuncio.ativo ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : <Power className="h-3 w-3" aria-hidden />}
                    {anuncio.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="mt-1 flex min-w-0 items-center gap-1 break-all text-xs text-[var(--color-texto-suave)]">
                  <Link2 className="h-3 w-3 shrink-0" aria-hidden />
                  {anuncio.linkUrl}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => alternarAtivo(anuncio)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-texto-suave)] hover:bg-[var(--color-linha)]/55 hover:text-[var(--color-sage)]"
                  aria-label={anuncio.ativo ? "Desativar banner" : "Ativar banner"}
                  title={anuncio.ativo ? "Desativar" : "Ativar"}
                >
                  <Power className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => editar(anuncio)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-texto-suave)] hover:bg-[var(--color-linha)]/55 hover:text-[var(--color-berry)]"
                  aria-label="Editar banner"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => remover(anuncio.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                  aria-label="Remover banner"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </Cartao>
          ))
        )}
      </div>
    </div>
  );
}
