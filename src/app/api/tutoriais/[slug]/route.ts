import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<RespostaApi>> {
  try {
    const { slug } = await params;

    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      include: {
        categoria: { select: { nome: true, slug: true } },
        modulos: { orderBy: { ordem: "asc" } },
        comentarios: {
          include: {
            usuario: { select: { nomeCompleto: true, fotoPerfilUrl: true } },
            anexos: { select: { tipo: true, url: true } },
          },
          orderBy: { criadoEm: "desc" },
        },
      },
    });

    if (!tutorial || !tutorial.ativo) {
      return NextResponse.json(
        { sucesso: false, erro: "Tutorial não encontrado." },
        { status: 404 }
      );
    }

    const notas = tutorial.comentarios.map((c) => c.nota);
    const notaMedia =
      notas.length > 0
        ? notas.reduce((a, b) => a + b, 0) / notas.length
        : 0;

    return NextResponse.json({
      sucesso: true,
      dados: {
        id: tutorial.id,
        titulo: tutorial.titulo,
        slug: tutorial.slug,
        descricaoCurta: tutorial.descricaoCurta,
        descricaoCompleta: tutorial.descricaoCompleta,
        preco: Number(tutorial.preco),
        precoPromocional: tutorial.precoPromocional
          ? Number(tutorial.precoPromocional)
          : null,
        cupomDesconto: tutorial.cupomDesconto,
        destaquePromocional: tutorial.destaquePromocional,
        cidade: tutorial.cidade,
        estado: tutorial.estado,
        distanciaKm: tutorial.distanciaKm,
        imagemCapaUrl: tutorial.imagemCapaUrl,
        videoPreviaUrl: tutorial.videoPreviaUrl,
        nivel: tutorial.nivel,
        categoria: {
          nome: tutorial.categoria.nome,
          slug: tutorial.categoria.slug,
        },
        notaMedia: Math.round(notaMedia * 10) / 10,
        totalAvaliacoes: tutorial.comentarios.length,
        modulos: tutorial.modulos.map((m) => ({
          id: m.id,
          titulo: m.titulo,
          ordem: m.ordem,
          duracaoMinutos: m.duracaoMinutos,
          gratuito: m.gratuito,
          videoUrl: m.gratuito ? m.videoUrl : null,
        })),
        comentarios: tutorial.comentarios.map((c) => ({
          id: c.id,
          nota: c.nota,
          texto: c.texto,
          usuario: c.usuario,
          anexos: c.anexos,
          criadoEm: c.criadoEm.toISOString(),
          editadoEm: c.editadoEm.toISOString(),
        })),
      },
    });
  } catch (erro) {
    console.error("Erro ao buscar tutorial:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao carregar tutorial." },
      { status: 500 }
    );
  }
}
