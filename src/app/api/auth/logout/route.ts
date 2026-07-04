import { NextRequest, NextResponse } from "next/server";
import { removerCookieRefreshToken } from "@/lib/jwt";
import type { RespostaApi } from "@/tipos";

export async function POST(_request: NextRequest): Promise<NextResponse<RespostaApi>> {
  await removerCookieRefreshToken();
  return NextResponse.json({ sucesso: true, mensagem: "Sessão encerrada." });
}
