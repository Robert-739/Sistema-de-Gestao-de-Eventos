import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que só podem ser acessadas sem login
const rotasPublicas = ["/login", "/cadastro"];

// Mapa de qual role pode acessar qual rota
const permissoesPorRota: Record<string, string> = {
  "/dashboard/aluno": "ALU",
  "/dashboard/coordenador": "COO",
  "/dashboard/diretor": "DIR",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const usuarioId = request.cookies.get("usuario_id")?.value;
  const usuarioPerfil = request.cookies.get("usuario_perfil")?.value;

  const estaLogado = !!usuarioId && !!usuarioPerfil;

  // Se está numa rota pública e já está logado, redireciona para o dashboard correto
  if (rotasPublicas.some((rota) => pathname.startsWith(rota))) {
    if (estaLogado) {
      if (usuarioPerfil === "ALU") return NextResponse.redirect(new URL("/dashboard/aluno", request.url));
      if (usuarioPerfil === "COO") return NextResponse.redirect(new URL("/dashboard/coordenador", request.url));
      if (usuarioPerfil === "DIR") return NextResponse.redirect(new URL("/dashboard/diretor", request.url));
    }
    return NextResponse.next();
  }

  // Se está numa rota protegida e NÃO está logado, manda pro login
  if (pathname.startsWith("/dashboard")) {
    if (!estaLogado) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verifica se o usuário tem permissão para a rota que está tentando acessar
    for (const [rota, perfilNecessario] of Object.entries(permissoesPorRota)) {
      if (pathname.startsWith(rota) && usuarioPerfil !== perfilNecessario) {
        // Redireciona para o dashboard correto do perfil do usuário
        if (usuarioPerfil === "ALU") return NextResponse.redirect(new URL("/dashboard/aluno", request.url));
        if (usuarioPerfil === "COO") return NextResponse.redirect(new URL("/dashboard/coordenador", request.url));
        if (usuarioPerfil === "DIR") return NextResponse.redirect(new URL("/dashboard/diretor", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/cadastro"],
};
