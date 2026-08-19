export async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // 1. Verifica cookie de sessão proprietária do Outro Cérebro (__Host-oc_session)
  const cookieHeader = request.headers.get("cookie") || "";
  const ocCookie =
    cookieHeader.includes("__Host-oc_session=") ||
    cookieHeader.includes("oc_personal_session=");

  // 2. Se for rota do /dashboard e não houver cookie do sistema, redireciona para a raiz (/)
  if (isDashboardRoute) {
    if (ocCookie || process.env.NODE_ENV === "development") {
      // Sessão pessoal confirmada ou modo de desenvolvimento local
      return;
    }

    // Não autenticado: redireciona para a página de login raiz (/)
    return Response.redirect(new URL("/", request.url), 307);
  }
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto arquivos estáticos,
     * imagens, ícones e assets públicos.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
