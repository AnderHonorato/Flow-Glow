import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { esquemaTutorial } from "@/lib/validacao";
import type { RespostaApi } from "@/tipos";

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const { searchParams } = request.nextUrl;
    const categoria = searchParams.get("categoria");
    const nivel = searchParams.get("nivel");
    const ordenar = searchParams.get("ordenar") || "recentes";
    const busca = searchParams.get("busca")?.trim();
    const somentePromocao = searchParams.get("promocao") === "true";
    const distanciaMax = Number(searchParams.get("distanciaMax") || "");

    const filtros: Record<string, unknown>[] = [{ ativo: true }];

    if (categoria) {
      filtros.push({ categoria: { slug: categoria } });
    }

    if (nivel) {
      filtros.push({ nivel });
    }

    if (busca) {
      filtros.push({
        OR: [
          { titulo: { contains: busca, mode: "insensitive" } },
          { descricaoCurta: { contains: busca, mode: "insensitive" } },
          { cidade: { contains: busca, mode: "insensitive" } },
        ],
      });
    }

    if (somentePromocao) {
      filtros.push({
        OR: [{ precoPromocional: { not: null } }, { destaquePromocional: true }],
      });
    }

    if (Number.isFinite(distanciaMax) && distanciaMax > 0) {
      filtros.push({ distanciaKm: { lte: distanciaMax } });
    }

    let ordem: Record<string, unknown> = { criadoEm: "desc" };
    if (ordenar === "preco-asc") ordem = { preco: "asc" };
    if (ordenar === "preco-desc") ordem = { preco: "desc" };
    if (ordenar === "distancia") ordem = { distanciaKm: "asc" };

    const tutoriais = await prisma.tutorial.findMany({
      where: { AND: filtros } as never,
      orderBy: ordem as never,
      include: {
        categoria: { select: { nome: true, slug: true } },
        comentarios: { select: { nota: true } },
        _count: { select: { comentarios: true } },
      },
    });

    const resultado = tutoriais.map((t) => {
      const notas = t.comentarios.map((c) => c.nota);
      const notaMedia =
        notas.length > 0
          ? notas.reduce((a, b) => a + b, 0) / notas.length
          : 0;

      return {
        id: t.id,
        titulo: t.titulo,
        slug: t.slug,
        descricaoCurta: t.descricaoCurta,
        preco: Number(t.preco),
        precoPromocional: t.precoPromocional ? Number(t.precoPromocional) : null,
        cupomDesconto: t.cupomDesconto,
        destaquePromocional: t.destaquePromocional,
        cidade: t.cidade,
        estado: t.estado,
        distanciaKm: t.distanciaKm,
        imagemCapaUrl: t.imagemCapaUrl,
        nivel: t.nivel,
        categoria: t.categoria,
        notaMedia: Math.round(notaMedia * 10) / 10,
        totalAvaliacoes: t._count.comentarios,
      };
    });

    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (erro) {
    console.error("Erro ao listar tutoriais:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao carregar tutoriais." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioPapel = request.headers.get("x-usuario-papel");
    if (usuarioPapel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const corpo = await request.json();
    const validacao = esquemaTutorial.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json(
        { sucesso: false, erro: validacao.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const dados = validacao.data;
    const tutorial = await prisma.tutorial.create({
      data: {
        titulo: dados.titulo,
        slug: dados.slug,
        descricaoCurta: dados.descricaoCurta,
        descricaoCompleta: dados.descricaoCompleta,
        preco: dados.preco,
        precoPromocional: dados.precoPromocional ?? null,
        imagemCapaUrl: dados.imagemCapaUrl || "/placeholder-capa.jpg",
        videoPreviaUrl: dados.videoPreviaUrl || null,
        cupomDesconto: dados.cupomDesconto?.trim() || null,
        destaquePromocional:
          dados.destaquePromocional ?? Boolean(dados.precoPromocional),
        cidade: dados.cidade?.trim() || null,
        estado: dados.estado?.trim().toUpperCase() || null,
        distanciaKm: dados.distanciaKm ?? null,
        categoriaId: dados.categoriaId,
        nivel: dados.nivel,
      },
    });

    return NextResponse.json({ sucesso: true, dados: tutorial }, { status: 201 });
  } catch (erro) {
    console.error("Erro ao criar tutorial:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao criar tutorial." },
      { status: 500 }
    );
  }
}
