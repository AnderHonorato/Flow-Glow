import { NextRequest, NextResponse } from "next/server";
import {
  verificarRefreshToken,
  gerarAccessToken,
  obterRefreshTokenDoCookie,
  definirCookieRefreshToken,
  gerarRefreshToken,
  removerCookieRefreshToken,
} from "@/lib/jwt";
import type { RespostaApi } from "@/tipos";

// Renova o access token usando o refresh token armazenado no cookie httpOnly.
// O refresh token também é rotacionado — o anterior é invalidado e um novo é gerado.
export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const refreshToken = await obterRefreshTokenDoCookie();

    if (!refreshToken) {
      return NextResponse.json(
        { sucesso: false, erro: "Token de atualização não encontrado." },
        { status: 401 }
      );
    }

    const payload = verificarRefreshToken(refreshToken);

    const novoAccessToken = gerarAccessToken({
      usuarioId: payload.usuarioId,
      email: payload.email,
      papel: payload.papel,
    });

    // Rotaciona o refresh token — gera um novo e substitui o anterior.
    const novoRefreshToken = gerarRefreshToken({
      usuarioId: payload.usuarioId,
      email: payload.email,
      papel: payload.papel,
    });
    await definirCookieRefreshToken(novoRefreshToken);

    return NextResponse.json({
      sucesso: true,
      dados: { accessToken: novoAccessToken },
    });
  } catch (erro) {
    // Se o refresh token for inválido ou expirado, remove o cookie.
    await removerCookieRefreshToken();
    console.error("Erro ao renovar token:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Sessão expirada. Faça login novamente." },
      { status: 401 }
    );
  }
}
