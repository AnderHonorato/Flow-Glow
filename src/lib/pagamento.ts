export interface DadosPagamento {
  valor: number;
  descricao: string;
  pedidoId: string;
  comprador: {
    nome: string;
    email: string;
  };
}

export interface ResultadoPagamento {
  idTransacao: string;
  status: "aprovado" | "pendente" | "recusado";
  metodo: "pix" | "cartao" | "boleto";
  // Para PIX: QR code e código copia-e-cola.
  qrCode?: string;
  codigoPix?: string;
  dataExpiracao?: Date;
  // Para boleto: URL do PDF.
  urlBoleto?: string;
}

export interface ProvedorDePagamento {
  criarPagamento(dados: DadosPagamento, metodo: string): Promise<ResultadoPagamento>;
  verificarPagamento(idTransacao: string): Promise<ResultadoPagamento>;
  processarWebhook(corpo: unknown, assinatura: string): Promise<{
    idTransacao: string;
    status: "aprovado" | "recusado";
  }>;
}

// Placeholder — a implementação real virá na Etapa 6 (Mercado Pago).
export class ProvedorDePagamentoPlaceholder implements ProvedorDePagamento {
  async criarPagamento(_dados: DadosPagamento, _metodo: string): Promise<ResultadoPagamento> {
    throw new Error("Provedor de pagamento ainda não implementado — Etapa 6.");
  }

  async verificarPagamento(_idTransacao: string): Promise<ResultadoPagamento> {
    throw new Error("Provedor de pagamento ainda não implementado — Etapa 6.");
  }

  async processarWebhook(
    _corpo: unknown,
    _assinatura: string
  ): Promise<{ idTransacao: string; status: "aprovado" | "recusado" }> {
    throw new Error("Provedor de pagamento ainda não implementado — Etapa 6.");
  }
}
