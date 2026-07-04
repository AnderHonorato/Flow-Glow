// Interface genérica para resposta de API padronizada em todo o projeto.
export interface RespostaApi<T = unknown> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  mensagem?: string;
}

// Tipos do catálogo de tutoriais.
export interface TutorialCard {
  id: string;
  titulo: string;
  slug: string;
  descricaoCurta: string;
  preco: number;
  precoPromocional: number | null;
  cupomDesconto: string | null;
  destaquePromocional: boolean;
  cidade: string | null;
  estado: string | null;
  distanciaKm: number | null;
  imagemCapaUrl: string;
  nivel: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  categoria: {
    nome: string;
    slug: string;
  };
  notaMedia: number;
  totalAvaliacoes: number;
}

export interface TutorialDetalhe extends TutorialCard {
  descricaoCompleta: string;
  videoPreviaUrl: string | null;
  modulos: ModuloDetalhe[];
  comentarios: ComentarioDetalhe[];
}

export interface ModuloDetalhe {
  id: string;
  titulo: string;
  ordem: number;
  duracaoMinutos: number;
  gratuito: boolean;
  videoUrl?: string; // Só liberado se o usuário comprou o tutorial.
}

export interface ComentarioDetalhe {
  id: string;
  nota: number;
  texto: string;
  usuario: {
    nomeCompleto: string;
    fotoPerfilUrl: string | null;
  };
  anexos: {
    tipo: "IMAGEM" | "VIDEO";
    url: string;
  }[];
  criadoEm: string;
  editadoEm: string;
}

// Tipos de carrinho e pedido.
export interface ItemCarrinho {
  tutorialId: string;
  titulo: string;
  imagemCapaUrl: string;
  preco: number;
  precoPromocional: number | null;
}

export interface PedidoResumo {
  id: string;
  status: string;
  valorTotal: number;
  itens: {
    tutorial: {
      titulo: string;
      slug: string;
      imagemCapaUrl: string;
    };
    precoUnitario: number;
  }[];
  criadoEm: string;
}
