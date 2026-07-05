"use client";

import {
  BadgePercent,
  Edit3,
  Flame,
  ImagePlus,
  MapPin,
  Plus,
  Save,
  Search,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, CampoTexto, Cartao, Modal } from "@/components/ui";
import { UploadImagem } from "@/components/ui/upload-imagem";
import type { TutorialCard, TutorialDetalhe } from "@/tipos";

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

const niveis = [
  { valor: "INICIANTE", rotulo: "Iniciante" },
  { valor: "INTERMEDIARIO", rotulo: "Intermediário" },
  { valor: "AVANCADO", rotulo: "Avançado" },
];

function criarSlug(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function numeroOuNulo(valor: string): number | null {
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fotosParaTexto(fotos: string[]): string {
  return fotos.join("\n");
}

function textoParaFotos(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean);
}

function modulosParaTexto(tutorial?: TutorialDetalhe | null): string {
  return (tutorial?.modulos || [])
    .map((modulo) =>
      [
        modulo.titulo,
        modulo.duracaoMinutos,
        modulo.gratuito ? "gratis" : "pago",
        modulo.videoUrl || "",
      ].join(" | ")
    )
    .join("\n");
}

function textoParaModulos(texto: string) {
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => {
      const [titulo, minutos, tipo, videoUrl] = linha.split("|").map((parte) => parte.trim());
      return {
        titulo,
        duracaoMinutos: Number(minutos) || 10,
        gratuito: tipo?.toLowerCase().includes("gratis") || tipo?.toLowerCase().includes("gratuito"),
        videoUrl: videoUrl || null,
      };
    });
}

const estadoInicial = {
  id: "",
  titulo: "",
  slug: "",
  descricaoCurta: "",
  descricaoCompleta: "",
  preco: "",
  precoPromocional: "",
  cupomDesconto: "",
  destaquePromocional: false,
  bombando: false,
  categoriaId: "",
  nivel: "INICIANTE",
  imagemCapaUrl: "",
  videoPreviaUrl: "",
  fotosGaleria: "",
  cidade: "",
  estado: "SP",
  distanciaKm: "",
  modulosTexto: "",
};

export default function PaginaAdminTutoriais() {
  const { accessToken } = useAutenticacao();
  const [tutoriais, setTutoriais] = useState<TutorialCard[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modo, setModo] = useState<"criar" | "editar">("criar");
  const [form, setForm] = useState(estadoInicial);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregandoEdicao, setCarregandoEdicao] = useState(false);
  const [busca, setBusca] = useState("");

  async function carregar() {
    const [resT, resC] = await Promise.all([
      fetch("/api/tutoriais?ordenar=recentes"),
      fetch("/api/categorias"),
    ]);
    const dT = await resT.json();
    const dC = await resC.json();
    if (dT.sucesso) setTutoriais(dT.dados);
    if (dC.sucesso) {
      setCategorias(dC.dados);
      setForm((atual) => ({ ...atual, categoriaId: atual.categoriaId || dC.dados[0]?.id || "" }));
    }
  }

  useEffect(() => {
    carregar();
    const intervalo = window.setInterval(carregar, 5000);
    return () => window.clearInterval(intervalo);
  }, []);

  const tutoriaisFiltrados = useMemo(() => {
    if (!busca.trim()) return tutoriais;
    const termo = busca.trim().toLowerCase();
    return tutoriais.filter((tutorial) =>
      [
        tutorial.titulo,
        tutorial.categoria.nome,
        tutorial.cidade || "",
        tutorial.cupomDesconto || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [busca, tutoriais]);

  function atualizar(campo: keyof typeof estadoInicial, valor: string | boolean) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function abrirCriacao() {
    setModo("criar");
    setForm({ ...estadoInicial, categoriaId: categorias[0]?.id || "" });
    setErro("");
    setMensagem("");
    setModalAberto(true);
  }

  async function abrirEdicao(tutorial: TutorialCard) {
    setModo("editar");
    setErro("");
    setMensagem("");
    setCarregandoEdicao(true);
    setModalAberto(true);

    try {
      const resposta = await fetch(`/api/tutoriais/${tutorial.slug}`);
      const dados = await resposta.json();
      if (!dados.sucesso) throw new Error(dados.erro || "Não foi possível abrir o anúncio.");
      const detalhe = dados.dados as TutorialDetalhe;
      const categoriaId =
        categorias.find((categoria) => categoria.slug === detalhe.categoria.slug)?.id ||
        categorias[0]?.id ||
        "";
      setForm({
        id: detalhe.id,
        titulo: detalhe.titulo,
        slug: detalhe.slug,
        descricaoCurta: detalhe.descricaoCurta,
        descricaoCompleta: detalhe.descricaoCompleta,
        preco: String(detalhe.preco).replace(".", ","),
        precoPromocional: detalhe.precoPromocional ? String(detalhe.precoPromocional).replace(".", ",") : "",
        cupomDesconto: detalhe.cupomDesconto || "",
        destaquePromocional: detalhe.destaquePromocional,
        bombando: detalhe.bombando,
        categoriaId,
        nivel: detalhe.nivel,
        imagemCapaUrl: detalhe.imagemCapaUrl,
        videoPreviaUrl: detalhe.videoPreviaUrl || "",
        fotosGaleria: fotosParaTexto(detalhe.fotosGaleria || []),
        cidade: detalhe.cidade || "",
        estado: detalhe.estado || "SP",
        distanciaKm: detalhe.distanciaKm !== null ? String(detalhe.distanciaKm) : "",
        modulosTexto: modulosParaTexto(detalhe),
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao abrir anúncio.");
    }

    setCarregandoEdicao(false);
  }

  function montarCorpo() {
    const precoNumero = numeroOuNulo(form.preco);
    if (!precoNumero) {
      throw new Error("Informe um preço válido.");
    }

    return {
      ...(modo === "editar" ? { id: form.id } : {}),
      titulo: form.titulo,
      slug: form.slug || criarSlug(form.titulo),
      descricaoCurta: form.descricaoCurta,
      descricaoCompleta: form.descricaoCompleta,
      preco: precoNumero,
      precoPromocional: numeroOuNulo(form.precoPromocional),
      cupomDesconto: form.cupomDesconto.trim() || null,
      destaquePromocional: form.destaquePromocional,
      bombando: form.bombando,
      categoriaId: form.categoriaId,
      nivel: form.nivel,
      imagemCapaUrl: form.imagemCapaUrl.trim() || "/marca/logo.png",
      videoPreviaUrl: form.videoPreviaUrl.trim() || null,
      fotosGaleria: textoParaFotos(form.fotosGaleria),
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim().toUpperCase() || null,
      distanciaKm: form.distanciaKm ? Number(form.distanciaKm) : null,
      modulos: textoParaModulos(form.modulosTexto),
    };
  }

  async function salvarTutorial() {
    setErro("");
    setMensagem("");
    setSalvando(true);

    try {
      const corpo = montarCorpo();
      const resposta = await fetch("/api/tutoriais", {
        method: modo === "editar" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(corpo),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setMensagem(modo === "editar" ? "Anúncio atualizado." : "Anúncio criado e publicado.");
        setModalAberto(false);
        await carregar();
      } else {
        setErro(dados.erro || "Não foi possível salvar o anúncio.");
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro de conexão ao salvar anúncio.");
    }

    setSalvando(false);
  }

  async function desativarTutorial() {
    if (!form.id) return;
    setErro("");
    setSalvando(true);
    try {
      const resposta = await fetch("/api/tutoriais", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id: form.id }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setMensagem("Anúncio desativado.");
        setModalAberto(false);
        await carregar();
      } else {
        setErro(dados.erro || "Não foi possível desativar.");
      }
    } catch {
      setErro("Erro ao desativar anúncio.");
    }
    setSalvando(false);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
            <BadgePercent className="h-4 w-4" aria-hidden />
            Catálogo
          </span>
          <h1 className="mt-1 text-3xl font-bold">Anúncios e tutoriais</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-texto-suave)]">
            Controle fotos, conteúdo, preço, cupons, km, promoções e destaque bombando.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <CampoTexto
            rotulo="Buscar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Título, cupom, categoria ou cidade"
            icone={<Search className="h-4 w-4" aria-hidden />}
          />
          <div className="flex items-end">
            <Botao onClick={abrirCriacao} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" aria-hidden />
              Novo anúncio
            </Botao>
          </div>
        </div>
      </div>

      {mensagem && (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          {mensagem}
        </p>
      )}
      {erro && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {erro}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {tutoriaisFiltrados.map((tutorial) => (
          <Cartao key={tutorial.id} className="grid gap-4 sm:grid-cols-[9rem_1fr_auto]">
            <div
              className="h-36 rounded-lg bg-cover bg-center sm:h-full"
              style={{ backgroundImage: `url(${tutorial.imagemCapaUrl})` }}
            />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                {tutorial.bombando && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-berry)] px-2 py-1 text-xs font-bold text-white">
                    <Flame className="h-3.5 w-3.5" aria-hidden />
                    Bombando
                  </span>
                )}
                <span className="rounded-md bg-[color-mix(in_srgb,var(--color-sage)_12%,transparent)] px-2 py-1 text-xs font-bold text-[var(--color-sage)]">
                  {tutorial.categoria.nome}
                </span>
                {tutorial.cupomDesconto && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--color-ouro)_16%,transparent)] px-2 py-1 text-xs font-bold text-[var(--color-texto)]">
                    <TicketPercent className="h-3.5 w-3.5" aria-hidden />
                    {tutorial.cupomDesconto}
                  </span>
                )}
                {tutorial.destaquePromocional && (
                  <span className="rounded-md bg-[color-mix(in_srgb,var(--color-berry)_12%,transparent)] px-2 py-1 text-xs font-bold text-[var(--color-berry)]">
                    Promoção
                  </span>
                )}
              </div>
              <h3 className="truncate text-lg font-bold">{tutorial.titulo}</h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-texto-suave)]">
                <span className="font-bold text-[var(--color-texto)]">
                  {formatarReal(tutorial.precoPromocional || tutorial.preco)}
                </span>
                {tutorial.precoPromocional && (
                  <span className="line-through">{formatarReal(tutorial.preco)}</span>
                )}
                {tutorial.distanciaKm !== null && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden />
                    {tutorial.cidade}, {tutorial.estado} - {tutorial.distanciaKm} km
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--color-texto-suave)]">
                /tutoriais/{tutorial.slug}
              </p>
            </div>
            <div className="flex items-start sm:justify-end">
              <Botao variante="contorno" tamanho="pequeno" onClick={() => abrirEdicao(tutorial)}>
                <Edit3 className="h-4 w-4" aria-hidden />
                Editar
              </Botao>
            </div>
          </Cartao>
        ))}
      </div>

      <Modal
        aberto={modalAberto}
        titulo={modo === "editar" ? "Editar anúncio" : "Novo anúncio"}
        descricao="Tudo que aparece no catálogo público fica controlável aqui."
        onFechar={() => setModalAberto(false)}
      >
        {carregandoEdicao ? (
          <div className="py-12 text-center text-sm text-[var(--color-texto-suave)]">
            Carregando dados do anúncio...
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                rotulo="Título"
                value={form.titulo}
                onChange={(e) => {
                  atualizar("titulo", e.target.value);
                  if (modo === "criar") atualizar("slug", criarSlug(e.target.value));
                }}
                placeholder="Ex.: Maquiagem para fotos"
              />
              <CampoTexto
                rotulo="Slug"
                value={form.slug}
                onChange={(e) => atualizar("slug", criarSlug(e.target.value))}
                placeholder="maquiagem-para-fotos"
              />
            </div>

            <CampoTexto
              rotulo="Descrição curta"
              value={form.descricaoCurta}
              onChange={(e) => atualizar("descricaoCurta", e.target.value)}
              placeholder="Resumo que aparece no card"
            />
            <CampoTexto
              rotulo="Conteúdo do anúncio"
              as="textarea"
              value={form.descricaoCompleta}
              onChange={(e) => atualizar("descricaoCompleta", e.target.value)}
              placeholder="Detalhe o conteúdo, benefício, materiais, entrega e instruções."
            />

            <div>
              <p className="mb-2 text-sm font-semibold">Categoria</p>
              <div className="flex flex-wrap gap-2">
                {categorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    type="button"
                    onClick={() => atualizar("categoriaId", categoria.id)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                      form.categoriaId === categoria.id
                        ? "border-[var(--color-berry)] bg-[var(--color-berry)] text-white"
                        : "border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-texto-suave)] hover:border-[var(--color-berry)]"
                    }`}
                  >
                    {categoria.nome}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Nível</p>
              <div className="flex flex-wrap gap-2">
                {niveis.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() => atualizar("nivel", opcao.valor)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                      form.nivel === opcao.valor
                        ? "border-[var(--color-sage)] bg-[var(--color-sage)] text-white"
                        : "border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-texto-suave)] hover:border-[var(--color-sage)]"
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                rotulo="Preço"
                value={form.preco}
                onChange={(e) => atualizar("preco", e.target.value)}
                placeholder="149,90"
                sufixo="R$"
              />
              <CampoTexto
                rotulo="Preço promocional"
                value={form.precoPromocional}
                onChange={(e) => atualizar("precoPromocional", e.target.value)}
                placeholder="99,90"
                sufixo="R$"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <CampoTexto
                rotulo="Cupom"
                value={form.cupomDesconto}
                onChange={(e) => atualizar("cupomDesconto", e.target.value.toUpperCase())}
                placeholder="GLOW20"
                icone={<TicketPercent className="h-4 w-4" aria-hidden />}
              />
              <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.destaquePromocional}
                  onChange={(e) => atualizar("destaquePromocional", e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-berry)]"
                />
                Promoção
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.bombando}
                  onChange={(e) => atualizar("bombando", e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-berry)]"
                />
                Bombando
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[var(--color-texto)] mb-1 block">Foto principal</label>
                <UploadImagem
                  valor={form.imagemCapaUrl}
                  aoAlterar={(url) => atualizar("imagemCapaUrl", url)}
                />
              </div>
              <CampoTexto
                rotulo="Vídeo de prévia"
                value={form.videoPreviaUrl}
                onChange={(e) => atualizar("videoPreviaUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <CampoTexto
              rotulo="Fotos extras da galeria"
              as="textarea"
              value={form.fotosGaleria}
              onChange={(e) => atualizar("fotosGaleria", e.target.value)}
              placeholder={"Uma URL por linha\nhttps://.../foto-1.jpg\nhttps://.../foto-2.jpg"}
            />

            <div className="grid gap-4 sm:grid-cols-[1fr_5rem_8rem]">
              <CampoTexto
                rotulo="Cidade"
                value={form.cidade}
                onChange={(e) => atualizar("cidade", e.target.value)}
                placeholder="São Paulo"
                icone={<MapPin className="h-4 w-4" aria-hidden />}
              />
              <CampoTexto
                rotulo="UF"
                value={form.estado}
                onChange={(e) => atualizar("estado", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="SP"
              />
              <CampoTexto
                rotulo="Distância"
                value={form.distanciaKm}
                onChange={(e) => atualizar("distanciaKm", e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="8"
                sufixo="km"
              />
            </div>

            <CampoTexto
              rotulo="Aulas / conteúdo liberado"
              as="textarea"
              value={form.modulosTexto}
              onChange={(e) => atualizar("modulosTexto", e.target.value)}
              placeholder={"Uma aula por linha: Título | minutos | gratis/pago | URL opcional\nPreparação da pele | 12 | gratis | https://..."}
            />

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-linha)] pt-4 sm:flex-row sm:justify-between">
              <div>
                {modo === "editar" && (
                  <Botao variante="perigo" onClick={desativarTutorial} carregando={salvando}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Desativar
                  </Botao>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Botao variante="contorno" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Botao>
                <Botao onClick={salvarTutorial} carregando={salvando}>
                  <Save className="h-4 w-4" aria-hidden />
                  {modo === "editar" ? "Salvar alterações" : "Publicar anúncio"}
                </Botao>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
