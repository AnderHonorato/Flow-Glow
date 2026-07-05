import { z } from "zod";

// A senha exige no mínimo 8 caracteres, ao menos 1 número e 1 letra maiúscula.
export const esquemaCadastro = z.object({
  nomeCompleto: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(200, "Nome muito longo"),
  email: z.string().email("E-mail inválido"),
  senha: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos 1 letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos 1 número"),
  confirmacaoSenha: z.string(),
  aceitouTermos: z.boolean().refine((val) => val === true, {
    message: "Você precisa aceitar os termos de uso e a política de privacidade",
  }),
}).refine((dados) => dados.senha === dados.confirmacaoSenha, {
  message: "As senhas não conferem",
  path: ["confirmacaoSenha"],
});

export const esquemaLogin = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "A senha é obrigatória"),
});

export const esquemaRecuperarSenha = z.object({
  email: z.string().email("E-mail inválido"),
});

export const esquemaNovaSenha = z.object({
  token: z.string().min(1, "Token inválido"),
  senha: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos 1 letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos 1 número"),
  confirmacaoSenha: z.string(),
}).refine((dados) => dados.senha === dados.confirmacaoSenha, {
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
  descricaoCompleta: z.string().min(50),
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
        titulo: z.string().min(2, "Informe o titulo do modulo"),
        videoUrl: z.string().optional().nullable(),
        duracaoMinutos: z.number().int().min(1).max(600),
        gratuito: z.boolean().optional(),
      })
    )
    .optional(),
});

export type DadosCadastro = z.infer<typeof esquemaCadastro>;
export type DadosLogin = z.infer<typeof esquemaLogin>;
export type DadosRecuperarSenha = z.infer<typeof esquemaRecuperarSenha>;
export type DadosNovaSenha = z.infer<typeof esquemaNovaSenha>;
export type DadosEndereco = z.infer<typeof esquemaEndereco>;
export type DadosComentario = z.infer<typeof esquemaComentario>;
export type DadosTutorial = z.infer<typeof esquemaTutorial>;
