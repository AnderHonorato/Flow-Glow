"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Consentimento = "pendente" | "aceito" | "recusado";
export type Tema = "claro" | "escuro" | "sistema";

interface LocalizacaoUsuario {
  latitude: number;
  longitude: number;
  capturadaEm: string;
}

interface ContextoPreferencias {
  consentimento: Consentimento;
  preferenciasPermitidas: boolean;
  tema: Tema;
  temaResolvido: "claro" | "escuro";
  zoom: number;
  localizacao: LocalizacaoUsuario | null;
  carregandoLocalizacao: boolean;
  erroLocalizacao: string;
  aceitarPreferencias: () => void;
  recusarPreferencias: () => void;
  definirTema: (tema: Tema) => void;
  definirZoom: (zoom: number) => void;
  aumentarZoom: () => void;
  diminuirZoom: () => void;
  solicitarLocalizacao: () => Promise<void>;
  limparLocalizacao: () => void;
}

const CHAVE_CONSENTIMENTO = "mca_cookie_consent";
const CHAVE_TEMA = "mca_theme";
const CHAVE_ZOOM = "mca_zoom";
const CHAVE_LOCALIZACAO = "mca_location";
const SESSAO_RECUSADA = "mca_cookie_declined_session";
const ZOOM_MIN = 90;
const ZOOM_MAX = 118;
const ZOOM_PADRAO = 100;

const Contexto = createContext<ContextoPreferencias | null>(null);

function temJanela(): boolean {
  return typeof window !== "undefined";
}

function temaDoSistema(): "claro" | "escuro" {
  if (!temJanela()) return "claro";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

function resolverTema(tema: Tema): "claro" | "escuro" {
  return tema === "sistema" ? temaDoSistema() : tema;
}

function aplicarTema(tema: Tema): "claro" | "escuro" {
  const resolvido = resolverTema(tema);
  if (!temJanela()) return resolvido;
  document.documentElement.dataset.theme = resolvido;
  document.documentElement.style.colorScheme = resolvido === "escuro" ? "dark" : "light";
  return resolvido;
}

function aplicarZoom(zoom: number): number {
  const proximo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom)));
  if (temJanela()) {
    document.documentElement.style.fontSize = `${proximo}%`;
    document.documentElement.dataset.zoom = String(proximo);
  }
  return proximo;
}

function temaInicial(): Tema {
  if (!temJanela()) return "claro";
  const consentiu = window.localStorage.getItem(CHAVE_CONSENTIMENTO) === "aceito";
  const temaSalvo = consentiu ? window.localStorage.getItem(CHAVE_TEMA) : null;
  if (temaSalvo === "claro" || temaSalvo === "escuro" || temaSalvo === "sistema") {
    return temaSalvo;
  }
  return "claro";
}

function zoomInicial(): number {
  if (!temJanela()) return ZOOM_PADRAO;
  const consentiu = window.localStorage.getItem(CHAVE_CONSENTIMENTO) === "aceito";
  const salvo = consentiu ? Number(window.localStorage.getItem(CHAVE_ZOOM)) : ZOOM_PADRAO;
  return Number.isFinite(salvo) ? aplicarZoom(salvo) : ZOOM_PADRAO;
}

function localizacaoSalva(): LocalizacaoUsuario | null {
  if (!temJanela()) return null;
  if (window.localStorage.getItem(CHAVE_CONSENTIMENTO) !== "aceito") return null;

  try {
    const dados = window.localStorage.getItem(CHAVE_LOCALIZACAO);
    return dados ? (JSON.parse(dados) as LocalizacaoUsuario) : null;
  } catch {
    window.localStorage.removeItem(CHAVE_LOCALIZACAO);
    return null;
  }
}

export function ProvedorPreferencias({ children }: { children: ReactNode }) {
  const [consentimento, setConsentimento] = useState<Consentimento>("pendente");
  const [tema, setTema] = useState<Tema>("claro");
  const [temaResolvido, setTemaResolvido] = useState<"claro" | "escuro">("claro");
  const [zoom, setZoom] = useState(ZOOM_PADRAO);
  const [localizacao, setLocalizacao] = useState<LocalizacaoUsuario | null>(null);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState("");

  useEffect(() => {
    const consentiu = window.localStorage.getItem(CHAVE_CONSENTIMENTO) === "aceito";
    const recusouSessao = window.sessionStorage.getItem(SESSAO_RECUSADA) === "sim";
    setConsentimento(consentiu ? "aceito" : recusouSessao ? "recusado" : "pendente");

    const proximoTema = temaInicial();
    setTema(proximoTema);
    setTemaResolvido(aplicarTema(proximoTema));
    setZoom(zoomInicial());
    setLocalizacao(localizacaoSalva());
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const atualizar = () => {
      if (tema === "sistema") setTemaResolvido(aplicarTema("sistema"));
    };
    atualizar();
    media.addEventListener("change", atualizar);
    return () => media.removeEventListener("change", atualizar);
  }, [tema]);

  const preferenciasPermitidas = consentimento === "aceito";

  const definirTema = useCallback(
    (novoTema: Tema) => {
      setTema(novoTema);
      setTemaResolvido(aplicarTema(novoTema));
      if (preferenciasPermitidas) {
        window.localStorage.setItem(CHAVE_TEMA, novoTema);
      }
    },
    [preferenciasPermitidas]
  );

  const definirZoom = useCallback(
    (novoZoom: number) => {
      const aplicado = aplicarZoom(novoZoom);
      setZoom(aplicado);
      if (preferenciasPermitidas) {
        window.localStorage.setItem(CHAVE_ZOOM, String(aplicado));
      }
    },
    [preferenciasPermitidas]
  );

  const aumentarZoom = useCallback(() => definirZoom(zoom + 5), [definirZoom, zoom]);
  const diminuirZoom = useCallback(() => definirZoom(zoom - 5), [definirZoom, zoom]);

  const aceitarPreferencias = useCallback(() => {
    window.localStorage.setItem(CHAVE_CONSENTIMENTO, "aceito");
    window.sessionStorage.removeItem(SESSAO_RECUSADA);
    window.localStorage.setItem(CHAVE_TEMA, tema);
    window.localStorage.setItem(CHAVE_ZOOM, String(zoom));
    if (localizacao) {
      window.localStorage.setItem(CHAVE_LOCALIZACAO, JSON.stringify(localizacao));
    }
    setConsentimento("aceito");
  }, [localizacao, tema, zoom]);

  const recusarPreferencias = useCallback(() => {
    window.localStorage.removeItem(CHAVE_CONSENTIMENTO);
    window.localStorage.removeItem(CHAVE_TEMA);
    window.localStorage.removeItem(CHAVE_ZOOM);
    window.localStorage.removeItem(CHAVE_LOCALIZACAO);
    window.localStorage.removeItem("studioglow_carrinho");
    window.sessionStorage.setItem(SESSAO_RECUSADA, "sim");
    setConsentimento("recusado");
  }, []);

  const solicitarLocalizacao = useCallback(async () => {
    setErroLocalizacao("");
    if (!navigator.geolocation) {
      setErroLocalizacao("Seu navegador não oferece localização.");
      return;
    }

    setCarregandoLocalizacao(true);
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          const proximaLocalizacao = {
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
            capturadaEm: new Date().toISOString(),
          };
          setLocalizacao(proximaLocalizacao);
          if (window.localStorage.getItem(CHAVE_CONSENTIMENTO) === "aceito") {
            window.localStorage.setItem(
              CHAVE_LOCALIZACAO,
              JSON.stringify(proximaLocalizacao)
            );
          }
          window.dispatchEvent(new Event("endereco-atualizado"));
          resolve();
        },
        () => {
          setErroLocalizacao("Localização não autorizada.");
          resolve();
        },
        { enableHighAccuracy: false, maximumAge: 1000 * 60 * 10, timeout: 8000 }
      );
    });
    setCarregandoLocalizacao(false);
  }, []);

  const limparLocalizacao = useCallback(() => {
    setLocalizacao(null);
    window.localStorage.removeItem(CHAVE_LOCALIZACAO);
  }, []);

  const valor = useMemo<ContextoPreferencias>(
    () => ({
      consentimento,
      preferenciasPermitidas,
      tema,
      temaResolvido,
      zoom,
      localizacao,
      carregandoLocalizacao,
      erroLocalizacao,
      aceitarPreferencias,
      recusarPreferencias,
      definirTema,
      definirZoom,
      aumentarZoom,
      diminuirZoom,
      solicitarLocalizacao,
      limparLocalizacao,
    }),
    [
      aceitarPreferencias,
      aumentarZoom,
      carregandoLocalizacao,
      consentimento,
      definirTema,
      definirZoom,
      diminuirZoom,
      erroLocalizacao,
      limparLocalizacao,
      localizacao,
      preferenciasPermitidas,
      recusarPreferencias,
      solicitarLocalizacao,
      tema,
      temaResolvido,
      zoom,
    ]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePreferencias(): ContextoPreferencias {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("usePreferencias deve ser usado dentro de ProvedorPreferencias");
  }
  return contexto;
}
