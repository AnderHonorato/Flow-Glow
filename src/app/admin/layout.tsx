"use client";

import {
  BarChart3,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  PackageCheck,
  ChevronLeft,
  Heart,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Ticket,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Marca } from "@/components/ui";

const linksAdmin = [
  { href: "/admin/painel", texto: "Visao geral", icone: BarChart3 },
  { href: "/admin/tutoriais", texto: "Tutoriais", icone: ShoppingBag },
  { href: "/admin/categorias", texto: "Categorias", icone: Tag },
  { href: "/admin/anuncios", texto: "Banners", icone: Megaphone },
  { href: "/admin/favoritos", texto: "Favoritos", icone: Heart },
  { href: "/admin/cupons", texto: "Cupons", icone: Ticket },
  { href: "/admin/usuarios", texto: "Usuarios", icone: UsersRound },
  { href: "/admin/pedidos", texto: "Pedidos", icone: PackageCheck },
  { href: "/admin/comentarios", texto: "Avaliacoes", icone: MessageSquareText },
  { href: "/admin/chat", texto: "Chat", icone: MessageCircle },
  { href: "/admin/configuracoes", texto: "Configuracoes", icone: Settings },
];

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  const caminho = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-fundo)] lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[var(--color-texto)] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 p-5">
          <Link href="/admin/painel" className="flex items-center gap-2">
            <Marca inversa />
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white/70">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Admin
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

      <main className="min-w-0 flex-1 p-3 sm:p-6 lg:p-8">
        <div className="sticky top-0 z-40 -mx-3 mb-3 border-b border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-fundo)_92%,transparent)] px-3 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
          <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
            <Link href="/admin/painel" className="min-w-0">
              <Marca compacta />
            </Link>
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-2 text-xs font-bold text-[var(--color-texto)]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Site
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
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
                      : "border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-texto-suave)]"
                  }`}
                >
                  <Icone className="h-4 w-4" aria-hidden />
                  {link.texto}
                </Link>
              );
            })}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
