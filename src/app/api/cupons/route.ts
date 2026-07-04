import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(): Promise<NextResponse<RespostaApi>> {
  try {
    const cupons = await prisma.cupom.findMany({
      where: { ativo: true, validoAte: { gt: new Date() } },
      orderBy: { criadoEm: "desc" },
    });
    return NextResponse.json({ sucesso: true, dados: cupons });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao buscar cupons." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }
    const { codigo, descontoPercentual, validoAte } = await request.json();
    if (!codigo || !descontoPercentual || !validoAte) {
      return NextResponse.json({ sucesso: false, erro: "Dados incompletos." }, { status: 400 });
    }
    const cupom = await prisma.cupom.create({
      data: {
        codigo: codigo.toUpperCase().trim(),
        descontoPercentual: Math.min(100, Math.max(1, Number(descontoPercentual))),
        validoAte: new Date(validoAte),
      },
    });
    return NextResponse.json({ sucesso: true, dados: cupom }, { status: 201 });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Código já existe ou erro interno." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }
    const { id } = await request.json();
    await prisma.cupom.update({ where: { id }, data: { ativo: false } });
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao desativar cupom." }, { status: 500 });
  }
}
