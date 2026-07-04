import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioPapel = request.headers.get("x-usuario-papel");
    if (usuarioPapel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const comentarios = await prisma.comentario.findMany({
      include: {
        usuario: { select: { nomeCompleto: true } },
        tutorial: { select: { titulo: true } },
      },
      orderBy: { criadoEm: "desc" },
      take: 200,
    });

    return NextResponse.json({ sucesso: true, dados: comentarios });
  } catch (erro) {
    console.error("Erro ao listar comentários:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioPapel = request.headers.get("x-usuario-papel");
    if (usuarioPapel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ sucesso: false, erro: "ID não informado." }, { status: 400 });
    }

    await prisma.comentario.delete({ where: { id } });
    return NextResponse.json({ sucesso: true, mensagem: "Comentário removido." });
  } catch (erro) {
    console.error("Erro ao remover comentário:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro interno." }, { status: 500 });
  }
}
