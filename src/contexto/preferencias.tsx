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
type Tema = "claro" | "escuro";

interface LocalizacaoUsuario {
  latitude: number;
  longitude: number;
  capturadaEm: string;
}

interface ContextoPreferencias {
  consentimento: Consentimento;
  preferenciasPermitidas: boolean;
  tema: Tema;
  localizacao: LocalizacaoUsuario | null;
  carregandoLocalizacao: boolean;
  erroLocalizacao: string;
  aceitarPreferencias: () => void;
  recusarPreferencias: () => void;
  definirTema: (tema: Tema) => void;
  solicitarLocalizacao: () => Promise<void>;
  limparLocalizacao: () => void;
}

const CHAVE_CONSENTIMENTO = "mca_cookie_consent";
const CHAVE_TEMA = "mca_theme";
const CHAVE_LOCALIZACAO = "mca_location";
const SESSAO_RECUSADA = "mca_cookie_declined_session";

const Contexto = createContext<ContextoPreferencias | null>(null);

function temJanela(): boolean {
  return typeof window !== "undefined";
}

function aplicarTema(tema: Tema): void {
  if (!temJanela()) return;
  document.documentElement.dataset.theme = tema;
  document.documentElement.style.colorScheme = tema === "escuro" ? "dark" : "light";
}

function temaInicial(): Tema {
  if (!temJanela()) return "claro";
  const consentiu = window.localStorage.getItem(CHAVE_CONSENTIMENTO) === "aceito";
  const temaSalvo = consentiu ? window.localStorage.getItem(CHAVE_TEMA) : null;
  if (temaSalvo === "claro" || temaSalvo === "escuro") return temaSalvo;
  // Forçar tema claro como padrão absoluto
  return "claro";
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
  const [localizacao, setLocalizacao] = useState<LocalizacaoUsuario | null>(null);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState("");

  useEffect(() => {
    const consentiu = window.localStorage.getItem(CHAVE_CONSENTIMENTO) === "aceito";
    const recusouSessao = window.sessionStorage.getItem(SESSAO_RECUSADA) === "sim";
    setConsentimento(consentiu ? "aceito" : recusouSessao ? "recusado" : "pendente");

    const proximoTema = temaInicial();
    setTema(proximoTema);
    aplicarTema(proximoTema);
    setLocalizacao(localizacaoSalva());
  }, []);

  const preferenciasPermitidas = consentimento === "aceito";

  const definirTema = useCallback(
    (novoTema: Tema) => {
      setTema(novoTema);
      aplicarTema(novoTema);
      if (preferenciasPermitidas) {
        window.localStorage.setItem(CHAVE_TEMA, novoTema);
      }
    },
    [preferenciasPermitidas]
  );

  const aceitarPreferencias = useCallback(() => {
    window.localStorage.setItem(CHAVE_CONSENTIMENTO, "aceito");
    window.sessionStorage.removeItem(SESSAO_RECUSADA);
    window.localStorage.setItem(CHAVE_TEMA, tema);
    if (localizacao) {
      window.localStorage.setItem(CHAVE_LOCALIZACAO, JSON.stringify(localizacao));
    }
    setConsentimento("aceito");
  }, [localizacao, tema]);

  const recusarPreferencias = useCallback(() => {
    window.localStorage.removeItem(CHAVE_CONSENTIMENTO);
    window.localStorage.removeItem(CHAVE_TEMA);
    window.localStorage.removeItem(CHAVE_LOCALIZACAO);
    window.localStorage.removeItem("accessToken");
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
      localizacao,
      carregandoLocalizacao,
      erroLocalizacao,
      aceitarPreferencias,
      recusarPreferencias,
      definirTema,
      solicitarLocalizacao,
      limparLocalizacao,
    }),
    [
      aceitarPreferencias,
      carregandoLocalizacao,
      consentimento,
      definirTema,
      erroLocalizacao,
      limparLocalizacao,
      localizacao,
      preferenciasPermitidas,
      recusarPreferencias,
      solicitarLocalizacao,
      tema,
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
