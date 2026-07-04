"use client";

import {
  BadgePercent,
  ImagePlus,
  MapPin,
  Plus,
  Save,
  Search,
  TicketPercent,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, CampoTexto, Cartao, Modal } from "@/components/ui";

interface TutorialAdmin {
  id: string;
  titulo: string;
  slug: string;
  preco: number;
  precoPromocional: number | null;
  cupomDesconto: string | null;
  destaquePromocional: boolean;
  cidade: string | null;
  estado: string | null;
  distanciaKm: number | null;
  imagemCapaUrl: string;
  categoria: { nome: string; slug: string };
}

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

export default function PaginaAdminTutoriais() {
  const { accessToken } = useAutenticacao();
  const [tutoriais, setTutoriais] = useState<TutorialAdmin[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [descricaoCurta, setDescricaoCurta] = useState("");
  const [descricaoCompleta, setDescricaoCompleta] = useState("");
  const [preco, setPreco] = useState("");
  const [precoPromocional, setPrecoPromocional] = useState("");
  const [cupomDesconto, setCupomDesconto] = useState("");
  const [destaquePromocional, setDestaquePromocional] = useState(false);
  const [categoriaId, setCategoriaId] = useState("");
  const [nivel, setNivel] = useState("INICIANTE");
  const [imagemCapaUrl, setImagemCapaUrl] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("SP");
  const [distanciaKm, setDistanciaKm] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
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
      setCategoriaId((atual) => atual || dC.dados[0]?.id || "");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const tutoriaisFiltrados = useMemo(() => {
    if (!busca.trim()) return tutoriais;
    const termo = busca.trim().toLowerCase();
    return tutoriais.filter((tutorial) =>
      [tutorial.titulo, tutorial.categoria.nome, tutorial.cidade || ""]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [busca, tutoriais]);

  function limparFormulario() {
    setTitulo("");
    setSlug("");
    setDescricaoCurta("");
    setDescricaoCompleta("");
    setPreco("");
    setPrecoPromocional("");
    setCupomDesconto("");
    setDestaquePromocional(false);
    setImagemCapaUrl("");
    setCidade("");
    setEstado("SP");
    setDistanciaKm("");
    setNivel("INICIANTE");
    setCategoriaId(categorias[0]?.id || "");
  }

  async function criarTutorial() {
    setErro("");
    setMensagem("");
    setSalvando(true);

    const precoNumero = numeroOuNulo(preco);
    if (!precoNumero) {
      setErro("Informe um preço válido.");
      setSalvando(false);
      return;
    }

    const corpo = {
      titulo,
      slug: slug || criarSlug(titulo),
      descricaoCurta,
      descricaoCompleta,
      preco: precoNumero,
      precoPromocional: numeroOuNulo(precoPromocional),
      cupomDesconto: cupomDesconto.trim() || null,
      destaquePromocional,
      categoriaId,
      nivel,
      imagemCapaUrl:
        imagemCapaUrl.trim() ||
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
      cidade: cidade.trim() || null,
      estado: estado.trim().toUpperCase() || null,
      distanciaKm: distanciaKm ? Number(distanciaKm) : null,
    };

    try {
      const resposta = await fetch("/api/tutoriais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(corpo),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setMensagem("Anúncio criado e publicado.");
        setModalAberto(false);
        limparFormulario();
        await carregar();
      } else {
        setErro(dados.erro || "Não foi possível criar o anúncio.");
      }
    } catch {
      setErro("Erro de conexão ao criar anúncio.");
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
          <h1 className="mt-1 text-3xl font-bold">Anúncios</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-texto)]/60">
            Crie anúncios com promoção, cupom, imagem, cidade e distância. A vitrine
            pública exibe tudo em ordem de postagem.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <CampoTexto
            rotulo="Buscar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Título, categoria ou cidade"
            icone={<Search className="h-4 w-4" aria-hidden />}
          />
          <div className="flex items-end">
            <Botao onClick={() => setModalAberto(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" aria-hidden />
              Novo anúncio
            </Botao>
          </div>
        </div>
      </div>

      {mensagem && (
        <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          {mensagem}
        </p>
      )}
      {erro && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {erro}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {tutoriaisFiltrados.map((tutorial) => (
          <Cartao key={tutorial.id} className="grid gap-4 sm:grid-cols-[9rem_1fr]">
            <div
              className="h-36 rounded-md bg-cover bg-center sm:h-full"
              style={{ backgroundImage: `url(${tutorial.imagemCapaUrl})` }}
            />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-md bg-[var(--color-sage)]/10 px-2 py-1 text-xs font-bold text-[var(--color-sage)]">
                  {tutorial.categoria.nome}
                </span>
                {tutorial.cupomDesconto && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-ouro)]/12 px-2 py-1 text-xs font-bold text-[var(--color-texto)]">
                    <TicketPercent className="h-3.5 w-3.5" aria-hidden />
                    {tutorial.cupomDesconto}
                  </span>
                )}
                {tutorial.destaquePromocional && (
                  <span className="rounded-md bg-[var(--color-berry)]/10 px-2 py-1 text-xs font-bold text-[var(--color-berry)]">
                    Promoção
                  </span>
                )}
              </div>
              <h3 className="truncate text-lg font-bold">{tutorial.titulo}</h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-texto)]/58">
                <span className="font-bold text-[var(--color-texto)]">
                  {formatarReal(tutorial.precoPromocional || tutorial.preco)}
                </span>
                {tutorial.precoPromocional && (
                  <span className="line-through">{formatarReal(tutorial.preco)}</span>
                )}
                {tutorial.distanciaKm !== null && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden />
                    {tutorial.cidade}, {tutorial.estado} · {tutorial.distanciaKm} km
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--color-texto)]/42">
                /tutoriais/{tutorial.slug}
              </p>
            </div>
          </Cartao>
        ))}
      </div>

      <Modal
        aberto={modalAberto}
        titulo="Novo anúncio"
        descricao="Preencha os dados principais. Depois de salvar, o anúncio entra na vitrine pública."
        onFechar={() => setModalAberto(false)}
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto
              rotulo="Título"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setSlug(criarSlug(e.target.value));
              }}
              placeholder="Ex.: Maquiagem para fotos"
            />
            <CampoTexto
              rotulo="Slug"
              value={slug}
              onChange={(e) => setSlug(criarSlug(e.target.value))}
              placeholder="maquiagem-para-fotos"
            />
          </div>

          <CampoTexto
            rotulo="Descrição curta"
            value={descricaoCurta}
            onChange={(e) => setDescricaoCurta(e.target.value)}
            placeholder="Resumo que aparece no card"
          />
          <CampoTexto
            rotulo="Descrição completa"
            as="textarea"
            value={descricaoCompleta}
            onChange={(e) => setDescricaoCompleta(e.target.value)}
            placeholder="Detalhe o conteúdo, benefício e o que o cliente recebe"
          />

          <div>
            <p className="mb-2 text-sm font-semibold">Categoria</p>
            <div className="flex flex-wrap gap-2">
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => setCategoriaId(categoria.id)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    categoriaId === categoria.id
                      ? "border-[var(--color-berry)] bg-[var(--color-berry)] text-white"
                      : "border-[var(--color-linha)] bg-white text-[var(--color-texto)]/70 hover:border-[var(--color-berry)]"
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
                  onClick={() => setNivel(opcao.valor)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    nivel === opcao.valor
                      ? "border-[var(--color-sage)] bg-[var(--color-sage)] text-white"
                      : "border-[var(--color-linha)] bg-white text-[var(--color-texto)]/70 hover:border-[var(--color-sage)]"
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
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="149,90"
              sufixo="R$"
            />
            <CampoTexto
              rotulo="Preço promocional"
              value={precoPromocional}
              onChange={(e) => setPrecoPromocional(e.target.value)}
              placeholder="99,90"
              sufixo="R$"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto
              rotulo="Cupom"
              value={cupomDesconto}
              onChange={(e) => setCupomDesconto(e.target.value.toUpperCase())}
              placeholder="GLOW20"
              icone={<TicketPercent className="h-4 w-4" aria-hidden />}
            />
            <label className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--color-linha)] bg-white px-3 py-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={destaquePromocional}
                onChange={(e) => setDestaquePromocional(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-berry)]"
              />
              Destacar como promoção
            </label>
          </div>

          <CampoTexto
            rotulo="Imagem de capa"
            value={imagemCapaUrl}
            onChange={(e) => setImagemCapaUrl(e.target.value)}
            placeholder="https://..."
            icone={<ImagePlus className="h-4 w-4" aria-hidden />}
          />

          <div className="grid gap-4 sm:grid-cols-[1fr_5rem_8rem]">
            <CampoTexto
              rotulo="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="São Paulo"
              icone={<MapPin className="h-4 w-4" aria-hidden />}
            />
            <CampoTexto
              rotulo="UF"
              value={estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
            />
            <CampoTexto
              rotulo="Distância"
              value={distanciaKm}
              onChange={(e) => setDistanciaKm(e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="8"
              sufixo="km"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-linha)] pt-4 sm:flex-row sm:justify-end">
            <Botao variante="contorno" onClick={() => setModalAberto(false)}>
              Cancelar
            </Botao>
            <Botao onClick={criarTutorial} carregando={salvando}>
              <Save className="h-4 w-4" aria-hidden />
              Publicar anúncio
            </Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
