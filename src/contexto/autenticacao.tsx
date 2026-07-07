"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { usePreferencias } from "@/contexto/preferencias";

interface UsuarioSessao {
  id: string;
  nomeCompleto: string;
  apelido: string | null;
  cpf: string | null;
  email: string;
  papel: string;
  emailVerificado: boolean;
  fotoPerfilUrl: string | null;
  whatsapp: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  genero: string | null;
  profissao: string | null;
}

interface ContextoAutenticacao {
  usuario: UsuarioSessao | null;
  carregando: boolean;
  accessToken: string | null;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  cadastro: (dados: {
    nomeCompleto: string;
    apelido?: string;
    cpf: string;
    email: string;
    whatsapp: string;
    telefone?: string;
    dataNascimento: string;
    genero?: string;
    profissao?: string;
    senha: string;
    confirmacaoSenha: string;
    aceitouTermos: boolean;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  }) => Promise<{ sucesso: boolean; erro?: string }>;
  logout: () => Promise<void>;
  verificarEmail: (token: string) => Promise<{ sucesso: boolean; erro?: string }>;
  recuperarSenha: (email: string) => Promise<{ sucesso: boolean; erro?: string }>;
  redefinirSenha: (token: string, senha: string, confirmacaoSenha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  renovarToken: () => Promise<boolean>;
  atualizarUsuario: (dados: Partial<UsuarioSessao>) => void;
}

const Contexto = createContext<ContextoAutenticacao | null>(null);

const MARCADOR_COOKIE = "httpOnly-cookie";

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const { preferenciasPermitidas } = usePreferencias();
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const atualizarUsuario = useCallback((dados: Partial<UsuarioSessao>) => {
    setUsuario((atual) => (atual ? { ...atual, ...dados } : atual));
  }, []);

  // Renova o access token via refresh token (cookie httpOnly).
  // O access token também é armazenado em cookie httpOnly — não
  // precisamos lê-lo no client; usamos um marcador para indicar sessão ativa.
  const renovarToken = useCallback(async (): Promise<boolean> => {
    try {
      const resposta = await fetch("/api/auth/renovar-token", {
        method: "POST",
        headers: { "x-preferencias-permitidas": preferenciasPermitidas ? "sim" : "nao" },
        credentials: "include",
      });

      if (!resposta.ok) return false;

      const dados = await resposta.json();
      if (dados.sucesso && dados.dados?.accessToken) {
        setAccessToken(MARCADOR_COOKIE);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [preferenciasPermitidas]);

  // Busca o perfil do usuário logado usando o cookie httpOnly.
  async function buscarPerfil(): Promise<boolean> {
    try {
      const resposta = await fetch("/api/usuarios/perfil", {
        credentials: "include",
      });

      if (!resposta.ok) throw new Error("Falha ao buscar perfil");

      const dados = await resposta.json();
      if (dados.sucesso) {
        setUsuario(dados.dados);
        return true;
      }
      return false;
    } catch {
      setAccessToken(null);
      setUsuario(null);
      return false;
    }
  }

  // Inicialização — tenta renovar o token via cookie httpOnly.
  useEffect(() => {
    async function inicializar() {
      const renovou = await renovarToken();
      if (renovou) {
        await buscarPerfil();
      } else {
        setUsuario(null);
        setAccessToken(null);
      }
      setCarregando(false);
    }

    inicializar();
  }, [renovarToken]);

  async function login(
    email: string,
    senha: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-preferencias-permitidas": preferenciasPermitidas ? "sim" : "nao",
        },
        body: JSON.stringify({ email, senha }),
        credentials: "include",
      });

      const dados = await resposta.json();

      if (!dados.sucesso) {
        return { sucesso: false, erro: dados.erro };
      }

      setAccessToken(MARCADOR_COOKIE);
      setUsuario(dados.dados.usuario);

      return { sucesso: true };
    } catch {
      return { sucesso: false, erro: "Erro de conexão. Verifique sua internet." };
    }
  }

  async function cadastro(dados: {
    nomeCompleto: string;
    apelido?: string;
    cpf: string;
    email: string;
    whatsapp: string;
    telefone?: string;
    dataNascimento: string;
    genero?: string;
    profissao?: string;
    senha: string;
    confirmacaoSenha: string;
    aceitouTermos: boolean;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  }): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const resposta = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-preferencias-permitidas": preferenciasPermitidas ? "sim" : "nao",
        },
        body: JSON.stringify(dados),
        credentials: "include",
      });

      const resultado = await resposta.json();

      if (!resultado.sucesso) {
        return { sucesso: false, erro: resultado.erro };
      }

      setAccessToken(MARCADOR_COOKIE);
      setUsuario(resultado.dados.usuario);

      return { sucesso: true };
    } catch {
      return { sucesso: false, erro: "Erro de conexão. Verifique sua internet." };
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignora erro — o logout local acontece de qualquer forma.
    }

    setAccessToken(null);
    setUsuario(null);
  }

  async function verificarEmail(
    token: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const resposta = await fetch("/api/auth/verificar-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const dados = await resposta.json();
      return { sucesso: dados.sucesso, erro: dados.erro };
    } catch {
      return { sucesso: false, erro: "Erro de conexão." };
    }
  }

  async function recuperarSenha(
    email: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const resposta = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const dados = await resposta.json();
      return { sucesso: dados.sucesso, erro: dados.erro };
    } catch {
      return { sucesso: false, erro: "Erro de conexão." };
    }
  }

  async function redefinirSenha(
    token: string,
    senha: string,
    confirmacaoSenha: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const resposta = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha, confirmacaoSenha }),
      });

      const dados = await resposta.json();
      return { sucesso: dados.sucesso, erro: dados.erro };
    } catch {
      return { sucesso: false, erro: "Erro de conexão." };
    }
  }

  return (
    <Contexto.Provider
      value={{
        usuario,
        carregando,
        accessToken,
        login,
        cadastro,
        logout,
        verificarEmail,
        recuperarSenha,
        redefinirSenha,
        renovarToken,
        atualizarUsuario,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAutenticacao(): ContextoAutenticacao {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error(
      "useAutenticacao deve ser usado dentro de um ProvedorAutenticacao"
    );
  }
  return contexto;
}
