import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(): Promise<NextResponse<RespostaApi>> {
  try {
    const anuncios = await prisma.anuncio.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    });
    return NextResponse.json({ sucesso: true, dados: anuncios });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao buscar anúncios." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }
    const { titulo, imagemUrl, linkUrl } = await request.json();
    const maxOrdem = await prisma.anuncio.findFirst({ orderBy: { ordem: "desc" }, select: { ordem: true } });
    const anuncio = await prisma.anuncio.create({
      data: { titulo, imagemUrl, linkUrl, ordem: (maxOrdem?.ordem ?? 0) + 1 },
    });
    return NextResponse.json({ sucesso: true, dados: anuncio }, { status: 201 });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao criar anúncio." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }
    const { ids } = await request.json();
    for (let i = 0; i < ids.length; i++) {
      await prisma.anuncio.update({ where: { id: ids[i] }, data: { ordem: i } });
    }
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao reordenar." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ sucesso: false, erro: "ID não informado." }, { status: 400 });
    await prisma.anuncio.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao remover anúncio." }, { status: 500 });
  }
}
