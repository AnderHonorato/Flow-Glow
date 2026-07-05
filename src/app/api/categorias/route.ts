import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(): Promise<NextResponse<RespostaApi>> {
  const cats = await prisma.categoria.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json({ sucesso: true, dados: cats });
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  const papel = request.headers.get("x-usuario-papel");
  if (papel !== "ADMINISTRADOR") return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });

  const { nome, slug } = await request.json();
  if (!nome || !slug) return NextResponse.json({ sucesso: false, erro: "Nome e slug obrigatórios." }, { status: 400 });

  const cat = await prisma.categoria.create({ data: { nome, slug } });
  return NextResponse.json({ sucesso: true, dados: cat }, { status: 201 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  const papel = request.headers.get("x-usuario-papel");
  if (papel !== "ADMINISTRADOR") return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ sucesso: false, erro: "ID não informado." }, { status: 400 });

  await prisma.categoria.delete({ where: { id } });
  return NextResponse.json({ sucesso: true });
}
