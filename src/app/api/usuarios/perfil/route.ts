import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        papel: true,
        emailVerificado: true,
        fotoPerfilUrl: true,
        whatsapp: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { sucesso: false, erro: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: usuario });
  } catch (erro) {
    console.error("Erro ao buscar perfil:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao buscar perfil." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const { nomeCompleto, whatsapp, fotoPerfilUrl } = await request.json();

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(nomeCompleto && { nomeCompleto }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(fotoPerfilUrl !== undefined && { fotoPerfilUrl }),
      },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        papel: true,
        emailVerificado: true,
        fotoPerfilUrl: true,
        whatsapp: true,
      },
    });

    return NextResponse.json({ sucesso: true, dados: usuario });
  } catch (erro) {
    console.error("Erro ao atualizar perfil:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao atualizar perfil." },
      { status: 500 }
    );
  }
}
