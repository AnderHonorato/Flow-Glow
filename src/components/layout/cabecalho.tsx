"use client";

import {
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Moon,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AvatarUsuario, Botao, Marca } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";
import { usePreferencias } from "@/contexto/preferencias";
import { useCarrinho } from "@/hooks/use-carrinho";

const linksNavegacao = [
  { href: "/tutoriais", texto: "Catalogo", icone: Search, tipo: "catalogo" },
  { href: "/tutoriais?promocao=true", texto: "Ofertas", icone: Sparkles, tipo: "ofertas" },
] as const;

export function Cabecalho() {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, logout } = useAutenticacao();
  const { quantidadeItens } = useCarrinho();
  const {
    tema,
    definirTema,
    localizacao,
    carregandoLocalizacao,
    erroLocalizacao,
    solicitarLocalizacao,
  } = usePreferencias();

  const [menuAberto, setMenuAberto] = useState(false);
  const [encolhido, setEncolhido] = useState(false);
  const [busca, setBusca] = useState("");
  const [promocaoAtiva, setPromocaoAtiva] = useState(false);
  const ehAdmin = usuario?.papel === "ADMINISTRADOR";

  useEffect(() => {
    const onScroll = () => setEncolhido(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBusca(params.get("busca") || "");
    setPromocaoAtiva(params.get("promocao") === "true");
  }, [pathname]);

  const primeiroNome = useMemo(
    () => usuario?.nomeCompleto.split(" ")[0] || "",
    [usuario?.nomeCompleto]
  );

  async function sair() {
    await logout();
    setMenuAberto(false);
    router.push("/");
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  function pesquisar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const params = new URLSearchParams();
    if (busca.trim()) params.set("busca", busca.trim());
    setPromocaoAtiva(false);
    router.push(`/tutoriais${params.toString() ? `?${params.toString()}` : ""}`);
    fecharMenu();
  }

  function alternarTema() {
    definirTema(tema === "escuro" ? "claro" : "escuro");
  }

  function linkAtivo(tipo: "catalogo" | "ofertas") {
    if (!pathname.startsWith("/tutoriais")) return false;
    return tipo === "ofertas" ? promocaoAtiva : !promocaoAtiva;
  }

  const acoesUsuario = (
    <>
      {ehAdmin && (
        <Link href="/admin/painel" onClick={fecharMenu} className="w-full">
          <Botao variante="secundario" tamanho="pequeno" className="w-full justify-start">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Admin
          </Botao>
        </Link>
      )}
      {usuario ? (
        <>
          <Link href="/meus-tutoriais" onClick={fecharMenu} className="w-full">
            <Botao variante="fantasma" tamanho="pequeno" className="w-full justify-start">
              <PackageCheck className="h-4 w-4" aria-hidden /> Meus tutoriais
            </Botao>
          </Link>
          <Link href="/perfil" onClick={fecharMenu} className="w-full">
            <Botao variante="fantasma" tamanho="pequeno" className="w-full justify-start">
              <UserRound className="h-4 w-4" aria-hidden /> Perfil
            </Botao>
          </Link>
          <Link href="/carrinho" onClick={fecharMenu} className="w-full">
            <Botao variante="fantasma" tamanho="pequeno" className="w-full justify-start">
              <ShoppingBag className="h-4 w-4" aria-hidden /> Carrinho
              {quantidadeItens > 0 && (
                <span className="ml-auto rounded-full bg-[var(--color-berry)] px-2 py-0.5 text-xs text-white">
                  {quantidadeItens}
                </span>
              )}
            </Botao>
          </Link>
          <Botao
            variante="fantasma"
            tamanho="pequeno"
            onClick={sair}
            className="w-full justify-start text-red-600"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Sair
          </Botao>
        </>
      ) : (
        <>
          <Link href="/login" onClick={fecharMenu} className="w-full">
            <Botao variante="contorno" tamanho="medio" className="w-full">
              <LogIn className="h-4 w-4" aria-hidden /> Entrar
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${encolhido ? "py-2" : "py-3"}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
        <div
          className={`liquid-glass flex items-center gap-2 rounded-xl px-3 transition-all duration-300 ${
            encolhido ? "min-h-12" : "min-h-14"
          }`}
        >
          <Link href="/" className="flex shrink-0 items-center">
            <Marca compacta={encolhido} />
          </Link>

          {/* Espaçador flexível que empurra ações para a direita */}
          <div className="flex-1" />

          <nav className="hidden items-center gap-1 lg:flex">
            {linksNavegacao.map((link) => {
              const Icone = link.icone;
              const ativo = linkAtivo(link.tipo);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setPromocaoAtiva(link.tipo === "ofertas")}
                  className={`header-tab icon-hover inline-flex h-9 items-center gap-2 px-3 text-sm font-semibold transition-colors ${
                    ativo ? "header-tab-active" : ""
                  }`}
                >
                  <Icone className="h-4 w-4" aria-hidden /> {link.texto}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={pesquisar} className="hidden min-w-0 flex-1 md:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-texto-suave)]" />
              <input
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar ofertas, tutoriais, cidade..."
                className="h-10 w-full rounded-full border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_76%,transparent)] pl-10 pr-3 text-sm text-[var(--color-texto)] outline-none transition focus:border-[var(--color-berry)] focus:ring-2 focus:ring-[var(--color-berry)]/12"
              />
            </label>
          </form>

          <div className="ml-auto hidden items-center gap-1 md:flex">
            <button
              type="button"
              onClick={solicitarLocalizacao}
              className="icon-hover relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-texto)] transition hover:bg-[color-mix(in_srgb,var(--color-papel)_76%,transparent)]"
              title={localizacao ? "Localizacao ativada" : erroLocalizacao || "Usar minha localizacao"}
              aria-label="Usar minha localizacao"
              disabled={carregandoLocalizacao}
            >
              <MapPin className={`h-5 w-5 ${localizacao ? "text-[var(--color-sage)]" : ""}`} />
            </button>
            <button
              type="button"
              onClick={alternarTema}
              className="icon-hover inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-texto)] transition hover:bg-[color-mix(in_srgb,var(--color-papel)_76%,transparent)]"
              aria-label={tema === "escuro" ? "Ativar tema claro" : "Ativar tema escuro"}
              title={tema === "escuro" ? "Tema claro" : "Tema escuro"}
            >
              {tema === "escuro" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {usuario ? (
              <>
                <Link href="/carrinho" className="icon-hover relative">
                  <Botao variante="fantasma" tamanho="pequeno" aria-label="Carrinho">
                    <ShoppingBag className="h-4 w-4" aria-hidden />
                  </Botao>
                  {quantidadeItens > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--color-berry)] px-1.5 text-center text-[11px] font-bold text-white">
                      {quantidadeItens}
                    </span>
                  )}
                </Link>
                {ehAdmin && (
                  <Link href="/admin/painel">
                    <Botao variante="secundario" tamanho="pequeno">
                      <ShieldCheck className="h-4 w-4" aria-hidden /> Admin
                    </Botao>
                  </Link>
                )}
                <Link href="/perfil" className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm font-semibold text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-papel)_76%,transparent)]">
                  <AvatarUsuario nome={usuario.nomeCompleto} fotoUrl={usuario.fotoPerfilUrl} tamanho="pequeno" />
                  <span className="hidden max-w-24 truncate xl:inline">{primeiroNome}</span>
                </Link>
                <button
                  type="button"
                  onClick={sair}
                  className="icon-hover inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-texto-suave)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Botao variante="fantasma" tamanho="pequeno">
                    <LogIn className="h-4 w-4" aria-hidden /> Entrar
                  </Botao>
                </Link>
                <Link href="/cadastro">
                  <Botao variante="primario" tamanho="pequeno">Criar conta</Botao>
                </Link>
              </>
            )}
          </div>

          {/* Ações visíveis no mobile */}
          <div className="flex items-center gap-1 md:hidden">
            {usuario ? (
              <>
                <Link href="/carrinho" className="icon-hover relative inline-flex h-9 w-9 items-center justify-center rounded-full">
                  <ShoppingBag className="h-5 w-5 text-[var(--color-texto)]" />
                  {quantidadeItens > 0 && (
                    <span className="absolute -right-1 -top-0.5 min-w-[18px] rounded-full bg-[var(--color-berry)] text-center text-[10px] font-bold text-white leading-[18px]">
                      {quantidadeItens}
                    </span>
                  )}
                </Link>
                <Link href="/perfil" className="icon-hover inline-flex h-9 w-9 items-center justify-center rounded-full">
                  <AvatarUsuario nome={usuario.nomeCompleto} fotoUrl={usuario.fotoPerfilUrl} tamanho="pequeno" />
                </Link>
              </>
            ) : (
              <Link href="/login" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--color-berry)] px-4 text-sm font-semibold text-white">
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
            )}
          </div>

          <button
            type="button"
            className="icon-hover inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_76%,transparent)] text-[var(--color-texto)] md:hidden"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {menuAberto && (
        <div
          className="fixed inset-0 z-[70] bg-black/45 md:hidden"
          role="dialog"
          aria-modal="true"
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) setMenuAberto(false);
          }}
        >
          <div className="liquid-glass ml-auto flex h-full w-[min(90vw,22rem)] flex-col rounded-l-xl border-r-0">
            <div className="flex min-h-14 items-center justify-between border-b border-[var(--color-linha)] px-4">
              <Marca />
              <button
                type="button"
                onClick={fecharMenu}
                className="icon-hover inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-papel)_76%,transparent)]"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[var(--color-linha)] p-4">
              <form onSubmit={pesquisar}>
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-texto-suave)]" />
                  <input
                    value={busca}
                    onChange={(evento) => setBusca(evento.target.value)}
                    placeholder="Buscar no catalogo"
                    className="h-11 w-full rounded-full border border-[var(--color-linha)] bg-[var(--color-papel)] pl-10 pr-3 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)]"
                  />
                </label>
              </form>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              {linksNavegacao.map((link) => {
                const Icone = link.icone;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={fecharMenu}
                    onMouseDown={() => setPromocaoAtiva(link.tipo === "ofertas")}
                    className="icon-hover inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-papel)_78%,transparent)]"
                  >
                    <Icone className="h-5 w-5 text-[var(--color-berry)]" aria-hidden />
                    {link.texto}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={solicitarLocalizacao}
                className="icon-hover inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-papel)_78%,transparent)]"
              >
                <MapPin className="h-5 w-5 text-[var(--color-sage)]" aria-hidden />
                {localizacao ? "Localizacao ativa" : "Usar localizacao"}
              </button>
              <button
                type="button"
                onClick={alternarTema}
                className="icon-hover inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-papel)_78%,transparent)]"
              >
                {tema === "escuro" ? (
                  <Sun className="h-5 w-5 text-[var(--color-ouro)]" aria-hidden />
                ) : (
                  <Moon className="h-5 w-5 text-[var(--color-ouro)]" aria-hidden />
                )}
                {tema === "escuro" ? "Tema claro" : "Tema escuro"}
              </button>
            </nav>

            <div className="mt-auto grid gap-3 border-t border-[var(--color-linha)] p-4 [&_button]:min-h-11">
              {usuario && (
                <div className="mb-1 flex items-center gap-3 rounded-lg bg-[color-mix(in_srgb,var(--color-papel)_74%,transparent)] p-3">
                  <AvatarUsuario nome={usuario.nomeCompleto} fotoUrl={usuario.fotoPerfilUrl} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{usuario.nomeCompleto}</p>
                    <p className="truncate text-xs text-[var(--color-texto-suave)]">{usuario.email}</p>
                  </div>
                </div>
              )}
              {acoesUsuario}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
