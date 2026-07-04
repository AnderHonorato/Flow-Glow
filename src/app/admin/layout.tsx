"use client";

import {
  BarChart3,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const linksAdmin = [
  { href: "/admin/painel", texto: "Visão geral", icone: BarChart3 },
  { href: "/admin/tutoriais", texto: "Tutoriais", icone: ShoppingBag },
  { href: "/admin/anuncios", texto: "Banners", icone: Megaphone },
  { href: "/admin/cupons", texto: "Cupons", icone: Ticket },
  { href: "/admin/usuarios", texto: "Usuários", icone: UsersRound },
  { href: "/admin/pedidos", texto: "Pedidos", icone: PackageCheck },
  { href: "/admin/comentarios", texto: "Avaliações", icone: MessageSquareText },
  { href: "/admin/chat", texto: "Chat", icone: MessageCircle },
];

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  const caminho = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-fundo)] lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[var(--color-texto)] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 p-5">
          <Link href="/admin/painel" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-berry)]">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-serif text-lg font-bold text-[var(--color-ouro-claro)]">
              Studio Admin
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {linksAdmin.map((link) => {
            const Icone = link.icone;
            const ativo = caminho.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                  ativo
                    ? "bg-[var(--color-berry)] text-white"
                    : "text-white/62 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icone className="h-4 w-4" aria-hidden />
                {link.texto}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link href="/" className="text-sm font-semibold text-white/48 hover:text-white">
            Voltar ao site
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {linksAdmin.map((link) => {
            const Icone = link.icone;
            const ativo = caminho.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-bold ${
                  ativo
                    ? "border-[var(--color-berry)] bg-[var(--color-berry)] text-white"
                    : "border-[var(--color-linha)] bg-white text-[var(--color-texto)]/65"
                }`}
              >
                <Icone className="h-4 w-4" aria-hidden />
                {link.texto}
              </Link>
            );
          })}
        </div>
        {children}
      </main>
    </div>
  );
}
