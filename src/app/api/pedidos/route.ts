import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { esquemaCriarPedido, esquemaAtualizarPedido } from "@/lib/validacao";
import { verificarRateLimit, cabecalhoRetryAfter } from "@/lib/rate-limit";
import type { RespostaApi } from "@/tipos";
import type { StatusPedido } from "@/generated/prisma/client";

const RATE_LIMIT_PEDIDO = 10;
const RATE_LIMIT_JANELA_MS = 60_000;

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId },
      include: {
        itens: {
          include: {
            tutorial: { select: { titulo: true, slug: true, imagemCapaUrl: true } },
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    const resultado = pedidos.map((p) => ({
      id: p.id,
      status: p.status,
      valorTotal: Number(p.valorTotal),
      itens: p.itens.map((i) => ({
        tutorial: i.tutorial,
        precoUnitario: Number(i.precoUnitario),
      })),
      criadoEm: p.criadoEm.toISOString(),
    }));

    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (erro) {
    console.error("Erro ao listar pedidos:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao carregar pedidos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const rate = verificarRateLimit(request, RATE_LIMIT_PEDIDO, RATE_LIMIT_JANELA_MS, "criar-pedido");
    if (rate.bloqueado) {
      return NextResponse.json(
        { sucesso: false, erro: "Muitos pedidos em pouco tempo. Aguarde um minuto." },
        { status: 429, headers: { "Retry-After": cabecalhoRetryAfter(rate.resetEmMs) } }
      );
    }

    const corpo = await request.json();
    const validacao = esquemaCriarPedido.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        { sucesso: false, erro: validacao.error.issues[0]?.message || "Nenhum item no pedido." },
        { status: 400 }
      );
    }

    const { itens, cupom } = validacao.data;
    const tutoriaisIds = itens.map((i) => i.tutorialId);
    const tutoriais = await prisma.tutorial.findMany({
      where: { id: { in: tutoriaisIds }, ativo: true },
    });

    if (tutoriais.length !== tutoriaisIds.length) {
      return NextResponse.json(
        { sucesso: false, erro: "Um ou mais tutoriais não estão disponíveis." },
        { status: 400 }
      );
    }

    const subtotal = tutoriais.reduce(
      (acc, tutorial) => acc + Number(tutorial.precoPromocional || tutorial.preco),
      0
    );
    let descontoPercentual = 0;

    if (cupom) {
      const cupomAtivo = await prisma.cupom.findUnique({
        where: { codigo: String(cupom).toUpperCase().trim() },
      });

      if (!cupomAtivo || !cupomAtivo.ativo || cupomAtivo.validoAte < new Date()) {
        return NextResponse.json(
          { sucesso: false, erro: "Cupom inválido ou expirado." },
          { status: 400 }
        );
      }

      descontoPercentual = cupomAtivo.descontoPercentual;
    }

    const valorTotal = Math.max(0, subtotal - subtotal * (descontoPercentual / 100));

    const pedido = await prisma.pedido.create({
      data: {
        usuarioId,
        valorTotal: new Prisma.Decimal(valorTotal),
        idTransacaoGateway: `SIMULADO-${Date.now()}`,
        itens: {
          create: tutoriais.map((tutorial) => ({
            tutorialId: tutorial.id,
            precoUnitario: tutorial.precoPromocional || tutorial.preco,
          })),
        },
      },
    });

    const codigoPix = `studioglow-pix-${pedido.id}-${Date.now()}`;

    return NextResponse.json(
      {
        sucesso: true,
        dados: {
          pedidoId: pedido.id,
          codigoPix,
          subtotal,
          descontoPercentual,
          valorTotal,
        },
      },
      { status: 201 }
    );
  } catch (erro) {
    console.error("Erro ao criar pedido:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao criar pedido." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    const papel = request.headers.get("x-usuario-papel");
    if (!usuarioId || papel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const corpo = await request.json();
    const validacao = esquemaAtualizarPedido.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json({ sucesso: false, erro: validacao.error.issues[0]?.message || "Informe pedidoId e status." }, { status: 400 });
    }
    const { pedidoId, status: novoStatus, motivo } = validacao.data;

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { usuario: { select: { id: true, nomeCompleto: true } } },
    });

    if (!pedido) {
      return NextResponse.json({ sucesso: false, erro: "Pedido não encontrado." }, { status: 404 });
    }

    if (pedido.status === "REEMBOLSADO") {
      return NextResponse.json(
        { sucesso: false, erro: "Pedido já foi reembolsado." },
        { status: 400 }
      );
    }

    if (novoStatus === "REEMBOLSADO") {
      if (!motivo || !["estoque", "problema_produto"].includes(motivo)) {
        return NextResponse.json(
          { sucesso: false, erro: "Informe o motivo do reembolso: estoque ou problema_produto." },
          { status: 400 }
        );
      }
    }

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { status: novoStatus as StatusPedido },
    });

    const motivoTexto =
      motivo === "estoque"
        ? "Produto sem estoque"
        : motivo === "problema_produto"
          ? "Problema com o produto"
          : "";

    const mensagemAdmin = motivoTexto
      ? `Pedido atualizado para **${novoStatus}**\n\nMotivo: ${motivoTexto}\n\nCliente: ${pedido.usuario.nomeCompleto}\nValor reembolsado: R$ ${Number(pedido.valorTotal).toFixed(2)}`
      : `Pedido atualizado para **${novoStatus}** por decisão administrativa.`;

    const conversaExistente = await prisma.conversa.findFirst({
      where: { usuarioId: pedido.usuarioId, status: { not: "ENCERRADA" } },
      orderBy: { criadoEm: "desc" },
    });

    if (conversaExistente) {
      await prisma.mensagem.create({
        data: {
          texto: mensagemAdmin,
          tipo: "SISTEMA",
          conversaId: conversaExistente.id,
        },
      });
    }

    return NextResponse.json({
      sucesso: true,
      dados: {
        pedidoId,
        status: novoStatus,
        motivo: motivoTexto || undefined,
      },
    });
  } catch (erro) {
    console.error("Erro ao atualizar pedido:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao atualizar status do pedido." },
      { status: 500 }
    );
  }
}
