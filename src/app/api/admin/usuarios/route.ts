import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioPapel = request.headers.get("x-usuario-papel");
    if (usuarioPapel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        papel: true,
        emailVerificado: true,
        criadoEm: true,
        bloqueadoAte: true,
      },
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json({ sucesso: true, dados: usuarios });
  } catch (erro) {
    console.error("Erro ao listar usuários:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno." },
      { status: 500 }
    );
  }
}
