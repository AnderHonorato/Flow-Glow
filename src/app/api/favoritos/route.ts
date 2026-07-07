import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RespostaApi } from "@/tipos";

function serializarTutorialFavorito(favorito: {
  id: string;
  criadoEm: Date;
  tutorial: {
    id: string;
    titulo: string;
    slug: string;
    descricaoCurta: string;
    preco: unknown;
    precoPromocional: unknown | null;
    imagemCapaUrl: string;
    destaquePromocional: boolean;
    bombando: boolean;
    cidade: string | null;
    estado: string | null;
    distanciaKm: number | null;
    categoria: { nome: string; slug: string };
  };
}) {
  return {
    id: favorito.id,
    criadoEm: favorito.criadoEm,
    tutorial: {
      ...favorito.tutorial,
      preco: Number(favorito.tutorial.preco),
      precoPromocional: favorito.tutorial.precoPromocional
        ? Number(favorito.tutorial.precoPromocional)
        : null,
    },
  };
}

async function lerTutorialId(request: NextRequest) {
  const pelaUrl = request.nextUrl.searchParams.get("tutorialId");
  if (pelaUrl) return pelaUrl;

  try {
    const corpo = await request.json();
    return typeof corpo.tutorialId === "string" ? corpo.tutorialId : "";
  } catch {
    return "";
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    const papel = request.headers.get("x-usuario-papel");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Nao autorizado." }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;

    if (searchParams.get("analise") === "true") {
      if (papel !== "ADMINISTRADOR") {
        return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
      }

      const grupos = await prisma.favoritoTutorial.groupBy({
        by: ["tutorialId"],
        _count: { tutorialId: true },
        orderBy: { _count: { tutorialId: "desc" } },
      });

      const tutoriais = await prisma.tutorial.findMany({
        where: { id: { in: grupos.map((grupo) => grupo.tutorialId) } },
        include: { categoria: { select: { nome: true, slug: true } } },
      });
      const porId = new Map(tutoriais.map((tutorial) => [tutorial.id, tutorial]));

      return NextResponse.json({
        sucesso: true,
        dados: grupos.map((grupo) => {
          const tutorial = porId.get(grupo.tutorialId);
          return {
            tutorialId: grupo.tutorialId,
            totalFavoritos: grupo._count.tutorialId,
            tutorial: tutorial
              ? {
                  id: tutorial.id,
                  titulo: tutorial.titulo,
                  slug: tutorial.slug,
                  imagemCapaUrl: tutorial.imagemCapaUrl,
                  categoria: tutorial.categoria,
                  preco: Number(tutorial.preco),
                  precoPromocional: tutorial.precoPromocional
                    ? Number(tutorial.precoPromocional)
                    : null,
                }
              : null,
          };
        }),
      });
    }

    if (searchParams.get("somenteIds") === "true") {
      const favoritos = await prisma.favoritoTutorial.findMany({
        where: { usuarioId },
        select: { tutorialId: true },
        orderBy: { criadoEm: "desc" },
      });
      return NextResponse.json({
        sucesso: true,
        dados: favoritos.map((favorito) => favorito.tutorialId),
      });
    }

    const favoritos = await prisma.favoritoTutorial.findMany({
      where: { usuarioId },
      include: {
        tutorial: {
          include: { categoria: { select: { nome: true, slug: true } } },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json({
      sucesso: true,
      dados: favoritos.map(serializarTutorialFavorito),
    });
  } catch (erro) {
    console.error("Erro ao listar favoritos:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro ao carregar favoritos." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Nao autorizado." }, { status: 401 });
    }

    const tutorialId = await lerTutorialId(request);
    if (!tutorialId) {
      return NextResponse.json({ sucesso: false, erro: "Anuncio nao informado." }, { status: 400 });
    }

    await prisma.favoritoTutorial.upsert({
      where: { usuarioId_tutorialId: { usuarioId, tutorialId } },
      update: {},
      create: { usuarioId, tutorialId },
    });

    return NextResponse.json({ sucesso: true }, { status: 201 });
  } catch (erro) {
    console.error("Erro ao favoritar:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro ao favoritar anuncio." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Nao autorizado." }, { status: 401 });
    }

    const tutorialId = await lerTutorialId(request);
    if (!tutorialId) {
      return NextResponse.json({ sucesso: false, erro: "Anuncio nao informado." }, { status: 400 });
    }

    await prisma.favoritoTutorial.deleteMany({ where: { usuarioId, tutorialId } });
    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro ao remover favorito:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro ao remover favorito." }, { status: 500 });
  }
}
