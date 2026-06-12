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

  const usuarioId = request.cookies.get("usuario_id")?.value;
  const usuarioPerfil = request.cookies.get("usuario_perfil")?.value;

  const estaLogado = !!usuarioId && !!usuarioPerfil;

  // 1. REGRA DE OURO: Se o usuário acessou a raiz limpa do site ("/")
  // Nós ignoramos qualquer cookie antigo, limpamos eles e mandamos OBRIGATORIAMENTE para o login
  if (pathname === "/") {
    const resposta = NextResponse.redirect(new URL("/login", request.url));
    resposta.cookies.delete("usuario_id");
    resposta.cookies.delete("usuario_perfil");
    resposta.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return resposta;
  }

  // 2. Se está tentando acessar as rotas públicas de login/cadastro diretamente
  if (rotasPublicas.some((rota) => pathname.startsWith(rota))) {
    // Como você NÃO quer sessões salvas automáticas pulando o formulário,
    // nós apenas removemos aquele redirecionamento antigo que jogava direto pro dashboard.
    // Assim, se ele digitar "/login", ele vai ver e preencher o formulário sempre!
    return NextResponse.next();
  }

  // 3. Se está numa rota protegida do painel
  if (pathname.startsWith("/dashboard")) {
    if (!estaLogado) {
      const resposta = NextResponse.redirect(new URL("/login", request.url));
      resposta.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
      return resposta;
    }

    const regraRota = permissoesPorRota.find((item) => pathname.startsWith(item.prefixo));

    // Se o perfil logado tentar invadir a rota de outro perfil, joga pro login deslogando ele
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
  matcher: ["/", "/dashboard/:path*", "/login", "/cadastro"],
};