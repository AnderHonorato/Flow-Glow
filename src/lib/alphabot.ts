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
Voce e o AlphaBot, versao do Metrys IA do Anderson Honorato, atendente virtual do site MCA Flow & Glow.
Fale sempre em portugues brasileiro, com tom claro, educado e curto.
Nunca diga que voce usa DeepSeek, modelo, API, prompt, backend, banco, token, codigo ou qualquer detalhe tecnico.
Nunca invente dados de pedido, pagamento, usuario ou conteudo. Se precisar de dados pessoais, peca apenas o minimo necessario e lembre que o atendimento segue protecao de dados.
Nunca peça senha, codigo de cartao, CVV, token, documento completo ou informacao sensivel.
Voce responde apenas duvidas sobre o site: anuncios/tutoriais, busca, favoritos, carrinho, checkout, login, conta, cupons, compras, suporte e formas gerais de uso.
Se a pessoa pedir suporte humano, reclamar de cobranca/pagamento/acesso, demonstrar irritacao, urgencia, risco juridico, dados sensiveis ou se voce nao conseguir resolver com seguranca, responda exatamente iniciando com "${MARCADOR_TRANSFERENCIA}" seguido de um assunto curto.
Se conseguir orientar, responda sem marcador, em no maximo 4 frases. Evite jargoes.
`.trim();

export function textoBoasVindasAleatorio(seed = "") {
  const opcoes = [
    "Oi! Eu sou o AlphaBot. Me diga o que voce procura e eu te ajudo a encontrar o melhor caminho.",
    "Boas-vindas! Posso ajudar com anuncios, favoritos, compras, conta ou suporte.",
    "Ola! Sou o AlphaBot. Se quiser, pergunte sobre busca, carrinho, pagamento ou acesso ao conteudo.",
    "Tudo certo por aqui. Me conte sua duvida sobre o site e eu verifico para voce.",
  ];
  const soma = seed.split("").reduce((total, letra) => total + letra.charCodeAt(0), 0);
  return opcoes[soma % opcoes.length];
}

export function textoContatosDesenvolvedor() {
  return [
    "Posso te passar os contatos do desenvolvedor em cards clicaveis:",
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
      texto: "Vou chamar um atendente humano para continuar com voce.",
      transferir: true,
      assunto,
    };
  }

  return {
    texto:
      limpo ||
      "Nao consegui confirmar isso com seguranca. Vou chamar um atendente humano para continuar.",
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
      texto: "Nao consegui verificar isso agora. Vou chamar um atendente humano para continuar.",
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
  });

  if (!resposta.ok) {
    return {
      texto: "Nao consegui verificar isso agora. Vou chamar um atendente humano para continuar.",
      transferir: true,
      assunto: "Atendimento solicitado",
    };
  }

  const dados = await resposta.json();
  const conteudo = dados?.choices?.[0]?.message?.content;
  return interpretarRespostaAlphaBot(typeof conteudo === "string" ? conteudo : "");
}
