"use client";

import {
  ChevronDown,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Minus,
  Monitor,
  Moon,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sun,
  UserRound,
  X,
  ZoomIn,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type FocusEvent } from "react";
import { AvatarUsuario, Botao, Marca } from "@/components/ui";
import { SeloLocalizacao } from "@/components/layout/barra-localizacao";
import { FaixaAvisos } from "@/components/layout/faixa-avisos";
import { useAutenticacao } from "@/contexto/autenticacao";
import { usePreferencias, type Tema } from "@/contexto/preferencias";
import { useCarrinho } from "@/hooks/use-carrinho";

const linksNavegacao = [
  { href: "/tutoriais", texto: "Catalogo", icone: ShoppingBag, tipo: "catalogo" },
  { href: "/tutoriais?promocao=true", texto: "Ofertas", icone: Sparkles, tipo: "ofertas" },
] as const;

const opcoesTema: { valor: Tema; texto: string; icone: typeof Sun }[] = [
  { valor: "claro", texto: "Claro", icone: Sun },
  { valor: "escuro", texto: "Escuro", icone: Moon },
  { valor: "sistema", texto: "Auto", icone: Monitor },
];

export function Cabecalho() {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, logout } = useAutenticacao();
  const { quantidadeItens } = useCarrinho();
  const {
    tema,
    definirTema,
    zoom,
    aumentarZoom,
    diminuirZoom,
    localizacao,
    solicitarLocalizacao,
  } = usePreferencias();

  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [timerFecharPerfil, setTimerFecharPerfil] = useState<ReturnType<typeof setTimeout> | null>(null);
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
    () => usuario?.apelido || usuario?.nomeCompleto.split(" ")[0] || "",
    [usuario?.apelido, usuario?.nomeCompleto]
  );

  async function sair() {
    await logout();
    setMenuAberto(false);
    setPerfilAberto(false);
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

  function linkAtivo(tipo: "catalogo" | "ofertas") {
    if (!pathname.startsWith("/tutoriais")) return false;
    return tipo === "ofertas" ? promocaoAtiva : !promocaoAtiva;
  }

  function aoSairFocoPerfil(evento: FocusEvent<HTMLDivElement>) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) {
      setPerfilAberto(false);
    }
  }

  const controleTemaZoom = (
    <div className="grid gap-3">
      <div>
        <p className="mb-2 text-xs font-bold uppercase text-[var(--color-texto-suave)]">Tema</p>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] p-1">
          {opcoesTema.map((opcao) => {
            const Icone = opcao.icone;
            const ativo = tema === opcao.valor;
            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => definirTema(opcao.valor)}
                className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md text-xs font-bold transition ${
                  ativo ? "bg-[var(--color-berry)] text-white" : "text-[var(--color-texto-suave)] hover:bg-[var(--color-linha)]/45"
                }`}
                aria-pressed={ativo}
              >
                <Icone className="h-3.5 w-3.5" aria-hidden />
                {opcao.texto}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase text-[var(--color-texto-suave)]">Zoom do site</p>
        <div className="flex items-center justify-between rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] p-1">
          <button
            type="button"
            onClick={diminuirZoom}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-texto)] hover:bg-[var(--color-linha)]/45"
            aria-label="Diminuir zoom"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span className="text-sm font-black">{zoom}%</span>
          <button
            type="button"
            onClick={aumentarZoom}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-texto)] hover:bg-[var(--color-linha)]/45"
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );

  const linksUsuario = (
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
              <ShoppingCart className="h-4 w-4" aria-hidden /> Carrinho
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
    <>
      <FaixaAvisos />
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
                  className="h-10 w-full rounded-full border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_86%,transparent)] pl-10 pr-3 text-sm text-[var(--color-texto)] outline-none transition focus:border-[var(--color-berry)] focus:ring-2 focus:ring-[var(--color-berry)]/12"
                />
              </label>
            </form>

            <SeloLocalizacao />

            <div className="ml-auto hidden items-center gap-1 md:flex">
              {usuario ? (
                <>
                  <Link href="/carrinho" className="icon-hover relative">
                    <Botao variante="fantasma" tamanho="pequeno" aria-label="Carrinho">
                      <ShoppingCart className="h-5 w-5" aria-hidden />
                    </Botao>
                    {quantidadeItens > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--color-berry)] px-1.5 text-center text-[11px] font-bold text-white">
                        {quantidadeItens}
                      </span>
                    )}
                  </Link>

                  <div
                    className="relative"
                    onMouseEnter={() => {
                      if (timerFecharPerfil) { clearTimeout(timerFecharPerfil); setTimerFecharPerfil(null); }
                      setPerfilAberto(true);
                    }}
                    onMouseLeave={() => {
                      const timer = setTimeout(() => setPerfilAberto(false), 300);
                      setTimerFecharPerfil(timer);
                    }}
                    onFocus={() => setPerfilAberto(true)}
                    onBlur={aoSairFocoPerfil}
                  >
                    <button
                      type="button"
                      onClick={() => setPerfilAberto((valor) => !valor)}
                      className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 text-sm font-semibold text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-papel)_76%,transparent)]"
                      aria-expanded={perfilAberto}
                    >
                      <AvatarUsuario nome={usuario.nomeCompleto} fotoUrl={usuario.fotoPerfilUrl} tamanho="pequeno" />
                      <span className="hidden max-w-24 truncate xl:inline">{primeiroNome}</span>
                      <ChevronDown className="h-4 w-4 text-[var(--color-texto-suave)]" aria-hidden />
                    </button>

                    {perfilAberto && (
                      <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] p-4 text-[var(--color-texto)] shadow-[0_18px_54px_rgba(23,32,51,0.18)]">
                        <div className="mb-3 flex items-center gap-3">
                          <AvatarUsuario nome={usuario.nomeCompleto} fotoUrl={usuario.fotoPerfilUrl} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">{usuario.nomeCompleto}</p>
                            <p className="truncate text-xs text-[var(--color-texto-suave)]">{usuario.email}</p>
                          </div>
                        </div>
                        <div className="mb-3 grid gap-2">{linksUsuario}</div>
                        {controleTemaZoom}
                      </div>
                    )}
                  </div>
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

            <div className="flex items-center gap-1 md:hidden">
              <button
                type="button"
                onClick={solicitarLocalizacao}
                className={`icon-hover inline-flex h-9 w-9 items-center justify-center rounded-full ${
                  localizacao ? "text-[var(--color-sage)]" : "text-[var(--color-texto)]"
                }`}
                aria-label={localizacao ? "Localizacao ativa" : "Usar localizacao"}
                title={localizacao ? "Localizacao ativa" : "Usar localizacao"}
              >
                <MapPin className="h-5 w-5" aria-hidden />
              </button>
              {usuario ? (
                <Link href="/carrinho" className="icon-hover relative inline-flex h-9 w-9 items-center justify-center rounded-full">
                  <ShoppingCart className="h-5 w-5 text-[var(--color-texto)]" />
                  {quantidadeItens > 0 && (
                    <span className="absolute -right-1 -top-0.5 min-w-[18px] rounded-full bg-[var(--color-berry)] text-center text-[10px] font-bold leading-[18px] text-white">
                      {quantidadeItens}
                    </span>
                  )}
                </Link>
              ) : (
                <Link href="/login" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--color-berry)] px-3 text-sm font-semibold text-white">
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
            <div className="liquid-glass ml-auto flex h-full w-[min(92vw,24rem)] flex-col rounded-l-xl border-r-0">
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

              <div className="min-h-0 flex-1 overflow-y-auto">
                {usuario && (
                  <div className="m-4 flex items-center gap-3 rounded-lg bg-[color-mix(in_srgb,var(--color-papel)_74%,transparent)] p-3">
                    <AvatarUsuario nome={usuario.nomeCompleto} fotoUrl={usuario.fotoPerfilUrl} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{usuario.nomeCompleto}</p>
                      <p className="truncate text-xs text-[var(--color-texto-suave)]">{usuario.email}</p>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-1 px-4 pb-4">
                  {linksNavegacao.map((link) => {
                    const Icone = link.icone;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={fecharMenu}
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
                </nav>

                <div className="border-y border-[var(--color-linha)] p-4">
                  {controleTemaZoom}
                </div>
              </div>

              <div className="grid gap-3 border-t border-[var(--color-linha)] p-4 [&_button]:min-h-11">
                {linksUsuario}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
