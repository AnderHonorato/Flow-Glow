"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

interface SugestaoBusca {
  id: string;
  titulo: string;
  slug: string;
  descricaoCurta: string;
  imagemCapaUrl: string;
  preco: number;
  precoPromocional: number | null;
  categoria: {
    nome: string;
    slug: string;
  };
}

interface BuscaAutocompleteProps {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onNavigate?: () => void;
  onSearch?: () => void;
}

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function BuscaAutocomplete({
  value,
  onChange,
  placeholder = "Buscar ofertas, tutoriais, cidade...",
  className = "",
  inputClassName = "",
  onNavigate,
  onSearch,
}: BuscaAutocompleteProps) {
  const router = useRouter();
  const [sugestoes, setSugestoes] = useState<SugestaoBusca[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const termo = value.trim();
  const reactId = useId();
  const listaId = `sugestoes-busca-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    if (abortRef.current && !abortRef.current.signal.aborted) {
      abortRef.current.abort("nova busca iniciada");
    }
    setIndiceAtivo(-1);

    if (termo.length < 1) {
      setSugestoes([]);
      setCarregando(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const timer = window.setTimeout(async () => {
      setCarregando(true);
      try {
        const resposta = await fetch(
          `/api/tutoriais?busca=${encodeURIComponent(termo)}&limite=6`,
          { signal: controller.signal, cache: "no-store" }
        );
        const dados = await resposta.json();
        if (!controller.signal.aborted) {
          setSugestoes(dados.sucesso ? dados.dados : []);
          setAberto(true);
        }
      } catch (erro) {
        if (
          controller.signal.aborted ||
          (erro instanceof DOMException && erro.name === "AbortError")
        ) {
          return;
        }
        setSugestoes([]);
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }, 140);

    return () => {
      window.clearTimeout(timer);
      if (!controller.signal.aborted) {
        controller.abort("nova busca iniciada");
      }
    };
  }, [termo]);

  function irParaSugestao(sugestao: SugestaoBusca) {
    setAberto(false);
    onChange("");
    onNavigate?.();
    router.push(`/tutoriais/${sugestao.slug}`);
  }

  function pesquisar(evento?: FormEvent<HTMLFormElement>) {
    evento?.preventDefault();
    onSearch?.();
    if (indiceAtivo >= 0 && sugestoes[indiceAtivo]) {
      irParaSugestao(sugestoes[indiceAtivo]);
      return;
    }
    const params = new URLSearchParams();
    if (termo) params.set("busca", termo);
    setAberto(false);
    onNavigate?.();
    router.push(`/tutoriais${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function aoTeclar(evento: KeyboardEvent<HTMLInputElement>) {
    if (!aberto || sugestoes.length === 0) return;
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setIndiceAtivo((atual) => Math.min(sugestoes.length - 1, atual + 1));
    }
    if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setIndiceAtivo((atual) => Math.max(-1, atual - 1));
    }
    if (evento.key === "Escape") {
      setAberto(false);
      setIndiceAtivo(-1);
    }
  }

  const mostrarPainel = aberto && termo.length > 0;

  return (
    <form onSubmit={pesquisar} className={`relative min-w-0 ${className}`}>
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-texto-suave)]" />
        <input
          value={value}
          onChange={(evento) => onChange(evento.target.value)}
          onFocus={() => termo && setAberto(true)}
          onBlur={() => window.setTimeout(() => setAberto(false), 120)}
          onKeyDown={aoTeclar}
          placeholder={placeholder}
          className={`h-10 w-full rounded-full border border-[var(--color-linha)] bg-[color-mix(in_srgb,var(--color-papel)_88%,transparent)] pl-10 pr-9 text-sm text-[var(--color-texto)] outline-none transition placeholder:text-[var(--color-texto-suave)] focus:border-[var(--color-berry)] focus:ring-2 focus:ring-[var(--color-berry)]/12 ${inputClassName}`}
          autoComplete="off"
          role="combobox"
          aria-expanded={mostrarPainel}
          aria-controls={listaId}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSugestoes([]);
              setAberto(false);
            }}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-texto-suave)] hover:bg-[var(--color-linha)]/55 hover:text-[var(--color-texto)]"
            aria-label="Limpar busca"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </label>

      {mostrarPainel && (
        <div
          id={listaId}
          className="absolute left-0 right-0 top-full z-[85] mt-2 overflow-hidden rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] text-[var(--color-texto)] shadow-[0_18px_52px_rgba(23,32,51,0.20)]"
          onMouseDown={(evento) => evento.preventDefault()}
        >
          {carregando ? (
            <div className="px-3 py-3 text-sm font-semibold text-[var(--color-texto-suave)]">
              Buscando sugestões...
            </div>
          ) : sugestoes.length > 0 ? (
            <div className="max-h-80 overflow-y-auto p-1.5">
              {sugestoes.map((sugestao, indice) => {
                const preco = sugestao.precoPromocional || sugestao.preco;
                const ativo = indice === indiceAtivo;
                return (
                  <button
                    key={sugestao.id}
                    type="button"
                    onClick={() => irParaSugestao(sugestao)}
                    onMouseEnter={() => setIndiceAtivo(indice)}
                    className={`grid w-full grid-cols-[3.5rem_1fr] gap-3 rounded-lg p-2 text-left transition ${
                      ativo
                        ? "bg-[color-mix(in_srgb,var(--color-berry)_10%,transparent)]"
                        : "hover:bg-[color-mix(in_srgb,var(--color-papel)_70%,var(--color-linha)_30%)]"
                    }`}
                  >
                    <img
                      src={sugestao.imagemCapaUrl}
                      alt=""
                      className="h-14 w-14 rounded-md object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black">
                        {sugestao.titulo}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--color-texto-suave)]">
                        {sugestao.categoria.nome} · {sugestao.descricaoCurta}
                      </span>
                      <span className="mt-1 block text-xs font-black text-[var(--color-berry)]">
                        {formatarReal(preco)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-3 text-sm text-[var(--color-texto-suave)]">
              Nenhum anúncio encontrado. Pressione Enter para buscar por “{termo}”.
            </div>
          )}
        </div>
      )}
    </form>
  );
}
