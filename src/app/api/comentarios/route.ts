import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { esquemaComentario } from "@/lib/validacao";
import type { RespostaApi } from "@/tipos";

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const corpo = await request.json();
    const validacao = esquemaComentario.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        { sucesso: false, erro: validacao.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const { nota, texto, tutorialId } = corpo;

    // Verifica se o tutorial existe e está ativo.
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: tutorialId, ativo: true },
    });

    if (!tutorial) {
      return NextResponse.json(
        { sucesso: false, erro: "Tutorial não encontrado." },
        { status: 404 }
      );
    }

    // Cria o comentário (o @@unique no modelo impede duplicata de usuário+tutorial).
    const comentario = await prisma.comentario.create({
      data: {
        nota,
        texto,
        usuarioId,
        tutorialId,
      },
    });

    return NextResponse.json({ sucesso: true, dados: comentario }, { status: 201 });
  } catch (erro: unknown) {
    // Se for erro de chave única (usuário já comentou), retorna mensagem amigável.
    const erroPrisma = erro as { code?: string };
    if (erroPrisma.code === "P2002") {
      return NextResponse.json(
        { sucesso: false, erro: "Você já avaliou este tutorial. Edite sua avaliação anterior." },
        { status: 409 }
      );
    }

    console.error("Erro ao criar comentário:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao salvar comentário." },
      { status: 500 }
    );
  }
}
