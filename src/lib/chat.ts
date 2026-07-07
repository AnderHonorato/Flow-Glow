import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { textoBoasVindasAleatorio } from "@/lib/alphabot";
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
  return `Ola! Sou o AlphaBot. Protocolo ${protocolo}. Envie sua mensagem e eu tento resolver por aqui.`;
}

export function textoBoasVindas(seed = "") {
  return textoBoasVindasAleatorio(seed);
}

export const baseConhecimento = [
  { padrao: /pedido|compra|rastreio|status do pedido|meu pedido|onde esta|onde ta|entregar|frete|prazo/i, resposta: "Voce pode acompanhar seus pedidos na pagina **Meus Tutoriais** dentro do seu perfil. La voce encontra status, data prevista e link de acesso ao conteudo." },
  { padrao: /cancelar|cancelamento|reembolso|devolver|devolucao|arrepend/i, resposta: "Cancelamentos podem ser solicitados em ate **7 dias** apos a compra, desde que o conteudo nao tenha sido acessado. Va em **Meus Tutoriais** e clique em 'Cancelar' no pedido desejado." },
  { padrao: /pagamento|pagar|pix|boleto|cartao|cart.o|credito|debito|valor|preco|pre.o|quanto custa|custa quanto/i, resposta: "Aceitamos **Pix, cartao de credito e debito**. O pagamento via Pix tem confirmacao instantanea. Cartoes podem parcelar em ate **3x**. Se o pagamento nao foi confirmado, verifique no seu banco ou tente novamente." },
  { padrao: /acesso|nao consigo acessar|login|senha|entrar|esqueci|recuperar|redefinir|conta bloqueada|bloqueio|nao entra|erro ao entrar/i, resposta: "Problemas de acesso? Verifique se o e-mail e senha estao corretos. Se esqueceu a senha, va em **Esqueci minha senha** na pagina de login. Se sua conta esta bloqueada, entre em contato pelo WhatsApp." },
  { padrao: /whatsapp|telefone|contato|falar com alguem|humano|atendente|pessoa|suporte/i, resposta: "Nosso WhatsApp e **(11) 99999-9999**. Se preferir, posso te transferir para um atendente humano agora mesmo." },
  { padrao: /tutoriais|anuncio|curso|video|aula|conteudo|aprender|maquiagem|make|cabelo|pele|skincare|unha|beleza|autoestima|glow/i, resposta: "Temos diversos tutoriais de beleza na nossa **Vitrine**. Voce pode filtrar por categoria (maquiagem, cabelo, pele, unhas), buscar por cidade ou por preco. Acesse **Anuncios** no menu superior!" },
  { padrao: /cupom|desconto|promo.o|promocional|oferta|black friday|liquida|queima|imperdivel/i, resposta: "Fique de olho na secao **Promocoes**! Sempre tem ofertas com precos especiais. Ative a opcao 'Promocoes e descontos' nos filtros da vitrine para ver apenas anuncios com desconto." },
  { padrao: /cadastro|criar conta|cadastrar|registrar|nova conta|inscrever/i, resposta: "Para criar sua conta, va em **Criar conta** na pagina de login. Voce precisa de e-mail, CPF valido e uma senha segura. O cadastro e gratuito e rapido!" },
  { padrao: /cidade|localizacao|regiao|bairro|perto|proximo|cep|endere.o|onde fica/i, resposta: "Voce pode buscar tutoriais pela sua cidade! Clique no icone de localizacao no topo do site para definir seu CEP ou usar GPS. Assim voce ve anuncios perto de voce." },
  { padrao: /avaliar|avaliacao|nota|estrela|feedback|review|comentar|depoimento/i, resposta: "Apos concluir um tutorial, voce pode deixar uma avaliacao com nota e comentario. Isso ajuda outros compradores e os instrutores. Va em **Meus Tutoriais** e clique em 'Avaliar'." },
  { padrao: /seguro|confiavel|garantia|confiar|confian.a|prote.o|privacidade|dados/i, resposta: "A Flow & Glow protege seus dados com criptografia. Todas as transacoes sao seguras e voce tem garantia de **7 dias** para cancelamento. Veja nossos **Termos de uso** no rodape do site." },
  { padrao: /carrinho|adicionar|comprar|finalizar|checkout|sacola/i, resposta: "Para comprar, basta clicar no botao **Comprar** nos cards de anuncio. O item vai para o carrinho. Depois e so finalizar em **Carrinho** no menu superior. Simples assim!" },
  { padrao: /parcelamento|parcela|parcelar|dividir/i, resposta: "Compras no cartao de credito podem ser parceladas em ate **3x sem juros**! O valor minimo da parcela e de R$ 20,00. Pix tem 5% de desconto em algumas promocoes." },
  { padrao: /perfil|meus dados|alterar|editar|atualizar cadastro|foto/i, resposta: "Voce pode editar seu perfil a qualquer momento em **Perfil** no menu superior. La voce atualiza foto, endereco, telefone e outras informacoes pessoais." },
  { padrao: /bot|voce . quem|quem e voce|robo|ia|inteligencia/i, resposta: "Sou o **AlphaBot**, assistente virtual da Flow & Glow! Estou aqui para tirar duvidas sobre anuncios, pedidos, pagamentos e muito mais. Se eu nao souber algo, chamo um atendente humano." },
  { padrao: /oi|ola|hey|eae|bom dia|boa tarde|boa noite|tudo bem|como vai/i, resposta: "Ola! Tudo bem por aqui :) Como posso te ajudar hoje? Pode perguntar sobre pedidos, pagamentos, tutoriais ou qualquer duvida!" },
  { padrao: /obrigad|valeu|brigad|thanks|agrade.o|gratidao|show|legal|otimo/i, resposta: "Por nada! Fico feliz em ajudar. Se precisar de mais alguma coisa, e so chamar!" },
] as const;

export function buscarRespostaConhecimento(texto: string): string | null {
  for (const item of baseConhecimento) {
    if (item.padrao.test(texto)) {
      return item.resposta;
    }
  }
  return null;
}

export function textoPerguntaEspecialista() {
  return "Deseja ser encaminhado para um especialista humano?";
}

export function textoProtocoloAberto(protocolo: string) {
  return `Protocolo **${protocolo}** aberto! Aguarde um momento que logo alguem vai te atender.`;
}

export function textoAjudaAposResposta() {
  return "Isso te ajudou ou ainda precisa de ajuda?";
}

export function pareceConfirmacao(texto: string) {
  return /^(sim|quero|pode|ok|yes|claro|positivo|encaminha|iniciar|comecar|bora|vamos|beleza|certo)\b/i.test(texto.trim());
}

export function pareceNegacao(texto: string) {
  return /^(nao|n.o|na|nop|negativo|ja ajudou|resolvido|deu certo|ajudou sim|tudo certo|perfeito|obrigad)\b/i.test(texto.trim());
}

export function nomeRemetenteVirtual(tipo: string) {
  return tipo === "SISTEMA" ? "Sistema MCA" : "AlphaBot";
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
          texto: textoBoasVindas(protocolo),
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
