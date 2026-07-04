import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { esquemaNovaSenha } from "@/lib/validacao";
import type { RespostaApi } from "@/tipos";

// Valida o token de recuperação e redefine a senha.
// O token é comparado via bcrypt.compare — nunca armazenado em texto puro.
export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const corpo = await request.json();
    const validacao = esquemaNovaSenha.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: validacao.error.issues[0]?.message || "Dados inválidos",
        },
        { status: 400 }
      );
    }

    const { token, senha } = validacao.data;

    // Busca todos os usuários que têm um token de recuperação pendente
    // (não expirado). A comparação do hash é feita em memória porque
    // não podemos buscar por hash diretamente.
    const usuariosComToken = await prisma.usuario.findMany({
      where: {
        tokenRecuperacaoHash: { not: null },
        tokenRecuperacaoExpiraEm: { gt: new Date() },
      },
    });

    let usuarioEncontrado = null;

    // Compara o token informado com cada hash armazenado.
    for (const usuario of usuariosComToken) {
      if (!usuario.tokenRecuperacaoHash) continue;
      const tokenValido = await bcrypt.compare(token, usuario.tokenRecuperacaoHash);
      if (tokenValido) {
        usuarioEncontrado = usuario;
        break;
      }
    }

    if (!usuarioEncontrado) {
      return NextResponse.json(
        { sucesso: false, erro: "Token inválido ou expirado." },
        { status: 400 }
      );
    }

    // Atualiza a senha e invalida o token de recuperação.
    const senhaHash = await bcrypt.hash(senha, 12);

    await prisma.usuario.update({
      where: { id: usuarioEncontrado.id },
      data: {
        senhaHash,
        tokenRecuperacaoHash: null,
        tokenRecuperacaoExpiraEm: null,
        tentativasLogin: 0,
        bloqueadoAte: null,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Senha redefinida com sucesso! Você já pode fazer login.",
    });
  } catch (erro) {
    console.error("Erro na redefinição de senha:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao redefinir senha." },
      { status: 500 }
    );
  }
}
