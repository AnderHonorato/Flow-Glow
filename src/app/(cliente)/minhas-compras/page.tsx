"use client";

import {
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  PackageCheck,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { Botao, Cartao, Modal } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

interface ItemPedido {
  tutorial: { titulo: string; slug: string; imagemCapaUrl: string };
  precoUnitario: number;
}

interface Pedido {
  id: string;
  status: string;
  valorTotal: number;
  criadoEm: string;
  itens: ItemPedido[];
}

const statusMap: Record<string, { texto: string; cor: string }> = {
  PENDENTE: { texto: "Pendente", cor: "text-amber-600 bg-amber-50" },
  PROCESSANDO: { texto: "Processando", cor: "text-blue-600 bg-blue-50" },
  APROVADO: { texto: "Aprovado", cor: "text-green-600 bg-green-50" },
  RECUSADO: { texto: "Recusado", cor: "text-red-600 bg-red-50" },
  REEMBOLSADO: { texto: "Reembolsado", cor: "text-purple-600 bg-purple-50" },
};

function formatarReal(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function estaDentroDeTresMeses(iso: string) {
  const data = new Date(iso);
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
  return data >= tresMesesAtras;
}

export default function PaginaMinhasCompras() {
  const router = useRouter();
  const { usuario, accessToken } = useAutenticacao();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [descricaoProblema, setDescricaoProblema] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!accessToken) {
      setCarregando(false);
      return;
    }
    fetch("/api/pedidos", {
      cache: "no-store",
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso) setPedidos(d.dados || []);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [accessToken]);

  function alternarExpandir(id: string) {
    setExpandido((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function lidarComArquivo(
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "foto" | "video"
  ) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      const url = String(leitor.result);
      if (tipo === "foto") setFotos((p) => [...p, url]);
      else setVideos((p) => [...p, url]);
    };
    leitor.readAsDataURL(arquivo);
    e.target.value = "";
  }

  async function enviarProblema() {
    if (!descricaoProblema.trim() || !pedidoSelecionado) return;
    setEnviando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/pedidos/problema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          pedidoId: pedidoSelecionado.id,
          descricao: descricaoProblema.trim(),
          fotos,
          videos,
        }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setPedidoSelecionado(null);
        setDescricaoProblema("");
        setFotos([]);
        setVideos([]);
        router.push("/");
      } else {
        setErro(dados.erro || "Erro ao abrir protocolo.");
      }
    } catch {
      setErro("Erro de conexão.");
    }
    setEnviando(false);
  }

  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
            <PackageCheck className="h-4 w-4" aria-hidden />
            Minhas Compras
          </span>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Histórico de pedidos
          </h1>
          <p className="mt-2 text-sm text-[var(--color-texto-suave)]">
            Acompanhe seus pedidos e reporte problemas em até 3 meses.
          </p>
        </div>

        {!usuario ? (
          <Cartao className="max-w-xl">
            <p className="text-sm text-[var(--color-texto-suave)]">
              Entre na sua conta para ver suas compras.
            </p>
            <Link href="/login" className="mt-4 inline-flex">
              <Botao>Entrar</Botao>
            </Link>
          </Cartao>
        ) : carregando ? (
          <div className="flex justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-linha)] border-t-[var(--color-berry)]" />
          </div>
        ) : pedidos.length === 0 ? (
          <Cartao className="max-w-xl">
            <PackageCheck className="mb-3 h-6 w-6 text-[var(--color-ouro)]" aria-hidden />
            <h2 className="text-lg font-bold">Nenhum pedido ainda</h2>
            <p className="mt-2 text-sm text-[var(--color-texto-suave)]">
              Seus pedidos aparecerão aqui após a compra.
            </p>
            <Link href="/tutoriais" className="mt-4 inline-flex">
              <Botao variante="contorno">Explorar anúncios</Botao>
            </Link>
          </Cartao>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const status = statusMap[pedido.status] || statusMap.PENDENTE;
              const expandir = expandido.has(pedido.id);
              const podeReportar =
                estaDentroDeTresMeses(pedido.criadoEm) &&
                (pedido.status === "APROVADO" || pedido.status === "PROCESSANDO");

              return (
                <Cartao key={pedido.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-[var(--color-texto-suave)]">
                        Pedido #{pedido.id.slice(0, 8)}
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--color-texto-suave)]">
                        {formatarData(pedido.criadoEm)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${status.cor}`}
                      >
                        {status.texto}
                      </span>
                      <span className="text-lg font-bold text-[var(--color-berry)]">
                        {formatarReal(pedido.valorTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alternarExpandir(pedido.id)}
                    className="mt-3 flex w-full items-center justify-between rounded-lg bg-[var(--color-linha)]/30 px-3 py-2 text-sm font-semibold text-[var(--color-texto)] hover:bg-[var(--color-linha)]/50 transition-colors"
                  >
                    <span>{pedido.itens.length} item(ns)</span>
                    {expandir ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandir && (
                    <div className="mt-3 space-y-2">
                      {pedido.itens.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 rounded-lg bg-[var(--color-fundo)] px-3 py-2"
                        >
                          <span className="text-sm font-medium">
                            {item.tutorial.titulo}
                          </span>
                          <span className="text-sm font-bold text-[var(--color-berry)]">
                            {formatarReal(item.precoUnitario)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {podeReportar && (
                    <button
                      type="button"
                      onClick={() => setPedidoSelecionado(pedido)}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <AlertTriangle className="h-4 w-4" aria-hidden />
                      Tive um problema com esse produto
                    </button>
                  )}
                </Cartao>
              );
            })}
          </div>
        )}
      </main>

      <Modal
        aberto={!!pedidoSelecionado}
        titulo="Reportar problema"
        descricao="Descreva o problema com o pedido. Um protocolo de atendimento será aberto automaticamente."
        onFechar={() => {
          setPedidoSelecionado(null);
          setDescricaoProblema("");
          setFotos([]);
          setVideos([]);
          setErro("");
        }}
      >
        <div className="grid gap-4">
          {pedidoSelecionado && (
            <div className="rounded-lg bg-[var(--color-fundo)] p-3 text-sm">
              <span className="font-bold">
                Pedido #{pedidoSelecionado.id.slice(0, 8)}
              </span>
              <span className="ml-2 text-[var(--color-texto-suave)]">
                {formatarData(pedidoSelecionado.criadoEm)}
              </span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--color-texto)]">
              Descreva o problema *
            </label>
            <textarea
              value={descricaoProblema}
              onChange={(e) => setDescricaoProblema(e.target.value)}
              placeholder="Ex: O produto chegou danificado, não recebi o conteúdo, o produto não corresponde ao anúncio..."
              rows={4}
              className="w-full rounded-lg border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-3 py-2 text-sm text-[var(--color-texto)] placeholder:text-[var(--color-texto-suave)] focus:border-[var(--color-berry)] focus:outline-none focus:ring-2 focus:ring-[var(--color-berry)]/20"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--color-texto)]">
                <Camera className="inline h-4 w-4 mr-1" aria-hidden />
                Fotos (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => lidarComArquivo(e, "foto")}
                className="w-full text-sm text-[var(--color-texto-suave)] file:mr-3 file:rounded-lg file:border file:border-[var(--color-linha)] file:bg-[var(--color-papel)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-texto)] hover:file:border-[var(--color-berry)]"
              />
              {fotos.length > 0 && (
                <p className="mt-1 text-xs text-[var(--color-sage)]">
                  {fotos.length} foto(s) anexada(s)
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--color-texto)]">
                <Video className="inline h-4 w-4 mr-1" aria-hidden />
                Vídeos (opcional)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => lidarComArquivo(e, "video")}
                className="w-full text-sm text-[var(--color-texto-suave)] file:mr-3 file:rounded-lg file:border file:border-[var(--color-linha)] file:bg-[var(--color-papel)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-texto)] hover:file:border-[var(--color-berry)]"
              />
              {videos.length > 0 && (
                <p className="mt-1 text-xs text-[var(--color-sage)]">
                  {videos.length} vídeo(s) anexado(s)
                </p>
              )}
            </div>
          </div>

          {erro && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {erro}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Botao
              variante="contorno"
              onClick={() => {
                setPedidoSelecionado(null);
                setDescricaoProblema("");
                setFotos([]);
                setVideos([]);
                setErro("");
              }}
            >
              Cancelar
            </Botao>
            <Botao
              onClick={enviarProblema}
              carregando={enviando}
              disabled={!descricaoProblema.trim()}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Abrir protocolo
            </Botao>
          </div>
        </div>
      </Modal>

      <Rodape />
    </>
  );
}
