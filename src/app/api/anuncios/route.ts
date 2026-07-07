import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAccessToken } from "@/lib/jwt";
import { esquemaAnuncio, esquemaReordenarAnuncios, esquemaAtualizarAnuncio } from "@/lib/validacao";
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
    const corpo = await request.json();
    const validacao = esquemaAnuncio.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json(
        { sucesso: false, erro: validacao.error.issues[0]?.message || "Informe título e imagem do banner." },
        { status: 400 }
      );
    }
    const dados = validacao.data;
    const tituloLimpo = dados.titulo.trim();
    const imagemLimpa = dados.imagemUrl.trim();
    const maxOrdem = await prisma.anuncio.findFirst({ orderBy: { ordem: "desc" }, select: { ordem: true } });
    const anuncio = await prisma.anuncio.create({
      data: {
        titulo: tituloLimpo,
        imagemUrl: imagemLimpa,
        linkUrl: limparLink(dados.linkUrl),
        corFundo: limparTexto(dados.corFundo) || null,
        ativo: dados.ativo !== false,
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
    const corpo = await request.json();
    const validacao = esquemaReordenarAnuncios.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json({ sucesso: false, erro: "Lista de banners inválida." }, { status: 400 });
    }
    for (let i = 0; i < validacao.data.ids.length; i++) {
      await prisma.anuncio.update({ where: { id: validacao.data.ids[i] }, data: { ordem: i } });
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
    const validacao = esquemaAtualizarAnuncio.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json({ sucesso: false, erro: validacao.error.issues[0]?.message || "ID não informado." }, { status: 400 });
    }
    const dadosValidos = validacao.data;
    const id = dadosValidos.id;

    const dados: {
      titulo?: string;
      imagemUrl?: string;
      linkUrl?: string;
      corFundo?: string | null;
      ativo?: boolean;
    } = {};

    if (dadosValidos.titulo !== undefined) {
      const titulo = dadosValidos.titulo.trim();
      if (!titulo) return NextResponse.json({ sucesso: false, erro: "Informe o título." }, { status: 400 });
      dados.titulo = titulo;
    }
    if (dadosValidos.imagemUrl !== undefined) {
      const imagemUrl = dadosValidos.imagemUrl.trim();
      if (!imagemUrl) return NextResponse.json({ sucesso: false, erro: "Informe a imagem." }, { status: 400 });
      dados.imagemUrl = imagemUrl;
    }
    if (dadosValidos.linkUrl !== undefined) dados.linkUrl = limparLink(dadosValidos.linkUrl);
    if (dadosValidos.corFundo !== undefined) dados.corFundo = limparTexto(dadosValidos.corFundo) || null;
    if (dadosValidos.ativo !== undefined) dados.ativo = dadosValidos.ativo;

    const anuncio = await prisma.anuncio.update({ where: { id }, data: dados });
    return NextResponse.json({ sucesso: true, dados: anuncio });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao atualizar anúncio." }, { status: 500 });
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
