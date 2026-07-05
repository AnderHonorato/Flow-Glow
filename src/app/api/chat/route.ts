import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

// Envia uma mensagem (cliente para admin).
export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const { texto } = await request.json();
    if (!texto || !String(texto).trim()) {
      return NextResponse.json(
        { sucesso: false, erro: "Mensagem vazia." },
        { status: 400 }
      );
    }

    // Busca ou cria uma conversa para este usuário.
    let conversa = await prisma.conversa.findFirst({
      where: { usuarioId },
    });

    if (!conversa) {
      conversa = await prisma.conversa.create({
        data: { usuarioId },
      });
    }

    const mensagem = await prisma.mensagem.create({
      data: {
        texto: String(texto).trim(),
        conversaId: conversa.id,
        remetenteId: usuarioId,
      },
      include: {
        remetente: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, papel: true } },
      },
    });

    return NextResponse.json({ sucesso: true, dados: mensagem }, { status: 201 });
  } catch (erro) {
    console.error("Erro ao enviar mensagem:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao enviar mensagem." },
      { status: 500 }
    );
  }
}

// Lista as mensagens de uma conversa.
export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    const usuarioPapel = request.headers.get("x-usuario-papel");

    if (!usuarioId && usuarioPapel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const conversaId = searchParams.get("conversaId");

    // Admin vê todas as conversas, usuário vê só a sua.
    let onde: Record<string, unknown> = {};
    if (usuarioPapel === "ADMINISTRADOR") {
      if (conversaId) onde = { id: conversaId };
    } else {
      onde = { usuarioId };
    }

    const conversas = await prisma.conversa.findMany({
      where: onde as never,
      include: {
        usuario: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true } },
        mensagens: {
          include: {
            remetente: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, papel: true } },
          },
          orderBy: { criadoEm: "asc" },
        },
      },
    });

    return NextResponse.json({ sucesso: true, dados: conversas });
  } catch (erro) {
    console.error("Erro ao buscar conversas:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao carregar conversas." },
      { status: 500 }
    );
  }
}
