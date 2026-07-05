import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const urlBanco = process.env.DATABASE_URL;

if (!urlBanco) {
  console.error("DATABASE_URL não definida.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlBanco }),
});

const imagens = {
  maquiagem:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  skincare:
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
  sobrancelha:
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
  cabelo:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  unhas:
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
  noivas:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
};

async function semear() {
  console.log("Semeando banco de dados...");

  const categoriasBase = [
    { nome: "Maquiagem", slug: "maquiagem" },
    { nome: "Skincare", slug: "skincare" },
    { nome: "Glow Up", slug: "glow-up" },
    { nome: "Sobrancelha", slug: "sobrancelha" },
    { nome: "Autoestima", slug: "autoestima" },
    { nome: "Cabelo", slug: "cabelo" },
    { nome: "Unhas", slug: "unhas" },
    { nome: "Noivas", slug: "noivas" },
  ];

  const categorias = new Map<string, string>();
  for (const cat of categoriasBase) {
    const categoria = await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: { nome: cat.nome },
      create: cat,
    });
    categorias.set(cat.slug, categoria.id);
  }

  const senhaAdminHash = await bcrypt.hash("Admin123", 12);
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@studioglow.com.br" },
    update: {
      nomeCompleto: "Administrador Flow & Glow",
      senhaHash: senhaAdminHash,
      papel: "ADMINISTRADOR",
      emailVerificado: true,
      tentativasLogin: 0,
      bloqueadoAte: null,
    },
    create: {
      nomeCompleto: "Administrador Flow & Glow",
      email: "admin@studioglow.com.br",
      senhaHash: senhaAdminHash,
      papel: "ADMINISTRADOR",
      emailVerificado: true,
    },
  });

  const senhaClienteHash = await bcrypt.hash("Cliente123", 12);
  const cliente = await prisma.usuario.upsert({
    where: { email: "cliente@studioglow.com.br" },
    update: {
      nomeCompleto: "Cliente Teste",
      senhaHash: senhaClienteHash,
      emailVerificado: true,
      tentativasLogin: 0,
      bloqueadoAte: null,
    },
    create: {
      nomeCompleto: "Cliente Teste",
      email: "cliente@studioglow.com.br",
      senhaHash: senhaClienteHash,
      emailVerificado: true,
    },
  });

  const tutoriais = [
    {
      titulo: "Maquiagem Pele Real para Eventos",
      slug: "maquiagem-pele-real-eventos",
      categoriaSlug: "maquiagem",
      descricaoCurta:
        "Uma preparação elegante, resistente e com acabamento natural para fotos e eventos.",
      descricaoCompleta:
        "Aprenda uma maquiagem completa de pele real para eventos: preparação, correção pontual, base em camadas finas, olhos suaves, contorno discreto e finalização para câmera. O foco é acabamento profissional sem pesar no rosto.",
      preco: 149.9,
      precoPromocional: 99.9,
      cupomDesconto: "GLOW20",
      destaquePromocional: true,
      imagemCapaUrl: imagens.maquiagem,
      nivel: "INICIANTE" as const,
      cidade: "São Paulo",
      estado: "SP",
      distanciaKm: 4,
      modulos: [
        "Preparação e leitura da pele",
        "Base em camadas finas",
        "Olhos suaves e acabamento",
        "Finalização para fotos",
      ],
    },
    {
      titulo: "Skincare de Rotina Curta",
      slug: "skincare-rotina-curta",
      categoriaSlug: "skincare",
      descricaoCurta:
        "Monte uma rotina de manhã e noite com poucos produtos e resultado consistente.",
      descricaoCompleta:
        "Um guia prático para escolher limpador, hidratante, protetor solar e ativos sem exagero. Você aprende a montar uma rotina curta, entender sinais da pele e ajustar frequência sem irritar.",
      preco: 89.9,
      precoPromocional: null,
      cupomDesconto: null,
      destaquePromocional: false,
      imagemCapaUrl: imagens.skincare,
      nivel: "INICIANTE" as const,
      cidade: "Santo André",
      estado: "SP",
      distanciaKm: 12,
      modulos: [
        "Diagnóstico simples da pele",
        "Rotina da manhã",
        "Rotina da noite",
        "Erros comuns e ajustes",
      ],
    },
    {
      titulo: "Design de Sobrancelhas Natural",
      slug: "design-sobrancelhas-natural",
      categoriaSlug: "sobrancelha",
      descricaoCurta:
        "Marcação, limpeza e finalização com desenho natural, sem afinar demais.",
      descricaoCompleta:
        "Aprenda a medir, preencher falhas, limpar excessos e finalizar sobrancelhas mantendo a expressão do rosto. O tutorial traz exemplos de formatos e cuidados para evitar marcações artificiais.",
      preco: 119.9,
      precoPromocional: 79.9,
      cupomDesconto: "SOBR10",
      destaquePromocional: true,
      imagemCapaUrl: imagens.sobrancelha,
      nivel: "INTERMEDIARIO" as const,
      cidade: "São Bernardo do Campo",
      estado: "SP",
      distanciaKm: 18,
      modulos: [
        "Mapeamento do rosto",
        "Limpeza e simetria",
        "Preenchimento leve",
        "Finalização e manutenção",
      ],
    },
    {
      titulo: "Finalização de Cabelo com Movimento",
      slug: "finalizacao-cabelo-movimento",
      categoriaSlug: "cabelo",
      descricaoCurta:
        "Escova, ondas e finalização polida para cabelo solto com movimento.",
      descricaoCompleta:
        "Um passo a passo para preparar os fios, escolher temperatura, criar ondas suaves e finalizar sem rigidez. Ideal para quem quer resultado de salão com ferramentas comuns.",
      preco: 139.9,
      precoPromocional: null,
      cupomDesconto: null,
      destaquePromocional: false,
      imagemCapaUrl: imagens.cabelo,
      nivel: "INTERMEDIARIO" as const,
      cidade: "Guarulhos",
      estado: "SP",
      distanciaKm: 24,
      modulos: [
        "Preparação térmica",
        "Escova base",
        "Ondas com movimento",
        "Fixação leve",
      ],
    },
    {
      titulo: "Unhas Minimalistas de Salão",
      slug: "unhas-minimalistas-salao",
      categoriaSlug: "unhas",
      descricaoCurta:
        "Técnicas limpas para esmaltação elegante, francesinha fina e acabamento durável.",
      descricaoCompleta:
        "Aprenda preparo, cutícula, esmaltação uniforme, francesinha fina e selagem. O curso foi pensado para clientes que querem acabamento sofisticado sem decorações exageradas.",
      preco: 109.9,
      precoPromocional: 69.9,
      cupomDesconto: "UNHAS15",
      destaquePromocional: true,
      imagemCapaUrl: imagens.unhas,
      nivel: "INICIANTE" as const,
      cidade: "Osasco",
      estado: "SP",
      distanciaKm: 19,
      modulos: [
        "Preparo da unha",
        "Esmaltação uniforme",
        "Francesinha fina",
        "Selagem e durabilidade",
      ],
    },
    {
      titulo: "Beleza para Noivas sem Exagero",
      slug: "beleza-noivas-sem-exagero",
      categoriaSlug: "noivas",
      descricaoCurta:
        "Pele, cabelo e escolhas de estilo para uma noiva clássica e leve.",
      descricaoCompleta:
        "Um roteiro completo para definir referências, testar maquiagem, escolher finalização de cabelo e montar um cronograma de beleza para o dia da cerimônia com calma e bom gosto.",
      preco: 199.9,
      precoPromocional: 159.9,
      cupomDesconto: "NOIVA25",
      destaquePromocional: true,
      imagemCapaUrl: imagens.noivas,
      nivel: "AVANCADO" as const,
      cidade: "Campinas",
      estado: "SP",
      distanciaKm: 93,
      modulos: [
        "Briefing e referências",
        "Teste de maquiagem",
        "Cabelo e acessórios",
        "Cronograma do dia",
      ],
    },
  ];

  const tutoriaisCriados = [];

  for (const item of tutoriais) {
    const categoriaId = categorias.get(item.categoriaSlug);
    if (!categoriaId) continue;

    const tutorial = await prisma.tutorial.upsert({
      where: { slug: item.slug },
      update: {
        titulo: item.titulo,
        descricaoCurta: item.descricaoCurta,
        descricaoCompleta: item.descricaoCompleta,
        preco: item.preco,
        precoPromocional: item.precoPromocional,
        cupomDesconto: item.cupomDesconto,
        destaquePromocional: item.destaquePromocional,
        imagemCapaUrl: item.imagemCapaUrl,
        nivel: item.nivel,
        cidade: item.cidade,
        estado: item.estado,
        distanciaKm: item.distanciaKm,
        categoriaId,
        ativo: true,
      },
      create: {
        titulo: item.titulo,
        slug: item.slug,
        descricaoCurta: item.descricaoCurta,
        descricaoCompleta: item.descricaoCompleta,
        preco: item.preco,
        precoPromocional: item.precoPromocional,
        cupomDesconto: item.cupomDesconto,
        destaquePromocional: item.destaquePromocional,
        imagemCapaUrl: item.imagemCapaUrl,
        nivel: item.nivel,
        cidade: item.cidade,
        estado: item.estado,
        distanciaKm: item.distanciaKm,
        categoriaId,
      },
    });

    await prisma.modulo.deleteMany({ where: { tutorialId: tutorial.id } });
    await prisma.modulo.createMany({
      data: item.modulos.map((titulo, indice) => ({
        tutorialId: tutorial.id,
        titulo,
        ordem: indice + 1,
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        duracaoMinutos: 8 + indice * 3,
        gratuito: indice === 0,
      })),
    });

    tutoriaisCriados.push(tutorial);
  }

  if (tutoriaisCriados[0]) {
    await prisma.comentario.upsert({
      where: {
        usuarioId_tutorialId: {
          usuarioId: cliente.id,
          tutorialId: tutoriaisCriados[0].id,
        },
      },
      update: {
        nota: 5,
        texto:
          "O passo a passo é direto e o resultado fica bonito sem pesar na pele.",
      },
      create: {
        usuarioId: cliente.id,
        tutorialId: tutoriaisCriados[0].id,
        nota: 5,
        texto:
          "O passo a passo é direto e o resultado fica bonito sem pesar na pele.",
      },
    });

    const pedidoExistente = await prisma.pedido.findFirst({
      where: { idTransacaoGateway: "SEED-CLIENTE-APROVADO" },
    });

    if (!pedidoExistente) {
      await prisma.pedido.create({
        data: {
          usuarioId: cliente.id,
          status: "APROVADO",
          valorTotal: tutoriaisCriados[0].precoPromocional || tutoriaisCriados[0].preco,
          idTransacaoGateway: "SEED-CLIENTE-APROVADO",
          itens: {
            create: {
              tutorialId: tutoriaisCriados[0].id,
              precoUnitario:
                tutoriaisCriados[0].precoPromocional || tutoriaisCriados[0].preco,
            },
          },
        },
      });
    }
  }

  // Cupom de desconto LIL0102 — 10% de desconto, válido por 7 dias
  await prisma.cupom.upsert({
    where: { codigo: "LIL0102" },
    update: { descontoPercentual: 10, ativo: true, validoAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    create: { codigo: "LIL0102", descontoPercentual: 10, ativo: true, validoAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  console.log("Seed concluído.");
  console.log(`Admin: ${admin.email} / senha: Admin123`);
  console.log("Cliente: cliente@studioglow.com.br / senha: Cliente123");
  console.log("Cupom: LIL0102 (10% desconto, 7 dias)");
  console.log(`${tutoriaisCriados.length} anúncios de teste disponíveis.`);
}

semear()
  .catch((erro) => {
    console.error("Erro no seed:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
