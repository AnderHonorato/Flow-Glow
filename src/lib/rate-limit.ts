import "server-only";

interface Janela {
  requisicoes: number[];
}

const armazenamento = new Map<string, Janela>();

function obterIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "desconhecido";
}

function limparExpiradas(janela: Janela, janelaMs: number): number[] {
  const agora = Date.now();
  const validas = janela.requisicoes.filter((ts) => agora - ts < janelaMs);
  janela.requisicoes = validas;
  return validas;
}

export interface ResultadoRateLimit {
  bloqueado: boolean;
  tentativasRestantes: number;
  resetEmMs: number;
}

export function verificarRateLimit(
  request: Request,
  maximo: number,
  janelaMs: number,
  chave: string
): ResultadoRateLimit {
  const ip = obterIp(request);
  const chaveComposta = `${chave}:${ip}`;
  const agora = Date.now();

  let janela = armazenamento.get(chaveComposta);
  if (!janela) {
    janela = { requisicoes: [] };
    armazenamento.set(chaveComposta, janela);
  }

  const validas = limparExpiradas(janela, janelaMs);

  if (validas.length >= maximo) {
    const maisAntiga = validas[0];
    const resetEmMs = janelaMs - (agora - maisAntiga);
    return {
      bloqueado: true,
      tentativasRestantes: 0,
      resetEmMs: Math.max(1000, resetEmMs),
    };
  }

  validas.push(agora);
  return {
    bloqueado: false,
    tentativasRestantes: maximo - validas.length,
    resetEmMs: janelaMs,
  };
}

export function cabecalhoRetryAfter(resetEmMs: number): string {
  return String(Math.ceil(resetEmMs / 1000));
}
