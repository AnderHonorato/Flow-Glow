import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { sucesso: false, erro: "Token de verificação não informado." },
        { status: 400 }
      );
    }

    // Busca o usuário pelo token de verificação de e-mail.
    const usuario = await prisma.usuario.findFirst({
      where: { tokenVerificacaoEmail: token },
    });

    if (!usuario) {
      return NextResponse.json(
        { sucesso: false, erro: "Token inválido ou já utilizado." },
        { status: 400 }
      );
    }

    // Marca o e-mail como verificado e limpa o token.
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        emailVerificado: true,
        tokenVerificacaoEmail: null,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "E-mail verificado com sucesso! Sua conta está ativa.",
    });
  } catch (erro) {
    console.error("Erro na verificação de e-mail:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao verificar e-mail." },
      { status: 500 }
    );
  }
}
