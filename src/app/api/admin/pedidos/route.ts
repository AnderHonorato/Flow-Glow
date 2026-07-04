import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

// Lista todos os pedidos (admin).
export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioPapel = request.headers.get("x-usuario-papel");
    if (usuarioPapel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const pedidos = await prisma.pedido.findMany({
      include: {
        usuario: { select: { nomeCompleto: true, email: true } },
        itens: {
          include: { tutorial: { select: { titulo: true } } },
        },
      },
      orderBy: { criadoEm: "desc" },
      take: 100,
    });

    return NextResponse.json({
      sucesso: true,
      dados: pedidos.map((p) => ({
        id: p.id,
        status: p.status,
        valorTotal: Number(p.valorTotal),
        usuario: p.usuario,
        itens: p.itens.map((i) => ({
          tutorial: i.tutorial.titulo,
          preco: Number(i.precoUnitario),
        })),
        criadoEm: p.criadoEm.toISOString(),
      })),
    });
  } catch (erro) {
    console.error("Erro ao listar pedidos admin:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno." },
      { status: 500 }
    );
  }
}
