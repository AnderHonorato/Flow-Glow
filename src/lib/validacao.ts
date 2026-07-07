import { z } from "zod";

const somenteDigitos = (valor: unknown) =>
  typeof valor === "string" ? valor.replace(/\D/g, "") : valor;

export const senhaForte = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos 1 letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos 1 número");

const dataNascimento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida");

const telefoneOpcional = z.preprocess(
  somenteDigitos,
  z.string().regex(/^\d{10,11}$/, "Telefone deve ter DDD e número").optional().or(z.literal(""))
);

const celularObrigatorio = z.preprocess(
  somenteDigitos,
  z.string().regex(/^\d{10,11}$/, "WhatsApp deve ter DDD e número")
);

export const esquemaCadastro = z
  .object({
    nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200),
    apelido: z.string().max(80, "Apelido muito longo").optional(),
    cpf: z.preprocess(somenteDigitos, z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos")),
    email: z.string().email("E-mail inválido"),
    whatsapp: celularObrigatorio,
    telefone: telefoneOpcional,
    dataNascimento,
    genero: z.string().max(40, "Gênero muito longo").optional(),
    profissao: z.string().max(80, "Profissão muito longa").optional(),
    senha: senhaForte,
    confirmacaoSenha: z.string(),
    aceitouTermos: z.boolean().refine((v) => v === true, {
      message: "Você precisa aceitar os termos de uso",
    }),
    cep: z.preprocess(somenteDigitos, z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos")),
    logradouro: z.string().min(2, "Logradouro obrigatório"),
    numero: z.string().min(1, "Número obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro obrigatório"),
    cidade: z.string().min(1, "Cidade obrigatória"),
    estado: z.string().length(2, "Estado deve ter 2 letras"),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    message: "As senhas não conferem",
    path: ["confirmacaoSenha"],
  });

export const esquemaPerfil = z
  .object({
    nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200),
    apelido: z.string().max(80, "Apelido muito longo").optional().nullable(),
    cpf: z.preprocess(
      somenteDigitos,
      z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos").optional().or(z.literal(""))
    ),
    email: z.string().email("E-mail inválido"),
    codigoConfirmacaoEmail: z.string().optional(),
    whatsapp: z.preprocess(
      somenteDigitos,
      z.string().regex(/^\d{10,11}$/, "WhatsApp deve ter DDD e número").optional().or(z.literal(""))
    ),
    telefone: telefoneOpcional,
    dataNascimento: dataNascimento.optional().or(z.literal("")),
    genero: z.string().max(40, "Gênero muito longo").optional().nullable(),
    profissao: z.string().max(80, "Profissão muito longa").optional().nullable(),
    fotoPerfilUrl: z.string().optional().nullable(),
    senhaAtual: z.string().optional(),
    novaSenha: senhaForte.optional().or(z.literal("")),
    confirmacaoNovaSenha: z.string().optional(),
  })
  .refine((dados) => {
    if (!dados.novaSenha) return true;
    return dados.novaSenha === dados.confirmacaoNovaSenha;
  }, {
    message: "As senhas não conferem",
    path: ["confirmacaoNovaSenha"],
  });

export const esquemaLogin = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "A senha e obrigatória"),
});

export const esquemaRecuperarSenha = z.object({
  email: z.string().email("E-mail inválido"),
});

export const esquemaNovaSenha = z
  .object({
    token: z.string().min(1, "Token inválido"),
    senha: senhaForte,
    confirmacaoSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    message: "As senhas não conferem",
    path: ["confirmacaoSenha"],
  });

export const esquemaEndereco = z.object({
  cep: z.string().length(8, "CEP deve ter 8 dígitos").regex(/^\d+$/, "CEP deve conter apenas números"),
  logradouro: z.string().min(2, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro obrigatório"),
  cidade: z.string().min(1, "Cidade obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 letras"),
});

export const esquemaComentario = z.object({
  nota: z.number().int().min(1, "Nota mínima é 1").max(5, "Nota máxima é 5"),
  texto: z.string().min(3, "O comentário deve ter pelo menos 3 caracteres").max(2000, "Comentário muito longo"),
  tutorialId: z.string().uuid("Tutorial inválido"),
});

export const esquemaTutorial = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  descricaoCurta: z.string().min(10).max(300),
  descricaoCompleta: z.string().min(50, "Conteúdo do anúncio deve ter pelo menos 50 caracteres"),
  preco: z.number().positive("Preço deve ser positivo"),
  precoPromocional: z.number().positive().optional().nullable(),
  imagemCapaUrl: z.string().min(1, "Informe uma imagem de capa").optional(),
  videoPreviaUrl: z.string().optional().nullable(),
  cupomDesconto: z.string().max(40, "Cupom muito longo").optional().nullable(),
  destaquePromocional: z.boolean().optional(),
  bombando: z.boolean().optional(),
  fotosGaleria: z.array(z.string().min(1)).optional(),
  cidade: z.string().max(80, "Cidade muito longa").optional().nullable(),
  estado: z.string().max(2, "Use a sigla do estado").optional().nullable(),
  distanciaKm: z.number().int().min(0).max(999).optional().nullable(),
  categoriaId: z.string().uuid("Categoria inválida"),
  nivel: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]),
  modulos: z
    .array(
      z.object({
        titulo: z.string().min(2, "Informe o título do módulo"),
        videoUrl: z.string().optional().nullable(),
        duracaoMinutos: z.number().int().min(1).max(600),
        gratuito: z.boolean().optional(),
      })
    )
    .optional(),
});

export type DadosCadastro = z.infer<typeof esquemaCadastro>;
export type DadosPerfil = z.infer<typeof esquemaPerfil>;
export type DadosLogin = z.infer<typeof esquemaLogin>;
export type DadosRecuperarSenha = z.infer<typeof esquemaRecuperarSenha>;
export type DadosNovaSenha = z.infer<typeof esquemaNovaSenha>;
export type DadosEndereco = z.infer<typeof esquemaEndereco>;
export type DadosComentario = z.infer<typeof esquemaComentario>;
export type DadosTutorial = z.infer<typeof esquemaTutorial>;

export const esquemaCupom = z.object({
  codigo: z.string().min(1, "Código obrigatório").max(40, "Código muito longo"),
  descontoPercentual: z.number().int().min(1, "Desconto mínimo é 1%").max(100, "Desconto máximo é 100%"),
  validoAte: z.string().min(1, "Data de validade obrigatória"),
});

export const esquemaValidarCupom = z.object({
  codigo: z.string().min(1, "Código obrigatório"),
});

export const esquemaAnuncio = z.object({
  titulo: z.string().min(1, "Título obrigatório").max(120, "Título muito longo"),
  imagemUrl: z.string().min(1, "Imagem obrigatória"),
  linkUrl: z.string().max(500).optional().nullable(),
  corFundo: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().optional(),
});

export const esquemaReordenarAnuncios = z.object({
  ids: z.array(z.string().min(1)).min(1, "Lista de banners inválida"),
});

export const esquemaAtualizarAnuncio = z.object({
  id: z.string().min(1, "ID obrigatório"),
  titulo: z.string().min(1).max(120).optional(),
  imagemUrl: z.string().min(1).optional(),
  linkUrl: z.string().max(500).optional().nullable(),
  corFundo: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  ativo: z.boolean().optional(),
});

export const esquemaCategoria = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(80, "Nome muito longo"),
  slug: z.string().min(1, "Slug obrigatório").max(80).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
});

export const esquemaCriarPedido = z.object({
  itens: z.array(z.object({ tutorialId: z.string().uuid("Tutorial inválido") })).min(1, "Nenhum item no pedido."),
  cupom: z.string().max(40).optional().nullable(),
});

export const esquemaAtualizarPedido = z.object({
  pedidoId: z.string().min(1, "Informe pedidoId."),
  status: z.enum(["PROCESSANDO", "APROVADO", "REEMBOLSADO", "RECUSADO"]),
  motivo: z.string().optional().nullable(),
});

export const esquemaProblemaPedido = z.object({
  pedidoId: z.string().min(1, "Informe o pedido."),
  descricao: z.string().min(3, "Descreva o problema com mais detalhes.").max(2000, "Descrição muito longa"),
  fotos: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
});

export const esquemaAvisoTopo = z.object({
  titulo: z.string().min(1, "Informe título e mensagem.").max(120),
  mensagem: z.string().min(1, "Informe título e mensagem.").max(500),
  linkTexto: z.string().max(40).optional().nullable(),
  linkUrl: z.string().max(500).optional().nullable(),
  corFundo: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  corTexto: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  inicioEm: z.string().min(1, "Data de início obrigatória"),
  fimEm: z.string().min(1, "Data de fim obrigatória"),
  ativo: z.boolean().optional(),
});

export const esquemaDesativarAviso = z.object({
  id: z.string().min(1, "ID não informado."),
});

export const esquemaAdminChat = z.object({
  conversaId: z.string().min(1, "Conversa não informada."),
  acao: z.enum(["responder", "iniciar", "transferir", "encerrar", "reabrir"]).optional(),
  texto: z.string().max(5000).optional().nullable(),
  anexos: z.array(z.object({
    tipo: z.enum(["IMAGEM", "VIDEO"]),
    url: z.string().url(),
  })).optional(),
});

export const esquemaAdminUsuario = z.object({
  id: z.string().min(1, "ID obrigatório."),
  contaPausada: z.boolean().optional(),
  emailVerificado: z.boolean().optional(),
  papel: z.enum(["CLIENTE", "ADMINISTRADOR"]).optional(),
});

export const esquemaChatAvaliar = z.object({
  acao: z.literal("avaliar"),
  conversaId: z.string().min(1, "Conversa inválida."),
  nota: z.number().int().min(1, "Nota mínima é 1").max(5, "Nota máxima é 5"),
  texto: z.string().max(2000).optional().nullable(),
});

export const esquemaChatMensagem = z.object({
  acao: z.literal("mensagem").optional(),
  texto: z.string().max(5000).optional().nullable(),
  anexos: z.array(z.object({
    tipo: z.enum(["IMAGEM", "VIDEO"]),
    url: z.string().url(),
  })).optional(),
});

export const esquemaWebhookPagamento = z.object({
  action: z.string().optional(),
  type: z.string().optional(),
  data: z.object({
    id: z.union([z.string(), z.number()]).optional(),
  }).optional(),
});

export type DadosCupom = z.infer<typeof esquemaCupom>;
export type DadosValidarCupom = z.infer<typeof esquemaValidarCupom>;
export type DadosAnuncio = z.infer<typeof esquemaAnuncio>;
export type DadosReordenarAnuncios = z.infer<typeof esquemaReordenarAnuncios>;
export type DadosAtualizarAnuncio = z.infer<typeof esquemaAtualizarAnuncio>;
export type DadosCategoria = z.infer<typeof esquemaCategoria>;
export type DadosCriarPedido = z.infer<typeof esquemaCriarPedido>;
export type DadosAtualizarPedido = z.infer<typeof esquemaAtualizarPedido>;
export type DadosProblemaPedido = z.infer<typeof esquemaProblemaPedido>;
export type DadosAvisoTopo = z.infer<typeof esquemaAvisoTopo>;
export type DadosDesativarAviso = z.infer<typeof esquemaDesativarAviso>;
export type DadosAdminChat = z.infer<typeof esquemaAdminChat>;
export type DadosAdminUsuario = z.infer<typeof esquemaAdminUsuario>;
export type DadosChatAvaliar = z.infer<typeof esquemaChatAvaliar>;
export type DadosChatMensagem = z.infer<typeof esquemaChatMensagem>;
export type DadosWebhookPagamento = z.infer<typeof esquemaWebhookPagamento>;
