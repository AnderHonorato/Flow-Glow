import { z } from "zod";

const somenteDigitos = (valor: unknown) =>
  typeof valor === "string" ? valor.replace(/\D/g, "") : valor;

export const senhaForte = z
  .string()
  .min(8, "A senha deve ter no minimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos 1 letra maiuscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos 1 numero");

const dataNascimento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento invalida");

const telefoneOpcional = z.preprocess(
  somenteDigitos,
  z.string().regex(/^\d{10,11}$/, "Telefone deve ter DDD e numero").optional().or(z.literal(""))
);

const celularObrigatorio = z.preprocess(
  somenteDigitos,
  z.string().regex(/^\d{10,11}$/, "WhatsApp deve ter DDD e numero")
);

export const esquemaCadastro = z
  .object({
    nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200),
    apelido: z.string().max(80, "Apelido muito longo").optional(),
    cpf: z.preprocess(somenteDigitos, z.string().regex(/^\d{11}$/, "CPF deve ter 11 digitos")),
    email: z.string().email("E-mail invalido"),
    whatsapp: celularObrigatorio,
    telefone: telefoneOpcional,
    dataNascimento,
    genero: z.string().max(40, "Genero muito longo").optional(),
    profissao: z.string().max(80, "Profissao muito longa").optional(),
    senha: senhaForte,
    confirmacaoSenha: z.string(),
    aceitouTermos: z.boolean().refine((v) => v === true, {
      message: "Voce precisa aceitar os termos de uso",
    }),
    cep: z.preprocess(somenteDigitos, z.string().regex(/^\d{8}$/, "CEP deve ter 8 digitos")),
    logradouro: z.string().min(2, "Logradouro obrigatorio"),
    numero: z.string().min(1, "Numero obrigatorio"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro obrigatorio"),
    cidade: z.string().min(1, "Cidade obrigatoria"),
    estado: z.string().length(2, "Estado deve ter 2 letras"),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    message: "As senhas nao conferem",
    path: ["confirmacaoSenha"],
  });

export const esquemaPerfil = z
  .object({
    nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200),
    apelido: z.string().max(80, "Apelido muito longo").optional().nullable(),
    cpf: z.preprocess(
      somenteDigitos,
      z.string().regex(/^\d{11}$/, "CPF deve ter 11 digitos").optional().or(z.literal(""))
    ),
    email: z.string().email("E-mail invalido"),
    codigoConfirmacaoEmail: z.string().optional(),
    whatsapp: z.preprocess(
      somenteDigitos,
      z.string().regex(/^\d{10,11}$/, "WhatsApp deve ter DDD e numero").optional().or(z.literal(""))
    ),
    telefone: telefoneOpcional,
    dataNascimento: dataNascimento.optional().or(z.literal("")),
    genero: z.string().max(40, "Genero muito longo").optional().nullable(),
    profissao: z.string().max(80, "Profissao muito longa").optional().nullable(),
    fotoPerfilUrl: z.string().optional().nullable(),
    senhaAtual: z.string().optional(),
    novaSenha: senhaForte.optional().or(z.literal("")),
    confirmacaoNovaSenha: z.string().optional(),
  })
  .refine((dados) => {
    if (!dados.novaSenha) return true;
    return dados.novaSenha === dados.confirmacaoNovaSenha;
  }, {
    message: "As senhas nao conferem",
    path: ["confirmacaoNovaSenha"],
  });

export const esquemaLogin = z.object({
  email: z.string().email("E-mail invalido"),
  senha: z.string().min(1, "A senha e obrigatoria"),
});

export const esquemaRecuperarSenha = z.object({
  email: z.string().email("E-mail invalido"),
});

export const esquemaNovaSenha = z
  .object({
    token: z.string().min(1, "Token invalido"),
    senha: senhaForte,
    confirmacaoSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    message: "As senhas nao conferem",
    path: ["confirmacaoSenha"],
  });

export const esquemaEndereco = z.object({
  cep: z.string().length(8, "CEP deve ter 8 digitos").regex(/^\d+$/, "CEP deve conter apenas numeros"),
  logradouro: z.string().min(2, "Logradouro obrigatorio"),
  numero: z.string().min(1, "Numero obrigatorio"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro obrigatorio"),
  cidade: z.string().min(1, "Cidade obrigatoria"),
  estado: z.string().length(2, "Estado deve ter 2 letras"),
});

export const esquemaComentario = z.object({
  nota: z.number().int().min(1, "Nota minima e 1").max(5, "Nota maxima e 5"),
  texto: z.string().min(3, "O comentario deve ter pelo menos 3 caracteres").max(2000, "Comentario muito longo"),
});

export const esquemaTutorial = z.object({
  titulo: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  descricaoCurta: z.string().min(10).max(300),
  descricaoCompleta: z.string().min(50, "Conteudo do anuncio deve ter pelo menos 50 caracteres"),
  preco: z.number().positive("Preco deve ser positivo"),
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
  categoriaId: z.string().uuid("Categoria invalida"),
  nivel: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]),
  modulos: z
    .array(
      z.object({
        titulo: z.string().min(2, "Informe o titulo do modulo"),
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
