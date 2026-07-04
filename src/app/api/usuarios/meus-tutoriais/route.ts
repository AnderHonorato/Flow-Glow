import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

// Retorna os tutoriais que o usuário já comprou (pedidos aprovados).
export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const pedidosAprovados = await prisma.pedido.findMany({
      where: {
        usuarioId,
        status: "APROVADO",
      },
      include: {
        itens: {
          include: {
            tutorial: {
              include: {
                categoria: { select: { nome: true, slug: true } },
                modulos: { orderBy: { ordem: "asc" } },
              },
            },
          },
        },
      },
    });

    // Achata os itens de todos os pedidos aprovados em uma lista única.
    const tutoriaisComprados = pedidosAprovados.flatMap((pedido) =>
      pedido.itens.map((item) => ({
        tutorialId: item.tutorial.id,
        titulo: item.tutorial.titulo,
        slug: item.tutorial.slug,
        imagemCapaUrl: item.tutorial.imagemCapaUrl,
        progresso: 0,
        categoria: item.tutorial.categoria,
        modulos: item.tutorial.modulos.map((m) => ({
          id: m.id,
          titulo: m.titulo,
          ordem: m.ordem,
          videoUrl: m.videoUrl,
          duracaoMinutos: m.duracaoMinutos,
          gratuito: m.gratuito,
        })),
      }))
    );

    // Remove duplicatas (caso o mesmo tutorial apareça em mais de um pedido).
    const unicos = tutoriaisComprados.filter(
      (t, i, arr) => arr.findIndex((x) => x.tutorialId === t.tutorialId) === i
    );

    return NextResponse.json({ sucesso: true, dados: unicos });
  } catch (erro) {
    console.error("Erro ao buscar tutoriais comprados:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno." },
      { status: 500 }
    );
  }
}
