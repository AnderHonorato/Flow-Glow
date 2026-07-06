import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

function ehAdmin(request: NextRequest) {
  return request.headers.get("x-usuario-papel") === "ADMINISTRADOR";
}

async function desativarExpirados() {
  const agora = new Date();
  await prisma.configuracaoAvisoTopo.updateMany({
    where: { ativo: true, fimEm: { lt: agora } },
    data: {
      ativo: false,
      desativadoEm: agora,
      desativadoMotivo: "Periodo finalizado automaticamente.",
    },
  });
}

function corValida(cor: unknown, fallback: string) {
  if (typeof cor !== "string") return fallback;
  return /^#[0-9a-fA-F]{6}$/.test(cor) ? cor : fallback;
}

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    if (!ehAdmin(request)) {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    await desativarExpirados();
    const avisos = await prisma.configuracaoAvisoTopo.findMany({
      orderBy: { criadoEm: "desc" },
      take: 30,
    });

    return NextResponse.json({ sucesso: true, dados: avisos });
  } catch (erro) {
    console.error("Erro ao listar avisos:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    if (!ehAdmin(request)) {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const corpo = await request.json();
    const titulo = String(corpo.titulo || "").trim();
    const mensagem = String(corpo.mensagem || "").trim();
    const linkTexto = String(corpo.linkTexto || "").trim();
    const linkUrl = String(corpo.linkUrl || "").trim();
    const inicioEm = new Date(corpo.inicioEm);
    const fimEm = new Date(corpo.fimEm);
    const ativo = Boolean(corpo.ativo);

    if (!titulo || !mensagem) {
      return NextResponse.json({ sucesso: false, erro: "Informe titulo e mensagem." }, { status: 400 });
    }

    if (Number.isNaN(inicioEm.getTime()) || Number.isNaN(fimEm.getTime()) || fimEm <= inicioEm) {
      return NextResponse.json(
        { sucesso: false, erro: "Periodo invalido. O fim precisa ser depois do inicio." },
        { status: 400 }
      );
    }

    if (ativo) {
      await prisma.configuracaoAvisoTopo.updateMany({
        where: { ativo: true },
        data: {
          ativo: false,
          desativadoEm: new Date(),
          desativadoMotivo: "Substituido por uma nova faixa ativa.",
        },
      });
    }

    const aviso = await prisma.configuracaoAvisoTopo.create({
      data: {
        titulo,
        mensagem,
        linkTexto: linkTexto || null,
        linkUrl: linkUrl || null,
        corFundo: corValida(corpo.corFundo, "#b9923d"),
        corTexto: corValida(corpo.corTexto, "#ffffff"),
        inicioEm,
        fimEm,
        ativo,
      },
    });

    await desativarExpirados();

    return NextResponse.json({ sucesso: true, dados: aviso }, { status: 201 });
  } catch (erro) {
    console.error("Erro ao criar aviso:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro ao salvar aviso." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    if (!ehAdmin(request)) {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ sucesso: false, erro: "ID nao informado." }, { status: 400 });
    }

    const aviso = await prisma.configuracaoAvisoTopo.update({
      where: { id },
      data: {
        ativo: false,
        desativadoEm: new Date(),
        desativadoMotivo: "Desativado manualmente no admin.",
      },
    });

    return NextResponse.json({ sucesso: true, dados: aviso });
  } catch (erro) {
    console.error("Erro ao desativar aviso:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro ao desativar aviso." }, { status: 500 });
  }
}
