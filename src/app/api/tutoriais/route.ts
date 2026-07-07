import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { esquemaTutorial } from "@/lib/validacao";
import type { RespostaApi } from "@/tipos";

function normalizarTexto(valor?: string | null): string | null {
  const limpo = valor?.trim();
  return limpo ? limpo : null;
}

function numeroParametro(valor: string | null): number | null {
  if (!valor) return null;
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
}

function montarModulos(
  modulos?: {
    titulo: string;
    videoUrl?: string | null;
    duracaoMinutos: number;
    gratuito?: boolean;
  }[]
) {
  return (modulos || []).map((modulo, indice) => ({
    titulo: modulo.titulo,
    ordem: indice + 1,
    videoUrl: modulo.videoUrl || "https://example.com/video-preview.mp4",
    duracaoMinutos: modulo.duracaoMinutos,
    gratuito: Boolean(modulo.gratuito),
  }));
}

function serializarTutorial(tutorial: {
  id: string;
  titulo: string;
  slug: string;
  descricaoCurta: string;
  preco: unknown;
  precoPromocional: unknown | null;
  cupomDesconto: string | null;
  destaquePromocional: boolean;
  bombando: boolean;
  fotosGaleria: string[];
  cidade: string | null;
  estado: string | null;
  distanciaKm: number | null;
  imagemCapaUrl: string;
  nivel: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  categoria: { nome: string; slug: string };
  comentarios: { nota: number }[];
  _count: { comentarios: number };
}) {
  const notas = tutorial.comentarios.map((c) => c.nota);
  const notaMedia =
    notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;

  return {
    id: tutorial.id,
    titulo: tutorial.titulo,
    slug: tutorial.slug,
    descricaoCurta: tutorial.descricaoCurta,
    preco: Number(tutorial.preco),
    precoPromocional: tutorial.precoPromocional
      ? Number(tutorial.precoPromocional)
      : null,
    cupomDesconto: tutorial.cupomDesconto,
    destaquePromocional: tutorial.destaquePromocional,
    bombando: tutorial.bombando,
    fotosGaleria: tutorial.fotosGaleria,
    cidade: tutorial.cidade,
    estado: tutorial.estado,
    distanciaKm: tutorial.distanciaKm,
    imagemCapaUrl: tutorial.imagemCapaUrl,
    nivel: tutorial.nivel,
    categoria: tutorial.categoria,
    notaMedia: Math.round(notaMedia * 10) / 10,
    totalAvaliacoes: tutorial._count.comentarios,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const { searchParams } = request.nextUrl;
    const idsParam = searchParams.get("ids");

    if (idsParam) {
      const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ sucesso: true, dados: [], total: 0 });
      }
      const tutoriais = await prisma.tutorial.findMany({
        where: { id: { in: ids }, ativo: true },
        select: { id: true, titulo: true, slug: true, preco: true, precoPromocional: true, imagemCapaUrl: true },
      });
      return NextResponse.json({
        sucesso: true,
        dados: tutoriais.map((t) => ({
          ...t,
          preco: Number(t.preco),
          precoPromocional: t.precoPromocional ? Number(t.precoPromocional) : null,
        })),
      });
    }

    const pagina = Math.max(1, parseInt(searchParams.get("pagina") || "1", 10));
    const limite = Math.min(50, Math.max(1, parseInt(searchParams.get("limite") || "12", 10)));
    const pular = (pagina - 1) * limite;
    const categoria = searchParams.get("categoria");
    const nivel = searchParams.get("nivel");
    const ordenar = searchParams.get("ordenar") || "recentes";
    const busca = searchParams.get("busca")?.trim();
    const somentePromocao = searchParams.get("promocao") === "true";
    const somenteBombando = searchParams.get("bombando") === "true";
    const distanciaMax = numeroParametro(searchParams.get("distanciaMax"));
    const precoMin = numeroParametro(searchParams.get("precoMin"));
    const precoMax = numeroParametro(searchParams.get("precoMax"));

    const filtros: Record<string, unknown>[] = [{ ativo: true }];

    if (categoria) filtros.push({ categoria: { slug: categoria } });
    if (nivel) filtros.push({ nivel });
    if (somenteBombando) filtros.push({ bombando: true });

    if (busca) {
      filtros.push({
        OR: [
          { titulo: { contains: busca, mode: "insensitive" } },
          { descricaoCurta: { contains: busca, mode: "insensitive" } },
          { descricaoCompleta: { contains: busca, mode: "insensitive" } },
          { cidade: { contains: busca, mode: "insensitive" } },
          { cupomDesconto: { contains: busca, mode: "insensitive" } },
          { categoria: { nome: { contains: busca, mode: "insensitive" } } },
        ],
      });
    }

    if (somentePromocao) {
      filtros.push({
        OR: [{ precoPromocional: { not: null } }, { destaquePromocional: true }],
      });
    }

    if (distanciaMax && distanciaMax > 0) {
      filtros.push({ distanciaKm: { lte: distanciaMax } });
    }

    if (precoMin !== null || precoMax !== null) {
      const intervalo: Record<string, number> = {};
      if (precoMin !== null) intervalo.gte = precoMin;
      if (precoMax !== null) intervalo.lte = precoMax;
      filtros.push({
        OR: [{ preco: intervalo }, { precoPromocional: intervalo }],
      });
    }

    let ordem: Record<string, unknown>[] = [
      { bombando: "desc" },
      { criadoEm: "desc" },
    ];
    if (ordenar === "preco-asc") ordem = [{ bombando: "desc" }, { preco: "asc" }];
    if (ordenar === "preco-desc") ordem = [{ bombando: "desc" }, { preco: "desc" }];
    if (ordenar === "distancia") ordem = [{ bombando: "desc" }, { distanciaKm: "asc" }];
    if (ordenar === "avaliacao") ordem = [{ bombando: "desc" }, { criadoEm: "desc" }];

    const [total, tutoriais] = await Promise.all([
      prisma.tutorial.count({ where: { AND: filtros } as never }),
      prisma.tutorial.findMany({
        where: { AND: filtros } as never,
        orderBy: ordem as never,
        skip: pular,
        take: limite,
        include: {
          categoria: { select: { nome: true, slug: true } },
          comentarios: { select: { nota: true } },
          _count: { select: { comentarios: true } },
        },
      }),
    ]);

    const resultado = tutoriais.map(serializarTutorial);

    if (ordenar === "avaliacao") {
      resultado.sort((a, b) => {
        if (Number(b.bombando) !== Number(a.bombando)) {
          return Number(b.bombando) - Number(a.bombando);
        }
        return b.notaMedia - a.notaMedia;
      });
    }

    return NextResponse.json({
      sucesso: true,
      dados: resultado,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    });
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
        imagemCapaUrl: dados.imagemCapaUrl || "/marca/logo.png",
        videoPreviaUrl: normalizarTexto(dados.videoPreviaUrl),
        cupomDesconto: normalizarTexto(dados.cupomDesconto),
        destaquePromocional:
          dados.destaquePromocional ?? Boolean(dados.precoPromocional),
        bombando: Boolean(dados.bombando),
        fotosGaleria: dados.fotosGaleria || [],
        cidade: normalizarTexto(dados.cidade),
        estado: normalizarTexto(dados.estado)?.toUpperCase() || null,
        distanciaKm: dados.distanciaKm ?? null,
        categoriaId: dados.categoriaId,
        nivel: dados.nivel,
        modulos: {
          create: montarModulos(dados.modulos),
        },
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

export async function PUT(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioPapel = request.headers.get("x-usuario-papel");
    if (usuarioPapel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const corpo = await request.json();
    const id = corpo.id as string | undefined;
    if (!id) {
      return NextResponse.json({ sucesso: false, erro: "ID não informado." }, { status: 400 });
    }

    const validacao = esquemaTutorial.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json(
        { sucesso: false, erro: validacao.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const dados = validacao.data;
    const modulos = montarModulos(dados.modulos);

    const tutorial = await prisma.tutorial.update({
      where: { id },
      data: {
        titulo: dados.titulo,
        slug: dados.slug,
        descricaoCurta: dados.descricaoCurta,
        descricaoCompleta: dados.descricaoCompleta,
        preco: dados.preco,
        precoPromocional: dados.precoPromocional ?? null,
        imagemCapaUrl: dados.imagemCapaUrl || "/marca/logo.png",
        videoPreviaUrl: normalizarTexto(dados.videoPreviaUrl),
        cupomDesconto: normalizarTexto(dados.cupomDesconto),
        destaquePromocional:
          dados.destaquePromocional ?? Boolean(dados.precoPromocional),
        bombando: Boolean(dados.bombando),
        fotosGaleria: dados.fotosGaleria || [],
        cidade: normalizarTexto(dados.cidade),
        estado: normalizarTexto(dados.estado)?.toUpperCase() || null,
        distanciaKm: dados.distanciaKm ?? null,
        categoriaId: dados.categoriaId,
        nivel: dados.nivel,
        modulos: {
          deleteMany: {},
          create: modulos,
        },
      },
    });

    return NextResponse.json({ sucesso: true, dados: tutorial });
  } catch (erro) {
    console.error("Erro ao atualizar tutorial:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao atualizar anúncio." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioPapel = request.headers.get("x-usuario-papel");
    if (usuarioPapel !== "ADMINISTRADOR") {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ sucesso: false, erro: "ID não informado." }, { status: 400 });
    }

    await prisma.tutorial.update({ where: { id }, data: { ativo: false } });
    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro ao desativar tutorial:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao desativar anúncio." },
      { status: 500 }
    );
  }
}
