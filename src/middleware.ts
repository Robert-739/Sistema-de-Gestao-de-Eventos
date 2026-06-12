import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rotasPublicas = ["/login", "/cadastro"];

const permissoesPorRota = [
  { prefixo: "/dashboard/aluno", perfil: "ALU" },
  { prefixo: "/dashboard/coordenador", perfil: "COO" },
  { prefixo: "/dashboard/diretor", perfil: "DIR" },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. REGRA DE OURO: Acessou a raiz limpa ("/")
  if (pathname === "/") {
    const resposta = NextResponse.redirect(new URL("/login", request.url));
    resposta.cookies.delete("usuario_id");
    resposta.cookies.delete("usuario_perfil");
    resposta.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return resposta;
  }

  const usuarioId = request.cookies.get("usuario_id")?.value;
  const usuarioPerfil = request.cookies.get("usuario_perfil")?.value;

  const estaLogado = !!usuarioId && !!usuarioPerfil;

  // 2. Rotas públicas (login/cadastro)
  if (rotasPublicas.some((rota) => pathname.startsWith(rota))) {
    return NextResponse.next();
  }

  // 3. Rotas protegidas do painel
  if (pathname.startsWith("/dashboard")) {
    if (!estaLogado) {
      const resposta = NextResponse.redirect(new URL("/login", request.url));
      resposta.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
      return resposta;
    }

    const regraRota = permissoesPorRota.find((item) => pathname.startsWith(item.prefixo));

    // Se o perfil tentar invadir rota alheia, desloga e joga pro login
    if (regraRota && usuarioPerfil !== regraRota.perfil) {
      const resposta = NextResponse.redirect(new URL("/login", request.url));
      resposta.cookies.delete("usuario_id");
      resposta.cookies.delete("usuario_perfil");
      resposta.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
      return resposta;
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * 🔥 CORREÇÃO DO MATCHER AQUI:
   * Aplica o middleware em todas as rotas do sistema, EXCETO:
   * - api (todas as rotas dentro de /api, como /api/presenca e /api/certificado)
   * - _next/static (arquivos estáticos de build)
   * - _next/image (imagens otimizadas pelo Next.js)
   * - Todos os arquivos da pasta public (imagens, fontes .ttf, favicons, etc.)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf)).*)',
  ],
};