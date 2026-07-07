import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { esquemaCadastro } from "@/lib/validacao";
import { gerarAccessToken, gerarRefreshToken, definirCookieRefreshToken, definirCookieAccessToken } from "@/lib/jwt";
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

    const {
      nomeCompleto,
      apelido,
      cpf,
      email,
      whatsapp,
      telefone,
      dataNascimento,
      genero,
      profissao,
      senha,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
    } = validacao.data;

    const usuarioExistente = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { cpf }] },
      select: { email: true, cpf: true },
    });

    if (usuarioExistente?.email === email) {
      return NextResponse.json(
        { sucesso: false, erro: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    if (usuarioExistente?.cpf === cpf) {
      return NextResponse.json(
        { sucesso: false, erro: "Este CPF já está cadastrado." },
        { status: 409 }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const tokenVerificacao = crypto.randomBytes(32).toString("hex");

    const usuario = await prisma.usuario.create({
      data: {
        nomeCompleto,
        apelido: apelido || null,
        cpf,
        email,
        senhaHash,
        whatsapp,
        telefone: telefone || null,
        dataNascimento: new Date(`${dataNascimento}T00:00:00.000Z`),
        genero: genero || null,
        profissao: profissao || null,
        tokenVerificacaoEmail: tokenVerificacao,
        endereco: {
          create: {
            cep,
            logradouro,
            numero,
            complemento: complemento || null,
            bairro,
            cidade,
            estado,
          },
        },
      },
    });

    await provedorEmail.enviarVerificacao({
      para: usuario.email,
      nome: usuario.nomeCompleto,
      token: tokenVerificacao,
    });

    const payload = {
      usuarioId: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
    };

    const accessToken = gerarAccessToken(payload);
    const refreshToken = gerarRefreshToken(payload);
    await definirCookieAccessToken(accessToken);
    await definirCookieRefreshToken(refreshToken, persistirSessao);

    return NextResponse.json(
      {
        sucesso: true,
        dados: {
          accessToken,
          usuario: {
            id: usuario.id,
            nomeCompleto: usuario.nomeCompleto,
            apelido: usuario.apelido,
            cpf: usuario.cpf,
            email: usuario.email,
            papel: usuario.papel,
            emailVerificado: usuario.emailVerificado,
            fotoPerfilUrl: usuario.fotoPerfilUrl,
            whatsapp: usuario.whatsapp,
            telefone: usuario.telefone,
            dataNascimento: usuario.dataNascimento?.toISOString() || null,
            genero: usuario.genero,
            profissao: usuario.profissao,
          },
        },
        mensagem: "Conta criada com sucesso! Verifique seu e-mail para ativar a conta.",
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
