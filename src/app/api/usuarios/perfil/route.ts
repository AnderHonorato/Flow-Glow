import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { removerCookieRefreshToken } from "@/lib/jwt";
import { esquemaPerfil } from "@/lib/validacao";
import type { RespostaApi } from "@/tipos";

const CODIGO_EMAIL_FICTICIO = "123456";

interface UsuarioPerfilResposta {
  id: string;
  nomeCompleto: string;
  apelido: string | null;
  cpf: string | null;
  email: string;
  papel: string;
  emailVerificado: boolean;
  fotoPerfilUrl: string | null;
  whatsapp: string | null;
  telefone: string | null;
  dataNascimento: Date | null;
  genero: string | null;
  profissao: string | null;
}

function selecionarUsuario() {
  return {
    id: true,
    nomeCompleto: true,
    apelido: true,
    cpf: true,
    email: true,
    papel: true,
    emailVerificado: true,
    fotoPerfilUrl: true,
    whatsapp: true,
    telefone: true,
    dataNascimento: true,
    genero: true,
    profissao: true,
  } as const;
}

function serializarUsuario(usuario: UsuarioPerfilResposta) {
  return {
    ...usuario,
    dataNascimento: usuario.dataNascimento ? usuario.dataNascimento.toISOString() : null,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) {
      return NextResponse.json({ sucesso: false, erro: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: selecionarUsuario(),
    });

    if (!usuario) {
      return NextResponse.json(
        { sucesso: false, erro: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ sucesso: true, dados: serializarUsuario(usuario) });
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

    const corpo = await request.json();
    const validacao = esquemaPerfil.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json(
        { sucesso: false, erro: validacao.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, email: true, cpf: true, senhaHash: true },
    });

    if (!usuarioAtual) {
      return NextResponse.json({ sucesso: false, erro: "Usuário não encontrado." }, { status: 404 });
    }

    const dados = validacao.data;
    const proximoCpf = dados.cpf || null;
    const emailMudou = dados.email.trim().toLowerCase() !== usuarioAtual.email;
    const cpfMudou = proximoCpf !== usuarioAtual.cpf;

    if (emailMudou && dados.codigoConfirmacaoEmail !== CODIGO_EMAIL_FICTICIO) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Para trocar o e-mail, confirme a verificação do novo endereço.",
        },
        { status: 400 }
      );
    }

    if (emailMudou) {
      const existeEmail = await prisma.usuario.findUnique({
        where: { email: dados.email.trim().toLowerCase() },
        select: { id: true },
      });
      if (existeEmail && existeEmail.id !== usuarioId) {
        return NextResponse.json(
          { sucesso: false, erro: "Este e-mail já está em uso." },
          { status: 409 }
        );
      }
    }

    if (cpfMudou && proximoCpf) {
      const existeCpf = await prisma.usuario.findUnique({
        where: { cpf: proximoCpf },
        select: { id: true },
      });
      if (existeCpf && existeCpf.id !== usuarioId) {
        return NextResponse.json(
          { sucesso: false, erro: "Este CPF já está em uso." },
          { status: 409 }
        );
      }
    }

    let senhaHash: string | undefined;
    if (dados.novaSenha) {
      if (!dados.senhaAtual) {
        return NextResponse.json(
          { sucesso: false, erro: "Informe a senha atual para trocar a senha." },
          { status: 400 }
        );
      }

      const senhaAtualValida = await bcrypt.compare(dados.senhaAtual, usuarioAtual.senhaHash);
      if (!senhaAtualValida) {
        return NextResponse.json(
          { sucesso: false, erro: "Senha atual incorreta." },
          { status: 401 }
        );
      }

      senhaHash = await bcrypt.hash(dados.novaSenha, 12);
    }

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nomeCompleto: dados.nomeCompleto,
        apelido: dados.apelido || null,
        cpf: proximoCpf,
        email: dados.email.trim().toLowerCase(),
        emailVerificado: emailMudou ? true : undefined,
        whatsapp: dados.whatsapp || null,
        telefone: dados.telefone || null,
        dataNascimento: dados.dataNascimento
          ? new Date(`${dados.dataNascimento}T00:00:00.000Z`)
          : null,
        genero: dados.genero || null,
        profissao: dados.profissao || null,
        fotoPerfilUrl: dados.fotoPerfilUrl || null,
        ...(senhaHash ? { senhaHash } : {}),
      },
      select: selecionarUsuario(),
    });

    return NextResponse.json({ sucesso: true, dados: serializarUsuario(usuario) });
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
