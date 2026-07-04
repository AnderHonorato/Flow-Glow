"use client";

import { Banknote, CheckCircle2, CreditCard, QrCode, Ticket, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { Cartao, Botao } from "@/components/ui";
import { useCarrinho } from "@/hooks/use-carrinho";
import { useAutenticacao } from "@/contexto/autenticacao";

const metodos = [
  { valor: "pix", rotulo: "PIX", descricao: "Aprovação em minutos", icone: QrCode },
  { valor: "credito", rotulo: "Crédito", descricao: "Cartão de crédito", icone: CreditCard },
  { valor: "debito", rotulo: "Débito", descricao: "Cartão de débito", icone: Wallet },
];

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PaginaCheckout() {
  const router = useRouter();
  const { itens, total, limparCarrinho } = useCarrinho();
  const { usuario, accessToken } = useAutenticacao();

  const [metodo, setMetodo] = useState("pix");
  const [cupomInput, setCupomInput] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; descontoPercentual: number } | null>(null);
  const [validandoCupom, setValidandoCupom] = useState(false);
  const [erroCupom, setErroCupom] = useState("");
  const [mostrarCupom, setMostrarCupom] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [pagamentoCriado, setPagamentoCriado] = useState(false);
  const [qrCode, setQrCode] = useState("");

  const desconto = cupomAplicado ? total * (cupomAplicado.descontoPercentual / 100) : 0;
  const totalFinal = total - desconto;

  useEffect(() => {
    if (!pagamentoCriado && itens.length === 0) router.replace("/carrinho");
  }, [itens.length, pagamentoCriado, router]);

  async function validarCupom() {
    if (!cupomInput.trim()) return;
    setValidandoCupom(true);
    setErroCupom("");
    try {
      const r = await fetch("/api/cupons/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: cupomInput }),
      });
      const d = await r.json();
      if (d.sucesso) setCupomAplicado(d.dados);
      else setErroCupom(d.erro || "Cupom inválido.");
    } catch { setErroCupom("Erro ao validar."); }
    setValidandoCupom(false);
  }

  async function handleFinalizar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (!usuario || !accessToken) { setErro("Faça login para finalizar."); return; }

    setProcessando(true);
    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          itens: itens.map(i => ({ tutorialId: i.tutorialId })),
          metodoPagamento: metodo,
          cupom: cupomAplicado?.codigo || null,
        }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) { setQrCode(dados.dados?.codigoPix || ""); setPagamentoCriado(true); limparCarrinho(); }
      else setErro(dados.erro || "Erro ao criar pedido.");
    } catch { setErro("Erro de conexão."); }
    setProcessando(false);
  }

  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
            <Banknote className="h-4 w-4" /> Checkout
          </span>
          <h1 className="mt-1 text-3xl font-bold">Pagamento</h1>
        </div>

        {pagamentoCriado ? (
          <Cartao className="mx-auto max-w-xl text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[var(--color-sage)]" />
            <h2 className="text-2xl font-bold">Pedido criado</h2>
            <p className="mt-3 text-sm text-[var(--color-texto)]/62">Use o código PIX simulado abaixo.</p>
            {qrCode && (
              <div className="mt-5 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] p-4">
                <div className="mx-auto mb-3 flex h-36 w-36 items-center justify-center rounded-md bg-white text-[var(--color-texto)]/42 ring-1 ring-[var(--color-linha)]">
                  <QrCode className="h-16 w-16" />
                </div>
                <p className="break-all rounded-md bg-white p-3 font-mono text-xs text-[var(--color-texto)]/56">{qrCode}</p>
              </div>
            )}
            <Botao className="mt-5" onClick={() => router.push("/meus-tutoriais")}>Ir para meus tutoriais</Botao>
          </Cartao>
        ) : (
          <form onSubmit={handleFinalizar} className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-5">
              <Cartao>
                <h2 className="text-lg font-bold">Resumo</h2>
                <div className="mt-4 space-y-3">
                  {itens.map(item => (
                    <div key={item.tutorialId} className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium">{item.titulo}</span>
                      <span className="font-bold">{formatarReal(item.precoPromocional || item.preco)}</span>
                    </div>
                  ))}
                </div>
              </Cartao>

              <Cartao>
                <h2 className="text-lg font-bold">Forma de pagamento</h2>
                <div className="mt-4 grid gap-3 grid-cols-3">
                  {metodos.map(opcao => {
                    const Icone = opcao.icone;
                    return (
                      <button key={opcao.valor} type="button" onClick={() => setMetodo(opcao.valor)}
                        className={`rounded-lg border p-4 text-left transition-colors cursor-pointer ${
                          metodo === opcao.valor ? "border-[var(--color-berry)] bg-[var(--color-berry)]/8" : "border-[var(--color-linha)] bg-white hover:border-[var(--color-berry)]"
                        }`}>
                        <Icone className="mb-3 h-5 w-5 text-[var(--color-berry)]" />
                        <span className="block font-bold text-sm">{opcao.rotulo}</span>
                        <span className="mt-1 block text-xs text-[var(--color-texto)]/55">{opcao.descricao}</span>
                      </button>
                    );
                  })}
                </div>
              </Cartao>

              {/* Cupom — oculto, exibe ao clicar */}
              <Cartao>
                <button type="button" onClick={() => setMostrarCupom(!mostrarCupom)}
                  className="flex w-full items-center gap-2 text-sm font-medium text-[var(--color-texto)]/60 hover:text-[var(--color-berry)] transition-colors cursor-pointer">
                  <Ticket className="h-4 w-4" />
                  {mostrarCupom ? "Ocultar cupom" : "Tenho um cupom de desconto"}
                </button>
                {mostrarCupom && (
                  <div className="mt-3 flex gap-2">
                    <input type="text" value={cupomInput} onChange={e => setCupomInput(e.target.value.toUpperCase())}
                      placeholder="Código do cupom" disabled={!!cupomAplicado}
                      className="flex-1 rounded-lg border border-[var(--color-linha-forte)] bg-white px-3 py-2 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[var(--color-berry)]/20 disabled:opacity-50" />
                    {cupomAplicado ? (
                      <Botao type="button" variante="fantasma" tamanho="pequeno" onClick={() => { setCupomAplicado(null); setCupomInput(""); }}>
                        Remover
                      </Botao>
                    ) : (
                      <Botao type="button" variante="contorno" tamanho="pequeno" carregando={validandoCupom} onClick={validarCupom}>
                        Aplicar
                      </Botao>
                    )}
                  </div>
                )}
                {erroCupom && <p className="mt-1 text-xs text-red-600">{erroCupom}</p>}
                {cupomAplicado && (
                  <p className="mt-2 text-xs text-[var(--color-sage)] font-medium">
                    Cupom {cupomAplicado.codigo} aplicado: -{cupomAplicado.descontoPercentual}%
                  </p>
                )}
              </Cartao>
            </div>

            <Cartao destaque className="h-fit">
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-texto)]/45">Total</p>
              {desconto > 0 && (
                <p className="mt-1 text-sm text-[var(--color-texto)]/50 line-through">{formatarReal(total)}</p>
              )}
              <p className="mt-1 text-3xl font-bold">{formatarReal(totalFinal)}</p>
              {desconto > 0 && (
                <p className="mt-1 text-xs text-[var(--color-sage)] font-medium">Você economizou {formatarReal(desconto)}</p>
              )}

              {!usuario && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                  Você precisa estar logado para finalizar.
                </p>
              )}
              {erro && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{erro}</p>
              )}
              <Botao type="submit" tamanho="grande" className="mt-5 w-full" carregando={processando} disabled={!usuario}>
                Finalizar pedido
              </Botao>
            </Cartao>
          </form>
        )}
      </main>
      <Rodape />
    </>
  );
}
