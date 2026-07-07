import { NextRequest, NextResponse } from "next/server";
import {
  verificarAccessToken,
  verificarRefreshToken,
  type PayloadToken,
} from "@/lib/jwt";

const rotasPublicas = [
  "/",
  "/tutoriais",
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/redefinir-senha",
  "/verificar-email",
  "/politica-de-privacidade",
  "/termos-de-uso",
  "/api/auth/login",
  "/api/auth/cadastro",
  "/api/auth/recuperar-senha",
  "/api/auth/redefinir-senha",
  "/api/auth/verificar-email",
  "/api/auth/renovar-token",
  "/api/webhooks/pagamento",
];

const prefixosEstaticos = [
  "/_next",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
  "/marca",
  "/api/upload",
];

function ehRotaPublica(caminho: string, metodo: string): boolean {
  if (prefixosEstaticos.some((p) => caminho.startsWith(p))) {
    return true;
  }

  const metodoLeitura = metodo === "GET" || metodo === "HEAD";
  if (
    metodoLeitura &&
    (caminho === "/api/tutoriais" ||
      caminho.startsWith("/api/tutoriais/") ||
      caminho === "/api/anuncios" ||
      caminho === "/api/aviso-topo" ||
      caminho === "/api/categorias" ||
      caminho.startsWith("/api/categorias/") ||
      caminho.startsWith("/api/cep/"))
  ) {
    return true;
  }

  return rotasPublicas.some(
    (rota) =>
      caminho === rota ||
      (rota !== "/" && caminho.startsWith(rota + "/")) ||
      caminho.startsWith("/tutoriais/")
  );
}

function obterPayloadPeloAccessToken(request: NextRequest): PayloadToken | null {
  const authHeader = request.headers.get("authorization");
  const tokenHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const tokenCookie = request.cookies.get("accessToken")?.value;
  const token = tokenHeader || tokenCookie;

  if (!token) return null;

  try {
    return verificarAccessToken(token);
  } catch {
    return null;
  }
}

function obterPayloadPeloRefreshToken(request: NextRequest): PayloadToken | null {
  const token = request.cookies.get("refreshToken")?.value;

  if (!token) return null;

  try {
    return verificarRefreshToken(token);
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rotaApi = pathname.startsWith("/api/");

  if (ehRotaPublica(pathname, request.method)) {
    return NextResponse.next();
  }

  const payloadAccess = obterPayloadPeloAccessToken(request);
  const payload = rotaApi
    ? payloadAccess
    : payloadAccess ?? obterPayloadPeloRefreshToken(request);

  if (!payload) {
    if (!rotaApi) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-usuario-id", payload.usuarioId);
  requestHeaders.set("x-usuario-email", payload.email);
  requestHeaders.set("x-usuario-papel", payload.papel);

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (payload.papel !== "ADMINISTRADOR") {
      if (!rotaApi) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.json(
        { erro: "Acesso restrito a administradores" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|marca).*)"],
};
