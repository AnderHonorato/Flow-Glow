import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";
import { Prisma } from "@/generated/prisma/client";

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

    const { itens } = await request.json();

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { sucesso: false, erro: "Nenhum item no pedido." },
        { status: 400 }
      );
    }

    // Busca os tutoriais e calcula o valor total.
    const tutoriaisIds = itens.map((i: { tutorialId: string }) => i.tutorialId);
    const tutoriais = await prisma.tutorial.findMany({
      where: { id: { in: tutoriaisIds }, ativo: true },
    });

    if (tutoriais.length !== tutoriaisIds.length) {
      return NextResponse.json(
        { sucesso: false, erro: "Um ou mais tutoriais não estão disponíveis." },
        { status: 400 }
      );
    }

    // Cria o pedido com os itens em uma transação.
    const pedido = await prisma.pedido.create({
      data: {
        usuarioId,
        valorTotal: new Prisma.Decimal(
          tutoriais.reduce((acc, t) => acc + Number(t.precoPromocional || t.preco), 0)
        ),
        idTransacaoGateway: `SIMULADO-${Date.now()}`,
        itens: {
          create: tutoriais.map((tutorial) => ({
            tutorialId: tutorial.id,
            precoUnitario: tutorial.precoPromocional || tutorial.preco,
          })),
        },
      },
    });

    // Em produção, aqui chamaríamos o provedor de pagamento real (Mercado Pago).
    // No modo sandbox/simulação, geramos um código PIX fictício.
    const codigoPix = `studioglow-pix-${pedido.id}-${Date.now()}`;

    return NextResponse.json(
      {
        sucesso: true,
        dados: {
          pedidoId: pedido.id,
          codigoPix,
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
