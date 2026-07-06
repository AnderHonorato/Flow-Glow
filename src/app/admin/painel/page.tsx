import {
  MessageCircle,
  MessageSquareText,
  PackageCheck,
  Settings,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { Cartao } from "@/components/ui";

const atalhos = [
  {
    href: "/admin/tutoriais",
    titulo: "Anuncios",
    descricao: "Criar, revisar promocoes, cupons e distancia.",
    icone: ShoppingBag,
  },
  {
    href: "/admin/usuarios",
    titulo: "Usuarios",
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
    titulo: "Avaliacoes",
    descricao: "Moderar comentarios e experiencias dos clientes.",
    icone: MessageSquareText,
  },
  {
    href: "/admin/chat",
    titulo: "Chat",
    descricao: "Iniciar, transferir e encerrar atendimentos por protocolo.",
    icone: MessageCircle,
  },
  {
    href: "/admin/configuracoes",
    titulo: "Configuracoes",
    descricao: "Controlar faixa superior de avisos e periodo ativo.",
    icone: Settings,
  },
];

export default function PaginaPainelAdmin() {
  return (
    <div>
      <div className="mb-6">
        <span className="text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
          Painel
        </span>
        <h1 className="mt-1 text-3xl font-bold">Visao geral</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {atalhos.map((atalho) => {
          const Icone = atalho.icone;
          return (
            <Link key={atalho.href} href={atalho.href} className="group">
              <Cartao className="h-full hover:border-[var(--color-berry)]">
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
