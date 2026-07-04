import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(): Promise<NextResponse<RespostaApi>> {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json({ sucesso: true, dados: categorias });
  } catch {
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao carregar categorias." },
      { status: 500 }
    );
  }
}
