import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buscarConversaAtivaDoCliente,
  buscarOuCriarConversaAtiva,
  carregarConversaPorId,
  criarConversaAtendimento,
  criarMensagemChat,
  includeConversaChat,
  serializarConversa,
  serializarConversas,
  sincronizarInatividade,
  textoProtocoloAberto,
} from "@/lib/chat";
import {
  deveTransferirParaHumano,
  gerarRespostaAlphaBot,
  perguntaSobreDesenvolvedor,
  textoContatosDesenvolvedor,
} from "@/lib/alphabot";
import type { RespostaApi } from "@/tipos";

type AnexoEntrada = { tipo: "IMAGEM" | "VIDEO"; url: string };

function anexosValidos(anexos: unknown): AnexoEntrada[] {
  if (!Array.isArray(anexos)) return [];
  return anexos
    .filter((anexo): anexo is AnexoEntrada => {
      if (!anexo || typeof anexo !== "object") return false;
      const item = anexo as Record<string, unknown>;
      return (
        (item.tipo === "IMAGEM" || item.tipo === "VIDEO") &&
        typeof item.url === "string" &&
        item.url.length > 0
      );
    })
    .slice(0, 4);
}

async function carregarListaCliente(usuarioId: string) {
  await sincronizarInatividade();
  const conversas = await prisma.conversa.findMany({
    where: { usuarioId },
    include: includeConversaChat,
    orderBy: { atualizadoEm: "desc" },
    take: 5,
  });
  return serializarConversas(conversas);
}

async function abrirProtocoloHumano({
  conversaId,
  protocolo,
  assunto,
  agora,
}: {
  conversaId: string;
  protocolo: string;
  assunto: string;
  agora: Date;
}) {
  await criarMensagemChat({
    conversaId,
    tipo: "BOT",
    texto: textoProtocoloAberto(protocolo),
  });

  await prisma.conversa.update({
    where: { id: conversaId },
    data: {
      status: "AGUARDANDO_ATENDENTE",
      assunto: assunto || "Atendimento solicitado",
      clienteAguardandoDesde: agora,
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    await sincronizarInatividade();
    const corpo = await request.json();
    const acao = String(corpo.acao || "mensagem");

    if (acao === "novo") {
      const conversa = await criarConversaAtendimento(usuarioId);
      return NextResponse.json(
        { sucesso: true, dados: await serializarConversa(conversa) },
        { status: 201 }
      );
    }

    if (acao === "avaliar") {
      const conversaId = String(corpo.conversaId || "");
      const nota = Number(corpo.nota);
      const texto = String(corpo.texto || "").trim();
      if (!conversaId || !Number.isInteger(nota) || nota < 1 || nota > 5) {
        return NextResponse.json({ sucesso: false, erro: "Avaliação inválida." }, { status: 400 });
      }

      const conversa = await prisma.conversa.findFirst({
        where: { id: conversaId, usuarioId },
        select: { id: true, status: true, avaliacaoNota: true },
      });

      if (!conversa || conversa.status !== "ENCERRADA") {
        return NextResponse.json(
          { sucesso: false, erro: "A avaliação fica disponível após o encerramento." },
          { status: 400 }
        );
      }

      await prisma.conversa.update({
        where: { id: conversaId },
        data: {
          avaliacaoNota: nota,
          avaliacaoTexto: texto || null,
          avaliacaoEnviadaEm: new Date(),
        },
      });

      if (!conversa.avaliacaoNota) {
        await criarMensagemChat({
          conversaId,
          tipo: "SISTEMA",
          texto: `Cliente avaliou o atendimento com ${nota} estrela(s).`,
        });
      }

      const atualizada = await carregarConversaPorId(conversaId);
      return NextResponse.json({
        sucesso: true,
        dados: atualizada ? await serializarConversa(atualizada) : null,
      });
    }

    const texto = String(corpo.texto || "").trim();
    const anexos = anexosValidos(corpo.anexos);
    if (!texto && anexos.length === 0) {
      return NextResponse.json({ sucesso: false, erro: "Mensagem vazia." }, { status: 400 });
    }

    let conversa = await buscarConversaAtivaDoCliente(usuarioId);
    if (!conversa) {
      conversa = await buscarOuCriarConversaAtiva(usuarioId);
    }

    if (conversa.status === "ENCERRADA") {
      return NextResponse.json(
        { sucesso: false, erro: "Atendimento encerrado. Abra um novo chamado pelo botão +." },
        { status: 409 }
      );
    }

    await criarMensagemChat({
      conversaId: conversa.id,
      texto: texto || "Anexo enviado.",
      tipo: "CLIENTE",
      remetenteId: usuarioId,
      anexos,
    });

    const agora = new Date();
    await prisma.conversa.update({
      where: { id: conversa.id },
      data: {
        ultimaInteracaoClienteEm: agora,
        avisoInatividadeEm: null,
      },
    });

    if (conversa.status === "TRIAGEM") {
      if (perguntaSobreDesenvolvedor(texto)) {
        await criarMensagemChat({
          conversaId: conversa.id,
          tipo: "BOT",
          texto: textoContatosDesenvolvedor(),
        });
      } else if (deveTransferirParaHumano(texto)) {
        await abrirProtocoloHumano({
          conversaId: conversa.id,
          protocolo: conversa.protocolo,
          assunto: "Atendimento solicitado pelo cliente",
          agora,
        });
      } else {
        const respostaBot = await gerarRespostaAlphaBot({
          texto,
          usuarioId,
          historico: conversa.mensagens.map((mensagem) => ({
            tipo: mensagem.tipo,
            texto: mensagem.texto,
          })),
        });

        if (respostaBot.transferir) {
          await abrirProtocoloHumano({
            conversaId: conversa.id,
            protocolo: conversa.protocolo,
            assunto: respostaBot.assunto || "Atendimento solicitado",
            agora,
          });
        } else {
          await criarMensagemChat({
            conversaId: conversa.id,
            tipo: "BOT",
            texto: respostaBot.texto,
          });
        }
      }
    }

    const atualizada = await carregarConversaPorId(conversa.id);
    return NextResponse.json(
      { sucesso: true, dados: atualizada ? await serializarConversa(atualizada) : null },
      { status: 201 }
    );
  } catch (erro) {
    console.error("Erro ao enviar mensagem:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao enviar mensagem." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    const usuarioPapel = request.headers.get("x-usuario-papel");

    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    await sincronizarInatividade();
    const { searchParams } = request.nextUrl;
    const conversaId = searchParams.get("conversaId");

    if (usuarioPapel === "ADMINISTRADOR") {
      const conversas = await prisma.conversa.findMany({
        where: conversaId ? { id: conversaId } : {},
        include: includeConversaChat,
        orderBy: [{ status: "asc" }, { atualizadoEm: "desc" }],
        take: conversaId ? 1 : 200,
      });
      return NextResponse.json({ sucesso: true, dados: await serializarConversas(conversas) });
    }

    if (conversaId) {
      const conversa = await prisma.conversa.findFirst({
        where: { id: conversaId, usuarioId },
        include: includeConversaChat,
      });
      return NextResponse.json({
        sucesso: true,
        dados: conversa ? [await serializarConversa(conversa)] : [],
      });
    }

    return NextResponse.json({ sucesso: true, dados: await carregarListaCliente(usuarioId) });
  } catch (erro) {
    console.error("Erro ao buscar conversas:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao carregar conversas." },
      { status: 500 }
    );
  }
}
