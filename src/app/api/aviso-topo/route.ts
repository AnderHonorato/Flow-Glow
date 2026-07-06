import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

async function desativarExpirados() {
  const agora = new Date();
  await prisma.configuracaoAvisoTopo.updateMany({
    where: {
      ativo: true,
      fimEm: { lt: agora },
    },
    data: {
      ativo: false,
      desativadoEm: agora,
      desativadoMotivo: "Periodo finalizado automaticamente.",
    },
  });
}

export async function GET(): Promise<NextResponse<RespostaApi>> {
  try {
    await desativarExpirados();
    const agora = new Date();
    const aviso = await prisma.configuracaoAvisoTopo.findFirst({
      where: {
        ativo: true,
        inicioEm: { lte: agora },
        fimEm: { gte: agora },
      },
      orderBy: { atualizadoEm: "desc" },
    });

    return NextResponse.json({ sucesso: true, dados: aviso });
  } catch (erro) {
    console.error("Erro ao buscar aviso do topo:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro ao buscar aviso." }, { status: 500 });
  }
}
