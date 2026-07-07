import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAccessToken } from "@/lib/jwt";
import type { RespostaApi } from "@/tipos";

function limparLink(linkUrl: unknown): string {
  const link = typeof linkUrl === "string" ? linkUrl.trim() : "";
  if (!link) return "/tutoriais";
  if (link.startsWith("/") || link.startsWith("https://") || link.startsWith("http://")) {
    return link;
  }
  return `/${link}`;
}

function limparTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function papelDoRequest(request: NextRequest): string | null {
  const papelHeader = request.headers.get("x-usuario-papel");
  if (papelHeader) return papelHeader;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    return verificarAccessToken(token).papel;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const todos = request.nextUrl.searchParams.get("todos") === "true";
    const papel = papelDoRequest(request);
    const anuncios = await prisma.anuncio.findMany({
      where: todos && papel === "ADMINISTRADOR" ? undefined : { ativo: true },
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
    const { titulo, imagemUrl, linkUrl, corFundo, ativo } = await request.json();
    const tituloLimpo = limparTexto(titulo);
    const imagemLimpa = limparTexto(imagemUrl);
    if (!tituloLimpo || !imagemLimpa) {
      return NextResponse.json(
        { sucesso: false, erro: "Informe titulo e imagem do banner." },
        { status: 400 }
      );
    }
    const maxOrdem = await prisma.anuncio.findFirst({ orderBy: { ordem: "desc" }, select: { ordem: true } });
    const anuncio = await prisma.anuncio.create({
      data: {
        titulo: tituloLimpo,
        imagemUrl: imagemLimpa,
        linkUrl: limparLink(linkUrl),
        corFundo: limparTexto(corFundo) || null,
        ativo: ativo !== false,
        ordem: (maxOrdem?.ordem ?? 0) + 1,
      },
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
    if (!Array.isArray(ids)) {
      return NextResponse.json({ sucesso: false, erro: "Lista de banners invalida." }, { status: 400 });
    }
    for (let i = 0; i < ids.length; i++) {
      await prisma.anuncio.update({ where: { id: ids[i] }, data: { ordem: i } });
    }
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao reordenar." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    if (papel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const corpo = await request.json();
    const id = limparTexto(corpo.id);
    if (!id) return NextResponse.json({ sucesso: false, erro: "ID nao informado." }, { status: 400 });

    const dados: {
      titulo?: string;
      imagemUrl?: string;
      linkUrl?: string;
      corFundo?: string | null;
      ativo?: boolean;
    } = {};

    if ("titulo" in corpo) {
      const titulo = limparTexto(corpo.titulo);
      if (!titulo) return NextResponse.json({ sucesso: false, erro: "Informe o titulo." }, { status: 400 });
      dados.titulo = titulo;
    }
    if ("imagemUrl" in corpo) {
      const imagemUrl = limparTexto(corpo.imagemUrl);
      if (!imagemUrl) return NextResponse.json({ sucesso: false, erro: "Informe a imagem." }, { status: 400 });
      dados.imagemUrl = imagemUrl;
    }
    if ("linkUrl" in corpo) dados.linkUrl = limparLink(corpo.linkUrl);
    if ("corFundo" in corpo) dados.corFundo = limparTexto(corpo.corFundo) || null;
    if ("ativo" in corpo) dados.ativo = Boolean(corpo.ativo);

    const anuncio = await prisma.anuncio.update({ where: { id }, data: dados });
    return NextResponse.json({ sucesso: true, dados: anuncio });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao atualizar anuncio." }, { status: 500 });
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
