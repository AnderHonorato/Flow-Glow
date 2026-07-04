import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { esquemaLogin } from "@/lib/validacao";
import { gerarAccessToken, gerarRefreshToken, definirCookieRefreshToken } from "@/lib/jwt";
import type { RespostaApi } from "@/tipos";

// Limite de 5 tentativas de login a cada 15 minutos para prevenir força bruta.
const MAXIMO_TENTATIVAS = 5;
const JANELA_TENTATIVAS_MINUTOS = 15;

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const corpo = await request.json();
    const validacao = esquemaLogin.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: validacao.error.issues[0]?.message || "Dados inválidos",
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

    // Verifica se o usuário está bloqueado por excesso de tentativas.
    if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
      const minutosRestantes = Math.ceil(
        (usuario.bloqueadoAte.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          sucesso: false,
          erro: `Conta temporariamente bloqueada. Tente novamente em ${minutosRestantes} minuto(s).`,
        },
        { status: 429 }
      );
    }

    // Compara a senha com o hash armazenado.
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
      // Incrementa o contador de tentativas de login falhas.
      const tentativas = usuario.tentativasLogin + 1;

      if (tentativas >= MAXIMO_TENTATIVAS) {
        // Bloqueia a conta por 15 minutos.
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            tentativasLogin: tentativas,
            bloqueadoAte: new Date(Date.now() + JANELA_TENTATIVAS_MINUTOS * 60 * 1000),
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
        data: { tentativasLogin: tentativas },
      });

      return NextResponse.json(
        { sucesso: false, erro: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Login bem-sucedido — reseta o contador de tentativas.
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tentativasLogin: 0, bloqueadoAte: null },
    });

    const payload = {
      usuarioId: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
    };

    const accessToken = gerarAccessToken(payload);
    const refreshToken = gerarRefreshToken(payload);
    await definirCookieRefreshToken(refreshToken);

    return NextResponse.json({
      sucesso: true,
      dados: {
        accessToken,
        usuario: {
          id: usuario.id,
          nomeCompleto: usuario.nomeCompleto,
          email: usuario.email,
          papel: usuario.papel,
          emailVerificado: usuario.emailVerificado,
          fotoPerfilUrl: usuario.fotoPerfilUrl,
          whatsapp: usuario.whatsapp,
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
