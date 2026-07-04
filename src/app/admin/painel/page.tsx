import {
  MessageCircle,
  MessageSquareText,
  PackageCheck,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { Cartao } from "@/components/ui";

const atalhos = [
  {
    href: "/admin/tutoriais",
    titulo: "Anúncios",
    descricao: "Criar, revisar promoções, cupons e distância.",
    icone: ShoppingBag,
  },
  {
    href: "/admin/usuarios",
    titulo: "Usuários",
    descricao: "Visualizar clientes e contas administrativas.",
    icone: UsersRound,
  },
  {
    href: "/admin/pedidos",
    titulo: "Pedidos",
    descricao: "Acompanhar vendas e status de pagamento.",
    icone: PackageCheck,
  },
  {
    href: "/admin/comentarios",
    titulo: "Avaliações",
    descricao: "Moderar comentários e experiências dos clientes.",
    icone: MessageSquareText,
  },
  {
    href: "/admin/chat",
    titulo: "Chat",
    descricao: "Responder clientes dentro da plataforma.",
    icone: MessageCircle,
  },
];

export default function PaginaPainelAdmin() {
  return (
    <div>
      <div className="mb-6">
        <span className="text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
          Painel
        </span>
        <h1 className="mt-1 text-3xl font-bold">Visão geral</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {atalhos.map((atalho) => {
          const Icone = atalho.icone;
          return (
            <Link key={atalho.href} href={atalho.href} className="group">
              <Cartao className="h-full hover:-translate-y-0.5 hover:border-[var(--color-berry)]">
                <Icone className="mb-4 h-5 w-5 text-[var(--color-sage)]" aria-hidden />
                <h3 className="text-lg font-bold group-hover:text-[var(--color-berry)]">
                  {atalho.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-texto)]/62">
                  {atalho.descricao}
                </p>
              </Cartao>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
