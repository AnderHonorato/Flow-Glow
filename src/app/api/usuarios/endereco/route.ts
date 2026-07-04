import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { esquemaEndereco } from "@/lib/validacao";
import type { RespostaApi } from "@/tipos";

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const endereco = await prisma.endereco.findUnique({
      where: { usuarioId },
    });

    return NextResponse.json({ sucesso: true, dados: endereco });
  } catch (erro) {
    console.error("Erro ao buscar endereço:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno." },
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

    const corpo = await request.json();
    const validacao = esquemaEndereco.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        { sucesso: false, erro: validacao.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const endereco = await prisma.endereco.upsert({
      where: { usuarioId },
      update: validacao.data,
      create: { ...validacao.data, usuarioId },
    });

    return NextResponse.json({ sucesso: true, dados: endereco });
  } catch (erro) {
    console.error("Erro ao salvar endereço:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao salvar endereço." },
      { status: 500 }
    );
  }
}
