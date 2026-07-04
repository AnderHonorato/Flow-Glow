export interface EmailVerificacao {
  para: string;
  nome: string;
  token: string;
}

export interface EmailRecuperacao {
  para: string;
  nome: string;
  token: string;
}

export interface ProvedorDeEmail {
  enviarVerificacao(dados: EmailVerificacao): Promise<void>;
  enviarRecuperacaoSenha(dados: EmailRecuperacao): Promise<void>;
}

// Placeholder — a implementação real usa Resend ou SMTP.
// Será finalizado quando a chave de API estiver definida.
export class ProvedorDeEmailPlaceholder implements ProvedorDeEmail {
  async enviarVerificacao(dados: EmailVerificacao): Promise<void> {
    console.log("[E-MAIL] Verificação:", {
      para: dados.para,
      nome: dados.nome,
      link: `${process.env.URL_PUBLICA}/verificar-email?token=${dados.token}`,
    });
  }

  async enviarRecuperacaoSenha(dados: EmailRecuperacao): Promise<void> {
    console.log("[E-MAIL] Recuperação:", {
      para: dados.para,
      nome: dados.nome,
      link: `${process.env.URL_PUBLICA}/redefinir-senha?token=${dados.token}`,
    });
  }
}
