import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  carregarConversaPorId,
  criarMensagemChat,
  serializarConversa,
} from "@/lib/chat";
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

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const papel = request.headers.get("x-usuario-papel");
    const adminId = request.headers.get("x-usuario-id");
    if (papel !== "ADMINISTRADOR" || !adminId) {
      return NextResponse.json({ sucesso: false, erro: "Acesso restrito." }, { status: 403 });
    }

    const admin = await prisma.usuario.findUnique({
      where: { id: adminId },
      select: { nomeCompleto: true },
    });
    const nomeAdmin = admin?.nomeCompleto || "Atendente";

    const corpo = await request.json();
    const conversaId = String(corpo.conversaId || "");
    const acao = String(corpo.acao || "responder");

    if (!conversaId) {
      return NextResponse.json({ sucesso: false, erro: "Conversa nao informada." }, { status: 400 });
    }

    const conversa = await prisma.conversa.findUnique({
      where: { id: conversaId },
      select: { id: true, status: true, atendenteId: true },
    });

    if (!conversa) {
      return NextResponse.json({ sucesso: false, erro: "Conversa nao encontrada." }, { status: 404 });
    }

    if (conversa.status === "ENCERRADA" && acao !== "reabrir") {
      return NextResponse.json({ sucesso: false, erro: "Atendimento encerrado." }, { status: 409 });
    }

    if (acao === "iniciar") {
      if (conversa.atendenteId && conversa.atendenteId !== adminId) {
        return NextResponse.json(
          { sucesso: false, erro: "Outro atendente ja iniciou este protocolo." },
          { status: 409 }
        );
      }

      await prisma.conversa.update({
        where: { id: conversaId },
        data: {
          status: "EM_ATENDIMENTO",
          atendenteId: adminId,
          atendimentoIniciadoEm: new Date(),
          clienteAguardandoDesde: null,
        },
      });
      await criarMensagemChat({
        conversaId,
        tipo: "SISTEMA",
        texto: `${nomeAdmin} entrou na conversa e iniciou o atendimento.`,
      });
    } else if (acao === "transferir") {
      if (conversa.atendenteId !== adminId) {
        return NextResponse.json(
          { sucesso: false, erro: "Somente o atendente atual pode transferir." },
          { status: 403 }
        );
      }

      await prisma.conversa.update({
        where: { id: conversaId },
        data: {
          status: "AGUARDANDO_ATENDENTE",
          atendenteId: null,
          clienteAguardandoDesde: new Date(),
        },
      });
      await criarMensagemChat({
        conversaId,
        tipo: "SISTEMA",
        texto: `${nomeAdmin} transferiu este atendimento para a fila.`,
      });
    } else if (acao === "encerrar") {
      if (conversa.atendenteId && conversa.atendenteId !== adminId) {
        return NextResponse.json(
          { sucesso: false, erro: "Somente o atendente atual pode encerrar." },
          { status: 403 }
        );
      }

      await prisma.conversa.update({
        where: { id: conversaId },
        data: {
          status: "ENCERRADA",
          encerradoEm: new Date(),
          encerradoPor: nomeAdmin,
        },
      });
      await criarMensagemChat({
        conversaId,
        tipo: "SISTEMA",
        texto:
          "Atendimento encerrado. Um questionario de experiencia com estrelas foi liberado para o cliente.",
      });
    } else {
      const texto = String(corpo.texto || "").trim();
      const anexos = anexosValidos(corpo.anexos);
      if (!texto && anexos.length === 0) {
        return NextResponse.json({ sucesso: false, erro: "Mensagem vazia." }, { status: 400 });
      }

      if (conversa.status !== "EM_ATENDIMENTO" || conversa.atendenteId !== adminId) {
        return NextResponse.json(
          { sucesso: false, erro: "Clique em iniciar atendimento antes de responder." },
          { status: 403 }
        );
      }

      await criarMensagemChat({
        conversaId,
        texto: texto || "Anexo enviado.",
        tipo: "ATENDENTE",
        remetenteId: adminId,
        anexos,
      });
    }

    const atualizada = await carregarConversaPorId(conversaId);
    return NextResponse.json({
      sucesso: true,
      dados: atualizada ? await serializarConversa(atualizada) : null,
    });
  } catch (erro) {
    console.error("Erro no chat admin:", erro);
    return NextResponse.json({ sucesso: false, erro: "Erro ao processar atendimento." }, { status: 500 });
  }
}
