import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const opcoesAtendimento = [
  {
    id: "pedido",
    rotulo: "Pedido ou compra",
    resposta:
      "Entendi. Separe numero do pedido, e-mail da conta e o que aconteceu. Ja chamei um atendente para continuar por aqui.",
  },
  {
    id: "pagamento",
    rotulo: "Pagamento",
    resposta:
      "Vamos olhar pagamento. Envie forma de pagamento, horario aproximado e comprovante se tiver. Ja chamei um atendente.",
  },
  {
    id: "acesso",
    rotulo: "Acesso a conta",
    resposta:
      "Certo. Conte se o problema e login, senha, e-mail ou acesso ao conteudo. Ja chamei um atendente.",
  },
  {
    id: "outro",
    rotulo: "Outro assunto",
    resposta:
      "Sem problema. Ja chamei um atendente para entender melhor e seguir com voce.",
  },
] as const;

export const includeConversaChat = {
  usuario: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, email: true } },
  atendente: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, email: true } },
  mensagens: {
    include: {
      remetente: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, papel: true } },
      anexos: true,
    },
    orderBy: { criadoEm: "asc" as const },
  },
};

type ConversaChatPayload = Prisma.ConversaGetPayload<{
  include: typeof includeConversaChat;
}>;

type MensagemChatPayload = ConversaChatPayload["mensagens"][number];

const MINUTO = 60 * 1000;
const TEMPO_AVISO_INATIVIDADE = 3 * MINUTO;
const TEMPO_ENCERRAMENTO_INATIVIDADE = 5 * MINUTO;

export function textoIntroBot(protocolo: string) {
  return `Ola! Sou o Bot MCA. Protocolo ${protocolo}. Para agilizar, escolha uma opcao rapida abaixo ou envie sua mensagem.`;
}

export function nomeRemetenteVirtual(tipo: string) {
  return tipo === "SISTEMA" ? "Sistema MCA" : "Bot MCA";
}

async function gerarProtocoloUnico() {
  const hoje = new Date();
  const data = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("");

  for (let tentativa = 0; tentativa < 8; tentativa++) {
    const codigo = crypto.randomBytes(3).toString("hex").toUpperCase();
    const protocolo = `MCA-${data}-${codigo}`;
    const existente = await prisma.conversa.findUnique({ where: { protocolo }, select: { id: true } });
    if (!existente) return protocolo;
  }

  return `MCA-${data}-${crypto.randomUUID()}`;
}

export async function criarMensagemChat({
  conversaId,
  texto,
  tipo,
  remetenteId,
  anexos,
}: {
  conversaId: string;
  texto: string;
  tipo: "CLIENTE" | "ATENDENTE" | "BOT" | "SISTEMA";
  remetenteId?: string;
  anexos?: { tipo: "IMAGEM" | "VIDEO"; url: string }[];
}) {
  return prisma.mensagem.create({
    data: {
      texto,
      tipo,
      conversaId,
      remetenteId: remetenteId || null,
      anexos: anexos?.length ? { create: anexos } : undefined,
    },
    include: {
      remetente: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, papel: true } },
      anexos: true,
    },
  });
}

export async function criarConversaAtendimento(usuarioId: string) {
  const protocolo = await gerarProtocoloUnico();
  const agora = new Date();
  return prisma.conversa.create({
    data: {
      usuarioId,
      protocolo,
      status: "TRIAGEM",
      clienteAguardandoDesde: agora,
      ultimaInteracaoClienteEm: agora,
      mensagens: {
        create: {
          tipo: "BOT",
          texto: textoIntroBot(protocolo),
        },
      },
    },
    include: includeConversaChat,
  });
}

export async function buscarConversaAtivaDoCliente(usuarioId: string) {
  return prisma.conversa.findFirst({
    where: {
      usuarioId,
      status: { not: "ENCERRADA" },
    },
    include: includeConversaChat,
    orderBy: { atualizadoEm: "desc" },
  });
}

export async function buscarOuCriarConversaAtiva(usuarioId: string) {
  const conversa = await buscarConversaAtivaDoCliente(usuarioId);
  return conversa || criarConversaAtendimento(usuarioId);
}

async function calcularFila(conversa: {
  status: string;
  criadoEm: Date;
  clienteAguardandoDesde: Date | null;
}) {
  if (conversa.status !== "AGUARDANDO_ATENDENTE") {
    return { posicaoFila: 0, tempoFilaMinutos: 0 };
  }

  const desde = conversa.clienteAguardandoDesde || conversa.criadoEm;
  const posicaoFila = await prisma.conversa.count({
    where: {
      status: "AGUARDANDO_ATENDENTE",
      clienteAguardandoDesde: { lte: desde },
    },
  });

  return {
    posicaoFila: Math.max(1, posicaoFila),
    tempoFilaMinutos: Math.max(4, posicaoFila * 4 + 2),
  };
}

function serializarMensagem(mensagem: MensagemChatPayload) {
  return {
    ...mensagem,
    remetente:
      mensagem.remetente ||
      {
        id: mensagem.tipo === "SISTEMA" ? "sistema" : "bot",
        nomeCompleto: nomeRemetenteVirtual(mensagem.tipo),
        fotoPerfilUrl: null,
        papel: mensagem.tipo,
      },
  };
}

export async function serializarConversa(conversa: ConversaChatPayload) {
  const fila = await calcularFila(conversa);
  return {
    ...conversa,
    ...fila,
    mensagens: conversa.mensagens.map(serializarMensagem),
  };
}

export async function serializarConversas(conversas: ConversaChatPayload[]) {
  return Promise.all(conversas.map((conversa) => serializarConversa(conversa)));
}

export async function sincronizarInatividade() {
  const agora = new Date();
  const conversas = await prisma.conversa.findMany({
    where: {
      status: "EM_ATENDIMENTO",
      ultimaInteracaoClienteEm: { not: null },
    },
    select: {
      id: true,
      protocolo: true,
      ultimaInteracaoClienteEm: true,
      avisoInatividadeEm: true,
    },
  });

  for (const conversa of conversas) {
    if (!conversa.ultimaInteracaoClienteEm) continue;
    const decorrido = agora.getTime() - conversa.ultimaInteracaoClienteEm.getTime();

    if (decorrido >= TEMPO_ENCERRAMENTO_INATIVIDADE) {
      await prisma.conversa.update({
        where: { id: conversa.id },
        data: {
          status: "ENCERRADA",
          encerradoEm: agora,
          encerradoPor: "Inatividade do cliente",
        },
      });
      await criarMensagemChat({
        conversaId: conversa.id,
        tipo: "SISTEMA",
        texto:
          "Atendimento encerrado automaticamente por falta de interacao. Voce pode avaliar esta experiencia ou abrir um novo protocolo pelo botao +.",
      });
      continue;
    }

    if (decorrido >= TEMPO_AVISO_INATIVIDADE && !conversa.avisoInatividadeEm) {
      await prisma.conversa.update({
        where: { id: conversa.id },
        data: { avisoInatividadeEm: agora },
      });
      await criarMensagemChat({
        conversaId: conversa.id,
        tipo: "BOT",
        texto:
          "Ainda esta por ai? Se nao houver resposta em 2 minutos, este atendimento sera encerrado automaticamente.",
      });
    }
  }
}

export async function carregarConversaPorId(conversaId: string) {
  await sincronizarInatividade();
  return prisma.conversa.findUnique({
    where: { id: conversaId },
    include: includeConversaChat,
  });
}
