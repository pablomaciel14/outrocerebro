import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

function Mark() {
  return (
    <div className="login-mark" aria-hidden="true">
      <i className="login-orbit orbit-one" />
      <i className="login-orbit orbit-two" />
      <i className="login-node node-one" />
      <i className="login-node node-two" />
      <span>∞</span>
    </div>
  );
}

export default async function LoginPage() {
  const user = await getChatGPTUser();
  const destination = user ? "/workspace" : chatGPTSignInPath("/workspace");

  return (
    <main className="login-page">
      <div className="login-ambient ambient-one" />
      <div className="login-ambient ambient-two" />
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand"><Mark /><p>OUTRO<br />CÉREBRO</p></div>
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
