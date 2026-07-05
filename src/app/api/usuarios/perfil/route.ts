import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { removerCookieRefreshToken } from "@/lib/jwt";
import type { RespostaApi } from "@/tipos";

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        papel: true,
        emailVerificado: true,
        fotoPerfilUrl: true,
        whatsapp: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { sucesso: false, erro: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: usuario });
  } catch (erro) {
    console.error("Erro ao buscar perfil:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao buscar perfil." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const { nomeCompleto, whatsapp, fotoPerfilUrl } = await request.json();

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(nomeCompleto && { nomeCompleto }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(fotoPerfilUrl !== undefined && { fotoPerfilUrl }),
      },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        papel: true,
        emailVerificado: true,
        fotoPerfilUrl: true,
        whatsapp: true,
      },
    });

    return NextResponse.json({ sucesso: true, dados: usuario });
  } catch (erro) {
    console.error("Erro ao atualizar perfil:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao atualizar perfil." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      const conversas = await tx.conversa.findMany({
        where: { usuarioId },
        select: { id: true },
      });
      const conversaIds = conversas.map((conversa) => conversa.id);

      const mensagens = await tx.mensagem.findMany({
        where: {
          OR: [
            { remetenteId: usuarioId },
            ...(conversaIds.length > 0 ? [{ conversaId: { in: conversaIds } }] : []),
          ],
        },
        select: { id: true },
      });
      const mensagemIds = mensagens.map((mensagem) => mensagem.id);

      if (mensagemIds.length > 0) {
        await tx.anexoMensagem.deleteMany({ where: { mensagemId: { in: mensagemIds } } });
        await tx.mensagem.deleteMany({ where: { id: { in: mensagemIds } } });
      }

      if (conversaIds.length > 0) {
        await tx.conversa.deleteMany({ where: { id: { in: conversaIds } } });
      }

      await tx.anexoComentario.deleteMany({
        where: { comentario: { usuarioId } },
      });
      await tx.comentario.deleteMany({ where: { usuarioId } });

      const pedidos = await tx.pedido.findMany({
        where: { usuarioId },
        select: { id: true },
      });
      const pedidoIds = pedidos.map((pedido) => pedido.id);
      if (pedidoIds.length > 0) {
        await tx.itemPedido.deleteMany({ where: { pedidoId: { in: pedidoIds } } });
        await tx.pedido.deleteMany({ where: { id: { in: pedidoIds } } });
      }

      await tx.formaPagamento.deleteMany({ where: { usuarioId } });
      await tx.endereco.deleteMany({ where: { usuarioId } });
      await tx.usuario.delete({ where: { id: usuarioId } });
    });

    await removerCookieRefreshToken();

    return NextResponse.json({
      sucesso: true,
      mensagem: "Conta excluída com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao excluir conta:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao excluir conta." },
      { status: 500 }
    );
  }
}
