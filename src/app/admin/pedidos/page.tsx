"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao, Modal } from "@/components/ui";
import { AlertTriangle, Download, XCircle } from "lucide-react";
import { exportarCSV, exportarTXT } from "@/lib/exportar";

const coresStatus: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  PROCESSANDO: "bg-blue-100 text-blue-700",
  APROVADO: "bg-green-100 text-green-700",
  RECUSADO: "bg-red-100 text-red-700",
  REEMBOLSADO: "bg-purple-100 text-purple-700",
};

type PedidoAdmin = {
  id: string;
  status: string;
  valorTotal: number;
  comprovanteUrl: string | null;
  usuario: { nomeCompleto: string; email: string };
  itens: { tutorial: string; preco: number }[];
  criadoEm: string;
};

export default function PaginaAdminPedidos() {
  const { accessToken } = useAutenticacao();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoAdmin | null>(null);
  const [motivoReembolso, setMotivoReembolso] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregar();
  }, [accessToken]);

  function carregar() {
    fetch("/api/admin/pedidos", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso) setPedidos(d.dados);
      });
  }

  async function atualizarStatus(pedidoId: string, status: string, motivo?: string) {
    setProcessando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/pedidos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ pedidoId, status, motivo }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        carregar();
        setPedidoSelecionado(null);
        setMotivoReembolso("");
      } else {
        setErro(dados.erro || "Erro ao atualizar.");
      }
    } catch {
      setErro("Erro de conexão.");
    }
    setProcessando(false);
  }

  function podeCancelar(status: string) {
    return status === "PENDENTE" || status === "PROCESSANDO" || status === "APROVADO";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-2">
          <Botao
            tamanho="pequeno"
            variante="contorno"
            onClick={() => {
              exportarCSV(
                ["ID", "Cliente", "Email", "Status", "Valor", "Itens", "Data"],
                pedidos.map((p) => [
                  p.id.slice(0, 8),
                  p.usuario.nomeCompleto,
                  p.usuario.email,
                  p.status,
                  String(p.valorTotal.toFixed(2)),
                  p.itens.map((i) => i.tutorial).join(" | "),
                  new Date(p.criadoEm).toLocaleDateString("pt-BR"),
                ]),
                "pedidos"
              );
            }}
          >
            <Download className="h-4 w-4" /> CSV
          </Botao>
          <Botao
            tamanho="pequeno"
            variante="contorno"
            onClick={() => {
              const txt = pedidos
                .map(
                  (p) =>
                    `ID: ${p.id.slice(0, 8)}\nCliente: ${p.usuario.nomeCompleto}\nEmail: ${
                      p.usuario.email
                    }\nStatus: ${p.status}\nValor: R$ ${p.valorTotal.toFixed(2)}\nItens: ${p.itens
                      .map((i) => i.tutorial + " R$ " + i.preco)
                      .join(", ")}\nData: ${new Date(p.criadoEm).toLocaleDateString(
                      "pt-BR"
                    )}\n---`
                )
                .join("\n");
              exportarTXT(txt, "pedidos");
            }}
          >
            <Download className="h-4 w-4" /> TXT
          </Botao>
        </div>
      </div>

      {erro && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {erro}
        </p>
      )}

      <div className="space-y-4">
        {pedidos.map((p) => (
          <Cartao key={p.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs text-[var(--color-texto)]/40 font-mono">
                  #{p.id.slice(0, 8)}
                </span>
                <p className="text-sm">
                  {p.usuario.nomeCompleto} &middot; {p.usuario.email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-bold ${coresStatus[p.status] || ""}`}
                >
                  {p.status}
                </span>
                <span className="font-bold text-[var(--color-berry)]">
                  R$ {p.valorTotal.toFixed(2)}
                </span>
                {p.comprovanteUrl && (
                  <a
                    href={p.comprovanteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--color-sage)] underline"
                  >
                    Comprovante
                  </a>
                )}
              </div>
            </div>
            <div className="mt-2 text-xs text-[var(--color-texto)]/50">
              {p.itens.map((i, idx) => (
                <span key={idx}>
                  {i.tutorial}
                  {idx < p.itens.length - 1 ? " · " : ""}
                </span>
              ))}
              <span className="ml-2">
                {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
              </span>
            </div>

            {podeCancelar(p.status) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Botao
                  tamanho="pequeno"
                  variante="perigo"
                  onClick={() => {
                    setPedidoSelecionado(p);
                    setMotivoReembolso("");
                    setErro("");
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancelar / Reembolsar
                </Botao>
              </div>
            )}
          </Cartao>
        ))}
      </div>

      <Modal
        aberto={!!pedidoSelecionado}
        titulo="Cancelar pedido"
        descricao="Selecione o motivo do cancelamento. O cliente será reembolsado."
        onFechar={() => {
          setPedidoSelecionado(null);
          setMotivoReembolso("");
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
                {pedidoSelecionado.usuario.nomeCompleto}
              </span>
              <p className="mt-1 font-bold text-[var(--color-berry)]">
                R$ {pedidoSelecionado.valorTotal.toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--color-texto)]">
              Motivo do cancelamento
            </label>
            <select
              value={motivoReembolso}
              onChange={(e) => setMotivoReembolso(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-3 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
            >
              <option value="">Selecione um motivo...</option>
              <option value="estoque">Produto sem estoque</option>
              <option value="problema_produto">Problema com o produto</option>
            </select>
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
                setMotivoReembolso("");
                setErro("");
              }}
            >
              Voltar
            </Botao>
            <Botao
              variante="perigo"
              onClick={() =>
                pedidoSelecionado &&
                atualizarStatus(pedidoSelecionado.id, "REEMBOLSADO", motivoReembolso)
              }
              carregando={processando}
              disabled={!motivoReembolso}
            >
              <AlertTriangle className="h-4 w-4" />
              Confirmar reembolso
            </Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
