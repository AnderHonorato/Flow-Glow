import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  criarConversaAtendimento,
  criarMensagemChat,
  serializarConversa,
  textoProtocoloAberto,
} from "@/lib/chat";
import type { RespostaApi } from "@/tipos";

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado." }, { status: 401 });
    }

    const { pedidoId, descricao, fotos, videos } = await request.json();
    if (!pedidoId || !descricao?.trim()) {
      return NextResponse.json(
        { sucesso: false, erro: "Informe o pedido e a descrição do problema." },
        { status: 400 }
      );
    }

    const pedido = await prisma.pedido.findFirst({
      where: { id: pedidoId, usuarioId },
      include: { itens: { include: { tutorial: { select: { titulo: true } } } } },
    });

    if (!pedido) {
      return NextResponse.json(
        { sucesso: false, erro: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    if (pedido.criadoEm < tresMesesAtras) {
      return NextResponse.json(
        { sucesso: false, erro: "O prazo de 3 meses para reportar problemas expirou." },
        { status: 400 }
      );
    }

    const nomesItens = pedido.itens.map((i) => i.tutorial.titulo).join(", ");
    const conversa = await criarConversaAtendimento(usuarioId);

    await prisma.conversa.update({
      where: { id: conversa.id },
      data: {
        status: "AGUARDANDO_ATENDENTE",
        assunto: `Problema com produto - Pedido #${pedido.id.slice(0, 8)}`,
        clienteAguardandoDesde: new Date(),
      },
    });

    const textoMensagem = `**Relato de problema**\n\nPedido: #${pedido.id.slice(0, 8)}\nItens: ${nomesItens}\nValor: R$ ${Number(pedido.valorTotal).toFixed(2)}\n\nDescrição: ${descricao.trim()}`;

    await criarMensagemChat({
      conversaId: conversa.id,
      texto: textoMensagem,
      tipo: "CLIENTE",
      remetenteId: usuarioId,
      anexos: [
        ...(fotos || []).map((url: string) => ({ tipo: "IMAGEM" as const, url })),
        ...(videos || []).map((url: string) => ({ tipo: "VIDEO" as const, url })),
      ],
    });

    await criarMensagemChat({
      conversaId: conversa.id,
      tipo: "BOT",
      texto: textoProtocoloAberto(conversa.protocolo),
    });

    const atualizada = await prisma.conversa.findUnique({
      where: { id: conversa.id },
      include: {
        usuario: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, email: true } },
        atendente: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, email: true } },
        mensagens: {
          include: {
            remetente: { select: { id: true, nomeCompleto: true, fotoPerfilUrl: true, papel: true } },
            anexos: true,
          },
          orderBy: { criadoEm: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        sucesso: true,
        dados: {
          protocolo: conversa.protocolo,
          conversa: atualizada ? await serializarConversa(atualizada as any) : null,
        },
      },
      { status: 201 }
    );
  } catch (erro) {
    console.error("Erro ao reportar problema:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao abrir protocolo de problema." },
      { status: 500 }
    );
  }
}
