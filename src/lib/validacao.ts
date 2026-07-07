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
