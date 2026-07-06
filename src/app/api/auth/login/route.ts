import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { esquemaLogin } from "@/lib/validacao";
import { gerarAccessToken, gerarRefreshToken, definirCookieRefreshToken } from "@/lib/jwt";
import type { RespostaApi } from "@/tipos";

const MAXIMO_TENTATIVAS = 5;
const JANELA_TENTATIVAS_MINUTOS = 15;

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const persistirSessao = request.headers.get("x-preferencias-permitidas") === "sim";
    const corpo = await request.json();
    const validacao = esquemaLogin.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: validacao.error.issues[0]?.message || "Dados invalidos",
        },
        { status: 400 }
      );
    }

    const { email, senha } = validacao.data;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json(
        { sucesso: false, erro: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const agora = new Date();
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
      if (usuario.bloqueadoAte && usuario.bloqueadoAte > agora) {
        const minutosRestantes = Math.ceil(
          (usuario.bloqueadoAte.getTime() - agora.getTime()) / 60000
        );
        return NextResponse.json(
          {
            sucesso: false,
            erro: `Conta temporariamente bloqueada. Tente novamente em ${minutosRestantes} minuto(s).`,
          },
          { status: 429 }
        );
      }

      const tentativas =
        usuario.bloqueadoAte && usuario.bloqueadoAte <= agora
          ? 1
          : usuario.tentativasLogin + 1;

      if (tentativas >= MAXIMO_TENTATIVAS) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            tentativasLogin: tentativas,
            bloqueadoAte: new Date(
              agora.getTime() + JANELA_TENTATIVAS_MINUTOS * 60 * 1000
            ),
          },
        });

        return NextResponse.json(
          {
            sucesso: false,
            erro: "Conta bloqueada por excesso de tentativas. Aguarde 15 minutos.",
          },
          { status: 429 }
        );
      }

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { tentativasLogin: tentativas, bloqueadoAte: null },
      });

      return NextResponse.json(
        { sucesso: false, erro: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tentativasLogin: 0, bloqueadoAte: null },
    });

    const payload = {
      usuarioId: usuarioAtualizado.id,
      email: usuarioAtualizado.email,
      papel: usuarioAtualizado.papel,
    };

    const accessToken = gerarAccessToken(payload);
    const refreshToken = gerarRefreshToken(payload);
    await definirCookieRefreshToken(refreshToken, persistirSessao);

    return NextResponse.json({
      sucesso: true,
      dados: {
        accessToken,
        usuario: {
          id: usuarioAtualizado.id,
          nomeCompleto: usuarioAtualizado.nomeCompleto,
          apelido: usuarioAtualizado.apelido,
          cpf: usuarioAtualizado.cpf,
          email: usuarioAtualizado.email,
          papel: usuarioAtualizado.papel,
          emailVerificado: usuarioAtualizado.emailVerificado,
          fotoPerfilUrl: usuarioAtualizado.fotoPerfilUrl,
          whatsapp: usuarioAtualizado.whatsapp,
          telefone: usuarioAtualizado.telefone,
          dataNascimento: usuarioAtualizado.dataNascimento?.toISOString() || null,
          genero: usuarioAtualizado.genero,
          profissao: usuarioAtualizado.profissao,
        },
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao fazer login. Tente novamente." },
      { status: 500 }
    );
  }
}
