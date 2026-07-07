"use client";

import { CreditCard, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cabecalho, Rodape } from "@/components/layout";
import { Cartao, Botao } from "@/components/ui";
import { useCarrinho } from "@/hooks/use-carrinho";

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PaginaCarrinho() {
  const router = useRouter();
  const { itens, removerDoCarrinho, total } = useCarrinho();

  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Carrinho
          </span>
          <h1 className="mt-1 text-3xl font-bold">Itens selecionados</h1>
        </div>

        {itens.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-4 py-14 text-center">
            <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-[var(--color-berry)]" aria-hidden />
            <h2 className="text-lg font-bold">Seu carrinho está vazio</h2>
            <p className="mt-2 text-sm text-[var(--color-texto)]/60">
              Escolha um anúncio para testar o checkout.
            </p>
            <Link href="/tutoriais" className="mt-6 inline-flex">
              <Botao variante="contorno">Ver anúncios</Botao>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-3">
              {itens.map((item) => (
                <Cartao key={item.tutorialId} className="grid gap-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
                  <div
                    className="h-28 rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.imagemCapaUrl})` }}
                  />
                  <div>
                    <h3 className="font-bold">{item.titulo}</h3>
                    <p className="mt-1 text-sm font-bold text-[var(--color-berry)]">
                      {formatarReal(item.precoPromocional || item.preco)}
                    </p>
                    {item.precoPromocional && (
                      <p className="text-xs text-[var(--color-texto)]/42 line-through">
                        {formatarReal(item.preco)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removerDoCarrinho(item.tutorialId)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remover
                  </button>
                </Cartao>
              ))}
            </div>

            <Cartao destaque className="h-fit">
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-texto)]/45">
                Total
              </p>
              <p className="mt-1 text-3xl font-bold">{formatarReal(total)}</p>
              <Botao tamanho="grande" className="mt-5 w-full" onClick={() => router.push("/checkout")}>
                <CreditCard className="h-5 w-5" aria-hidden />
                Ir para pagamento
              </Botao>
              <Link href="/tutoriais" className="mt-3 block text-center text-sm font-semibold text-[var(--color-berry)] hover:underline">
                Continuar comprando
              </Link>
            </Cartao>
          </div>
        )}
      </main>
      <Rodape />
    </>
  );
}
