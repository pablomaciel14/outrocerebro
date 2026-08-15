import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import ThemeToggle from "./ThemeToggle";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getChatGPTUser();
  const destination = user ? "/workspace" : chatGPTSignInPath("/workspace");

  return (
    <main className="login-page">
      <ThemeToggle variant="floating" />
      <div className="login-ambient ambient-one" />
      <div className="login-ambient ambient-two" />
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand" aria-label="Outro Cérebro">
          <img className="brand-image brand-image-dark" src="/outro-cerebro-logo-dark.webp" alt="Outro Cérebro" />
          <img className="brand-image brand-image-light" src="/outro-cerebro-logo-light.webp" alt="" aria-hidden="true" />
        </div>
        <div className="private-pill"><span>●</span> ESPAÇO ESTRITAMENTE PESSOAL</div>
        <h1 id="login-title">Meu espaço privado<br />para pensar.</h1>
        <p className="login-copy">Memórias, ideias e conexões reunidas em um ambiente particular de <strong>Pablo Maciel</strong>.</p>
        <a className="login-button" href={destination}>
          <span>{user ? "Abrir meu espaço" : "Entrar no meu espaço"}</span><i>→</i>
        </a>
        {user && <p className="session-note"><span>✓</span> Identidade confirmada. Seu espaço está protegido.</p>}
        <div className="personal-notice">
          <span>♙</span>
          <p><strong>Não é um produto comercial.</strong><small>Não há cadastro público, planos, vendas ou acesso para terceiros. Este sistema existe exclusivamente para uso pessoal do proprietário.</small></p>
        </div>
      </section>
      <footer className="login-footer"><span>Outro Cérebro</span><i />Uso privado e individual</footer>
    </main>
  );
}
