import jwt, { type SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";

const CHAVE_ACCESS = process.env.CHAVE_SECRETA_JWT;
const CHAVE_REFRESH = process.env.CHAVE_SECRETA_REFRESH;

if (!CHAVE_ACCESS || !CHAVE_REFRESH) {
  throw new Error(
    "Variáveis CHAVE_SECRETA_JWT e CHAVE_SECRETA_REFRESH não definidas no .env"
  );
}

export interface PayloadToken {
  usuarioId: string;
  email: string;
  papel: string;
}

export function gerarAccessToken(payload: PayloadToken): string {
  const expiresIn = (process.env.EXPIRACAO_ACCESS_TOKEN || "15min") as SignOptions["expiresIn"];
  return jwt.sign(payload, CHAVE_ACCESS!, { expiresIn });
}

export function gerarRefreshToken(payload: PayloadToken): string {
  const expiresIn = (process.env.EXPIRACAO_REFRESH_TOKEN || "7d") as SignOptions["expiresIn"];
  return jwt.sign(payload, CHAVE_REFRESH!, { expiresIn });
}

export function verificarAccessToken(token: string): PayloadToken {
  return jwt.verify(token, CHAVE_ACCESS!) as PayloadToken;
}

export function verificarRefreshToken(token: string): PayloadToken {
  return jwt.verify(token, CHAVE_REFRESH!) as PayloadToken;
}

// Define o refresh token como cookie httpOnly, secure, sameSite strict.
// Isso impede acesso via JavaScript no navegador (proteção contra XSS).
export async function definirCookieRefreshToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
  });
}

export async function removerCookieRefreshToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function obterRefreshTokenDoCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("refreshToken")?.value;
}
