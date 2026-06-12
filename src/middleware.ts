import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que só podem ser acessadas sem login
const rotasPublicas = ["/login", "/cadastro"];

// Mapa de qual role pode acessar qual prefixo de rota
const permissoesPorRota = [
  { prefixo: "/dashboard/aluno", perfil: "ALU" },
  { prefixo: "/dashboard/coordenador", perfil: "COO" },
  { prefixo: "/dashboard/diretor", perfil: "DIR" },
];

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

    // Encontra a regra específica para a rota atual que o usuário está tentando acessar
    const regraRota = permissoesPorRota.find((item) => pathname.startsWith(item.prefixo));

    // Se ele está tentando acessar uma rota controlada e o perfil dele não bate com o daquela rota
    if (regraRota && usuarioPerfil !== regraRota.perfil) {
      // Redireciona de volta estritamente para a página inicial correta do perfil dele
      if (usuarioPerfil === "ALU") return NextResponse.redirect(new URL("/dashboard/aluno", request.url));
      if (usuarioPerfil === "COO") return NextResponse.redirect(new URL("/dashboard/coordenador", request.url));
      if (usuarioPerfil === "DIR") return NextResponse.redirect(new URL("/dashboard/diretor", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/cadastro"],
};