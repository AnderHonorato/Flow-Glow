import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { esquemaCadastro } from "@/lib/validacao";
import { gerarAccessToken, gerarRefreshToken, definirCookieRefreshToken } from "@/lib/jwt";
import { ProvedorDeEmailPlaceholder } from "@/lib/email";
import type { RespostaApi } from "@/tipos";

const provedorEmail = new ProvedorDeEmailPlaceholder();

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const persistirSessao = request.headers.get("x-preferencias-permitidas") === "sim";
    const corpo = await request.json();
    const validacao = esquemaCadastro.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: validacao.error.issues[0]?.message || "Dados inválidos",
        },
        { status: 400 }
      );
    }

    const { nomeCompleto, cpf, email, senha, cep, logradouro, numero, complemento, bairro, cidade, estado } = validacao.data;

    // Verifica se o e-mail já está cadastrado.
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { sucesso: false, erro: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    // Hash da senha com bcrypt (fator de custo 12).
    const senhaHash = await bcrypt.hash(senha, 12);

    // Token de verificação de e-mail — gerado com crypto aleatório seguro.
    const tokenVerificacao = crypto.randomBytes(32).toString("hex");

    const usuario = await prisma.usuario.create({
      data: {
        nomeCompleto,
        cpf,
        email,
        senhaHash,
        tokenVerificacaoEmail: tokenVerificacao,
        endereco: {
          create: { cep, logradouro, numero, complemento: complemento || null, bairro, cidade, estado },
        },
      },
    });

    // Envia e-mail de verificação (placeholder — será substituído pelo provedor real).
    await provedorEmail.enviarVerificacao({
      para: usuario.email,
      nome: usuario.nomeCompleto,
      token: tokenVerificacao,
    });

    // Gera tokens JWT e define o refresh token como cookie httpOnly.
    const payload = {
      usuarioId: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
    };

    const accessToken = gerarAccessToken(payload);
    const refreshToken = gerarRefreshToken(payload);
    await definirCookieRefreshToken(refreshToken, persistirSessao);

    return NextResponse.json(
      {
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
        mensagem:
          "Conta criada com sucesso! Verifique seu e-mail para ativar a conta.",
      },
      { status: 201 }
    );
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}
