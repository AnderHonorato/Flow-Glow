import { NextRequest, NextResponse } from "next/server";
import { removerCookieRefreshToken, removerCookieAccessToken } from "@/lib/jwt";
import type { RespostaApi } from "@/tipos";

export async function POST(_request: NextRequest): Promise<NextResponse<RespostaApi>> {
  await removerCookieRefreshToken();
  await removerCookieAccessToken();
  return NextResponse.json({ sucesso: true, mensagem: "Sessão encerrada." });
}
