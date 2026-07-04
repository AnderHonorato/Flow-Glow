import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const { codigo } = await request.json();
    if (!codigo) {
      return NextResponse.json({ sucesso: false, erro: "Código não informado." }, { status: 400 });
    }

    const cupom = await prisma.cupom.findUnique({
      where: { codigo: codigo.toUpperCase().trim() },
    });

    if (!cupom || !cupom.ativo || cupom.validoAte < new Date()) {
      return NextResponse.json({ sucesso: false, erro: "Cupom inválido ou expirado." }, { status: 404 });
    }

    return NextResponse.json({
      sucesso: true,
      dados: {
        codigo: cupom.codigo,
        descontoPercentual: cupom.descontoPercentual,
        validoAte: cupom.validoAte.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao validar cupom." }, { status: 500 });
  }
}
