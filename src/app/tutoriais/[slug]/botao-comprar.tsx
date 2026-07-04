"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Botao } from "@/components/ui";
import { useCarrinho } from "@/hooks/use-carrinho";
import { useAutenticacao } from "@/contexto/autenticacao";

interface BotaoComprarProps {
  tutorialId: string;
  titulo: string;
  imagemCapaUrl: string;
  preco: number;
  precoPromocional: number | null;
}

export default function BotaoComprar({
  tutorialId, titulo, imagemCapaUrl, preco, precoPromocional,
}: BotaoComprarProps) {
  const router = useRouter();
  const { usuario } = useAutenticacao();
  const { adicionarAoCarrinho, itens } = useCarrinho();
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const jaNoCarrinho = itens.some((item) => item.tutorialId === tutorialId);

  function comprarAgora() {
    if (!usuario) { router.push("/login?redir=" + encodeURIComponent(window.location.pathname)); return; }
    if (!jaNoCarrinho) {
      adicionarAoCarrinho({ tutorialId, titulo, imagemCapaUrl, preco, precoPromocional });
    }
    router.push("/checkout");
  }

  function adicionarCarrinho() {
    if (!usuario) { router.push("/login?redir=" + encodeURIComponent(window.location.pathname)); return; }
    if (!jaNoCarrinho) {
      adicionarAoCarrinho({ tutorialId, titulo, imagemCapaUrl, preco, precoPromocional });
    }
    setMostrarOpcoes(false);
  }

  if (mostrarOpcoes) {
    return (
      <div className="space-y-3">
        <Botao variante="primario" tamanho="grande" className="w-full" onClick={comprarAgora}>
          <ShoppingBag className="h-5 w-5" /> Comprar agora
        </Botao>
        <Botao variante="contorno" tamanho="grande" className="w-full" onClick={adicionarCarrinho}>
          Adicionar ao carrinho
        </Botao>
        <button
          type="button"
          onClick={() => setMostrarOpcoes(false)}
          className="w-full text-sm text-[var(--color-texto)]/50 hover:text-[var(--color-texto)] cursor-pointer py-1"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <Botao
      variante={jaNoCarrinho ? "secundario" : "primario"}
      tamanho="grande"
      className="w-full"
      onClick={() => usuario ? setMostrarOpcoes(true) : router.push("/login?redir=" + encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : ""))}
    >
      <ShoppingBag className="h-5 w-5" />
      {jaNoCarrinho ? "Ir para o carrinho" : "Comprar"}
    </Botao>
  );
}
