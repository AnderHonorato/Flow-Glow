import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

// Admin responde a uma conversa específica.
export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    const adminId = request.headers.get("x-usuario-id");
    if (papel !== "ADMINISTRADOR" || !adminId) {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }
    const { conversaId, texto } = await request.json();
    if (!conversaId || !texto || !String(texto).trim()) {
      return NextResponse.json({ sucesso: false, erro: "Dados incompletos." }, { status: 400 });
    }
    const mensagem = await prisma.mensagem.create({
      data: { texto: String(texto).trim(), conversaId, remetenteId: adminId },
      include: {
        remetente: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, papel: true } },
      },
    });
    return NextResponse.json({ sucesso: true, dados: mensagem }, { status: 201 });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao enviar." }, { status: 500 });
  }
}
