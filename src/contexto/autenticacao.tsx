"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface UsuarioSessao {
  id: string;
  nomeCompleto: string;
  email: string;
  papel: string;
  emailVerificado: boolean;
  fotoPerfilUrl: string | null;
  whatsapp: string | null;
}

interface ContextoAutenticacao {
  usuario: UsuarioSessao | null;
  carregando: boolean;
  accessToken: string | null;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  cadastro: (dados: {
    nomeCompleto: string;
    email: string;
    senha: string;
    confirmacaoSenha: string;
    aceitouTermos: boolean;
  }) => Promise<{ sucesso: boolean; erro?: string }>;
  logout: () => Promise<void>;
  verificarEmail: (token: string) => Promise<{ sucesso: boolean; erro?: string }>;
  recuperarSenha: (email: string) => Promise<{ sucesso: boolean; erro?: string }>;
  redefinirSenha: (token: string, senha: string, confirmacaoSenha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  renovarToken: () => Promise<boolean>;
}

const Contexto = createContext<ContextoAutenticacao | null>(null);

function salvarToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
}

function obterTokenSalvo(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

function removerTokenSalvo(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
}

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao carregar a página, tenta renovar o token automaticamente
  // usando o refresh token armazenado no cookie httpOnly.
  const renovarToken = useCallback(async (): Promise<boolean> => {
    try {
      const resposta = await fetch("/api/auth/renovar-token", {
        method: "POST",
        credentials: "include",
      });

      if (!resposta.ok) return false;

      const dados = await resposta.json();
      if (dados.sucesso && dados.dados?.accessToken) {
        salvarToken(dados.dados.accessToken);
        setAccessToken(dados.dados.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Busca o perfil do usuário logado usando o access token.
  async function buscarPerfil(token: string): Promise<boolean> {
    try {
      const resposta = await fetch("/api/usuarios/perfil", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resposta.ok) throw new Error("Falha ao buscar perfil");

      const dados = await resposta.json();
      if (dados.sucesso) {
        setUsuario(dados.dados);
        return true;
      }
      return false;
    } catch {
      removerTokenSalvo();
      setAccessToken(null);
      setUsuario(null);
      return false;
    }
  }

  // Inicialização — tenta renovar o token ou usar o token salvo.
  useEffect(() => {
    async function inicializar() {
      const tokenSalvo = obterTokenSalvo();

      if (tokenSalvo) {
        setAccessToken(tokenSalvo);
        const perfilCarregado = await buscarPerfil(tokenSalvo);
        if (!perfilCarregado) {
          const renovou = await renovarToken();
          if (!renovou) {
            setUsuario(null);
            setAccessToken(null);
          }
        }
      } else {
        // Tenta renovar via refresh token (cookie httpOnly).
        const renovou = await renovarToken();
        if (!renovou) {
          setUsuario(null);
          setAccessToken(null);
        }
      }
      setCarregando(false);
    }

    inicializar();
  }, [renovarToken]);

  // Busca o perfil sempre que o access token mudar (ex.: após refresh).
  useEffect(() => {
    if (accessToken) {
      buscarPerfil(accessToken);
    }
  }, [accessToken]);

  async function login(
    email: string,
    senha: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
        credentials: "include",
      });

      const dados = await resposta.json();

      if (!dados.sucesso) {
        return { sucesso: false, erro: dados.erro };
      }

      salvarToken(dados.dados.accessToken);
      setAccessToken(dados.dados.accessToken);
      setUsuario(dados.dados.usuario);

      return { sucesso: true };
    } catch {
      return { sucesso: false, erro: "Erro de conexão. Verifique sua internet." };
    }
  }

  async function cadastro(dados: {
    nomeCompleto: string;
    email: string;
    senha: string;
    confirmacaoSenha: string;
    aceitouTermos: boolean;
  }): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const resposta = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
        credentials: "include",
      });

      const resultado = await resposta.json();

      if (!resultado.sucesso) {
        return { sucesso: false, erro: resultado.erro };
      }

      salvarToken(resultado.dados.accessToken);
      setAccessToken(resultado.dados.accessToken);
      setUsuario(resultado.dados.usuario);

      return { sucesso: true };
    } catch {
      return { sucesso: false, erro: "Erro de conexão. Verifique sua internet." };
    }
  }

  async function logout(): Promise<void> {
    // Chama a API de logout para remover o refresh token do cookie.
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignora erro — o logout local acontece de qualquer forma.
    }

    removerTokenSalvo();
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
