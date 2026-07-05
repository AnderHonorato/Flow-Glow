import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });

    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nomeCompleto: true, email: true, cpf: true, papel: true, emailVerificado: true, contaPausada: true, criadoEm: true },
      orderBy: { criadoEm: "desc" },
    });
    return NextResponse.json({ sucesso: true, dados: usuarios });
  } catch { return NextResponse.json({ sucesso: false, erro: "Erro interno." }, { status: 500 }); }
}

export async function PUT(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });

    const { id, contaPausada } = await request.json();
    await prisma.usuario.update({ where: { id }, data: { contaPausada } });
    return NextResponse.json({ sucesso: true });
  } catch { return NextResponse.json({ sucesso: false, erro: "Erro interno." }, { status: 500 }); }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ sucesso: false, erro: "ID obrigatório." }, { status: 400 });

    await prisma.usuario.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch { return NextResponse.json({ sucesso: false, erro: "Erro ao excluir." }, { status: 500 }); }
}
