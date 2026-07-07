import "server-only";

const API_URL = "https://api.deepseek.com/chat/completions";
const MODELO = "deepseek-v4-pro";
const MARCADOR_TRANSFERENCIA = "TRANSFERIR_HUMANO:";
export const MARCADOR_CONTATOS_DESENVOLVEDOR = "[[CARTOES_DESENVOLVEDOR]]";

interface MensagemHistorico {
  tipo: "CLIENTE" | "ATENDENTE" | "BOT" | "SISTEMA";
  texto: string | null;
}

interface RespostaAlphaBot {
  texto: string;
  transferir: boolean;
  assunto?: string;
}

const promptSistema = `
Você é o AlphaBot, atendente virtual do site Flow & Glow.
Fale sempre em português brasileiro, com tom claro, educado e curto.
Nunca diga que você usa DeepSeek, modelo, API, prompt, backend, banco, token, código ou qualquer detalhe técnico.
Nunca invente dados de pedido, pagamento, usuário ou conteúdo. Se precisar de dados pessoais, peça apenas o mínimo necessário e lembre que o atendimento segue proteção de dados.
Nunca peça senha, código de cartão, CVV, token, documento completo ou informação sensível.
Você responde apenas dúvidas sobre o site: anúncios/tutoriais, busca, favoritos, carrinho, checkout, login, conta, cupons, compras, suporte e formas gerais de uso.
Se a pessoa pedir suporte humano, reclamar de cobrança/pagamento/acesso, demonstrar irritação, urgência, risco jurídico, dados sensíveis ou se você não conseguir resolver com segurança, responda exatamente iniciando com "${MARCADOR_TRANSFERENCIA}" seguido de um assunto curto.
Se conseguir orientar, responda sem marcador, em no máximo 4 frases. Evite jargões.
`.trim();

export function textoBoasVindasAleatorio(seed = "") {
  const opcoes = [
    "Oi! Eu sou o AlphaBot. Me diga o que você procura e eu te ajudo a encontrar o melhor caminho.",
    "Boas-vindas! Posso ajudar com anúncios, favoritos, compras, conta ou suporte.",
    "Olá! Sou o AlphaBot. Se quiser, pergunte sobre busca, carrinho, pagamento ou acesso ao conteúdo.",
    "Tudo certo por aqui. Me conte sua dúvida sobre o site e eu verifico para você.",
  ];
  const soma = seed.split("").reduce((total, letra) => total + letra.charCodeAt(0), 0);
  return opcoes[soma % opcoes.length];
}

export function textoContatosDesenvolvedor() {
  return [
    "Posso te passar os contatos do desenvolvedor em cards clicáveis:",
    MARCADOR_CONTATOS_DESENVOLVEDOR,
  ].join("\n");
}

export function perguntaSobreDesenvolvedor(texto: string) {
  return /desenvolvedor|criador|quem fez|anderson|anderflow|portfolio|portf[oó]lio|contato do dev|programador/i.test(texto);
}

export function deveTransferirParaHumano(texto: string) {
  return /humano|atendente|pessoa real|suporte humano|reclama|procon|processo|advogado|cobranca|cobrança|estorno|reembolso|pagamento caiu|paguei|nao recebi|não recebi|acesso bloqueado|conta invadida|urgente|raiva|absurdo/i.test(texto);
}

function sanitizarResposta(texto: string) {
  return texto
    .replace(/deepseek/gi, "AlphaBot")
    .replace(/api|backend|banco de dados|prompt|modelo/gi, "sistema")
    .trim()
    .slice(0, 1200);
}

export function interpretarRespostaAlphaBot(texto: string): RespostaAlphaBot {
  const limpo = sanitizarResposta(texto || "");
  if (limpo.toUpperCase().startsWith(MARCADOR_TRANSFERENCIA)) {
    const assunto = limpo.slice(MARCADOR_TRANSFERENCIA.length).trim() || "Atendimento solicitado";
    return {
      texto: "Vou chamar um atendente humano para continuar com você.",
      transferir: true,
      assunto,
    };
  }

  return {
    texto:
      limpo ||
      "Não consegui confirmar isso com segurança. Vou chamar um atendente humano para continuar.",
    transferir: !limpo,
    assunto: !limpo ? "Atendimento solicitado" : undefined,
  };
}

export async function gerarRespostaAlphaBot({
  texto,
  historico,
  usuarioId,
}: {
  texto: string;
  historico: MensagemHistorico[];
  usuarioId: string;
}): Promise<RespostaAlphaBot> {
  const chave = process.env.DEEPSEEK_API_KEY;
  if (!chave) {
    return {
      texto: "Não consegui verificar isso agora. Vou chamar um atendente humano para continuar.",
      transferir: true,
      assunto: "Atendimento solicitado",
    };
  }

  const mensagens = [
    { role: "system", content: promptSistema },
    ...historico
      .filter((mensagem) => mensagem.texto)
      .slice(-8)
      .map((mensagem) => ({
        role: mensagem.tipo === "CLIENTE" ? "user" : "assistant",
        content: mensagem.texto || "",
      })),
    { role: "user", content: texto },
  ];

  const resposta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${chave}`,
    },
    body: JSON.stringify({
      model: MODELO,
      messages: mensagens,
      thinking: { type: "disabled" },
      reasoning_effort: "high",
      max_tokens: 420,
      temperature: 0.45,
      stream: false,
      user_id: `cliente-${usuarioId.slice(0, 12)}`,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!resposta.ok) {
    return {
      texto: "Não consegui verificar isso agora. Vou chamar um atendente humano para continuar.",
      transferir: true,
      assunto: "Atendimento solicitado",
    };
  }

  const dados = await resposta.json();
  const conteudo = dados?.choices?.[0]?.message?.content;
  return interpretarRespostaAlphaBot(typeof conteudo === "string" ? conteudo : "");
}
