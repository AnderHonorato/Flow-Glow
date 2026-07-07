import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { esquemaRecuperarSenha } from "@/lib/validacao";
import { verificarRateLimit, cabecalhoRetryAfter } from "@/lib/rate-limit";
import { ProvedorDeEmailPlaceholder } from "@/lib/email";
import type { RespostaApi } from "@/tipos";

const provedorEmail = new ProvedorDeEmailPlaceholder();

const RATE_LIMIT_RECUPERACAO = 5;
const RATE_LIMIT_JANELA_MS = 60_000;

// Gera o token, salva apenas o hash no banco com expiração de 1 hora
// — nunca guardamos o token em texto puro.

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const rate = verificarRateLimit(request, RATE_LIMIT_RECUPERACAO, RATE_LIMIT_JANELA_MS, "recuperar-senha");
    if (rate.bloqueado) {
      return NextResponse.json(
        { sucesso: false, erro: "Muitas solicitações. Aguarde um minuto e tente novamente." },
        { status: 429, headers: { "Retry-After": cabecalhoRetryAfter(rate.resetEmMs) } }
      );
    }

    const corpo = await request.json();
    const validacao = esquemaRecuperarSenha.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: validacao.error.issues[0]?.message || "E-mail inválido",
        },
        { status: 400 }
      );
    }

    const { email } = validacao.data;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Por segurança, sempre retornamos sucesso mesmo que o e-mail não exista
    // — assim não confirmamos se um e-mail está ou não cadastrado.
    if (!usuario) {
      return NextResponse.json({
        sucesso: true,
        mensagem:
          "Se este e-mail estiver cadastrado, você receberá um link de recuperação.",
      });
    }

    // Gera token aleatório seguro, guarda apenas o hash e a expiração.
    const tokenRecuperacao = crypto.randomBytes(32).toString("hex");
    const tokenRecuperacaoHash = await bcrypt.hash(tokenRecuperacao, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenRecuperacaoHash,
        tokenRecuperacaoExpiraEm: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      },
    });

    // Envia o e-mail com o token em texto puro (ele existe só no e-mail).
    await provedorEmail.enviarRecuperacaoSenha({
      para: usuario.email,
      nome: usuario.nomeCompleto,
      token: tokenRecuperacao,
    });

    return NextResponse.json({
      sucesso: true,
      mensagem:
        "Se este e-mail estiver cadastrado, você receberá um link de recuperação.",
    });
  } catch (erro) {
    console.error("Erro na recuperação de senha:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao processar recuperação." },
      { status: 500 }
    );
  }
}
