"use client";

import {
  LogIn,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Botao } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";

const linksNavegacao = [
  { href: "/tutoriais", texto: "Tutoriais", icone: Search },
  { href: "/tutoriais?promocao=true", texto: "Promoções", icone: Sparkles },
];

export function Cabecalho() {
  const { usuario, logout } = useAutenticacao();
  const [menuAberto, setMenuAberto] = useState(false);
  const ehAdmin = usuario?.papel === "ADMINISTRADOR";

  async function sair() {
    await logout();
    setMenuAberto(false);
  }

  function fecharMenu() { setMenuAberto(false); }

  const acoesUsuario = (
    <>
      {ehAdmin && (
        <Link href="/admin/painel" onClick={fecharMenu} className="w-full">
          <Botao variante="secundario" tamanho="pequeno" className="w-full">
            <ShieldCheck className="h-4 w-4" /> Admin
          </Botao>
        </Link>
      )}
      {usuario ? (
        <>
          <Link href="/chat" onClick={fecharMenu} className="w-full">
            <Botao variante="fantasma" tamanho="pequeno" className="w-full justify-start">
              <MessageCircle className="h-4 w-4" /> Suporte
            </Botao>
          </Link>
          <Link href="/meus-tutoriais" onClick={fecharMenu} className="w-full">
            <Botao variante="fantasma" tamanho="pequeno" className="w-full justify-start">
              <ShoppingBag className="h-4 w-4" /> Meus tutoriais
            </Botao>
          </Link>
          <Link href="/perfil" onClick={fecharMenu} className="w-full">
            <Botao variante="fantasma" tamanho="pequeno" className="w-full justify-start">
              <UserRound className="h-4 w-4" /> Perfil
            </Botao>
          </Link>
          <Link href="/carrinho" onClick={fecharMenu} className="w-full">
            <Botao variante="fantasma" tamanho="pequeno" className="w-full justify-start">
              <ShoppingBag className="h-4 w-4" /> Carrinho
            </Botao>
          </Link>
          <Botao variante="fantasma" tamanho="pequeno" onClick={sair} className="w-full justify-start mt-2 text-red-500">
            Sair
          </Botao>
        </>
      ) : (
        <>
          <Link href="/login" onClick={fecharMenu} className="w-full">
            <Botao variante="contorno" tamanho="medio" className="w-full">
              <LogIn className="h-4 w-4" /> Entrar
            </Botao>
          </Link>
          <Link href="/cadastro" onClick={fecharMenu} className="w-full">
            <Botao variante="primario" tamanho="medio" className="w-full">
              Criar conta
            </Botao>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-linha)] bg-[var(--color-papel)]/94 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold text-[var(--color-texto)] transition-colors hover:text-[var(--color-berry)] shrink-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-berry)] text-xs text-white">SG</span>
            Studio Glow
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {linksNavegacao.map(link => {
              const Icone = link.icone;
              return (
                <Link key={link.href} href={link.href}
                  className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--color-texto)]/70 transition-colors hover:bg-white hover:text-[var(--color-berry)]">
                  <Icone className="h-4 w-4" /> {link.texto}
                </Link>
              );
            })}
          </nav>

          {/* Ações desktop */}
          <div className="hidden items-center gap-2 md:flex shrink-0">
            {usuario ? (
              <>
                <Link href="/chat">
                  <Botao variante="fantasma" tamanho="pequeno"><MessageCircle className="h-4 w-4" /></Botao>
                </Link>
                <Link href="/carrinho">
                  <Botao variante="fantasma" tamanho="pequeno"><ShoppingBag className="h-4 w-4" /></Botao>
                </Link>
                {ehAdmin && (
                  <Link href="/admin/painel">
                    <Botao variante="secundario" tamanho="pequeno"><ShieldCheck className="h-4 w-4" /> Admin</Botao>
                  </Link>
                )}
                <Link href="/meus-tutoriais">
                  <Botao variante="fantasma" tamanho="pequeno">Meus tutoriais</Botao>
                </Link>
                <Link href="/perfil">
                  <Botao variante="contorno" tamanho="pequeno"><UserRound className="h-4 w-4" /> Perfil</Botao>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Botao variante="fantasma" tamanho="pequeno"><LogIn className="h-4 w-4" /> Entrar</Botao>
                </Link>
                <Link href="/cadastro">
                  <Botao variante="primario" tamanho="pequeno">Criar conta</Botao>
                </Link>
              </>
            )}
          </div>

          {/* Hamburguer mobile — botão grande para dedos */}
          <button type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-linha)] bg-white text-[var(--color-texto)] md:hidden active:bg-[var(--color-bege)] touch-manipulation"
            onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Drawer lateral mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-[70] bg-black/50 md:hidden"
          role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setMenuAberto(false); }}>
          <div className="ml-auto flex h-full w-[min(88vw,20rem)] flex-col bg-white shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-[var(--color-linha)] px-4">
              <span className="font-serif text-lg font-bold">Studio Glow</span>
              <button type="button" onClick={fecharMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-texto)]/70 hover:bg-white active:bg-[var(--color-bege)] touch-manipulation"
                aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links de navegação no mobile */}
            <nav className="flex flex-col gap-1 p-4">
              {linksNavegacao.map(link => {
                const Icone = link.icone;
                return (
                  <Link key={link.href} href={link.href} onClick={fecharMenu}
                    className="inline-flex items-center gap-3 rounded-md px-3 py-3.5 text-base font-semibold text-[var(--color-texto)] hover:bg-white active:bg-[var(--color-bege)] touch-manipulation">
                    <Icone className="h-5 w-5 text-[var(--color-berry)]" /> {link.texto}
                  </Link>
                );
              })}
            </nav>

            {/* Ações no mobile — botões grandes para dedos */}
            <div className="mt-auto grid gap-3 border-t border-[var(--color-linha)] p-4 [&_button]:min-h-[3rem] [&_button]:text-base">
              {acoesUsuario}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
