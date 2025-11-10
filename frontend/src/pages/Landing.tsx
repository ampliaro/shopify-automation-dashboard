import { Link } from 'react-router-dom';
import './Landing.css';

const getContactUrl = (): string => {
  return (
    import.meta.env.VITE_CONTACT_URL ||
    'mailto:contato@exemplo.com?subject=Interesse%20no%20Dashboard%20Shopify'
  );
};

export default function Landing() {
  const contactUrl = getContactUrl();

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Shopify Automation</span>
          </div>
          <nav className="header-nav">
            <a href={contactUrl} className="nav-link" target="_blank" rel="noopener noreferrer">
              Falar comigo
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Dashboard de automações e métricas para Shopify — projeto de portfólio
          </h1>
          <p className="hero-subtitle">
            Exemplo de como entrego painéis claros, rápidos e prontos para escalar integrações.
          </p>
          <p className="hero-subtitle-en">
            Shopify automations & metrics dashboard — portfolio project
          </p>

          <div className="hero-ctas">
            <Link to="/demo" className="btn btn-primary">
              Ver demo agora
            </Link>
            <a
              href="https://github.com/ampliaro/shopify-automation-dashboard"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-icon">{'<>'}</span> Ver código no GitHub
            </a>
            <a
              href={contactUrl}
              className="btn btn-tertiary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar comigo
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="preview-content">
              <div className="preview-cards">
                <div className="preview-card">
                  <div className="card-label">Pedidos</div>
                  <div className="card-value">1,234</div>
                  <div className="card-trend positive">+12%</div>
                </div>
                <div className="preview-card">
                  <div className="card-label">Taxa Sucesso</div>
                  <div className="card-value">98.5%</div>
                  <div className="card-trend positive">+2.3%</div>
                </div>
                <div className="preview-card">
                  <div className="card-label">Tempo Médio</div>
                  <div className="card-value">1.2s</div>
                  <div className="card-trend positive">-0.3s</div>
                </div>
              </div>
              <div className="preview-chart">
                <svg viewBox="0 0 300 100" className="chart-svg">
                  <polyline
                    points="0,80 30,70 60,75 90,60 120,55 150,40 180,45 210,30 240,35 270,25 300,20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Principais características</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3 className="feature-title">Rotinas automáticas e métricas acionáveis</h3>
            <p className="feature-description">Automations & actionable metrics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Mock data para demo pública sem chaves</h3>
            <p className="feature-description">Mock data for public demo</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Arquitetura simples e fácil de manter</h3>
            <p className="feature-description">Simple, maintainable architecture</p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="stack-section">
        <h2 className="section-title">Stack Técnica</h2>
        <div className="stack-badges">
          <span className="badge">React 18</span>
          <span className="badge">TypeScript</span>
          <span className="badge">Vite</span>
          <span className="badge">Recharts</span>
          <span className="badge">Node.js</span>
          <span className="badge">Express</span>
          <span className="badge">SQLite</span>
        </div>
      </section>

      {/* How it works Section */}
      <section className="how-section">
        <h2 className="section-title">Como funciona</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Coleta</h3>
            <p className="step-description">
              Webhooks Shopify recebidos e validados com HMAC, garantindo autenticidade e
              idempotência.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Processamento</h3>
            <p className="step-description">
              Pedidos são processados, enviados para fulfillment e acompanhados com retry
              automático.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Visualização</h3>
            <p className="step-description">
              Dashboard exibe métricas em tempo real, gráficos de tendência e permite gerenciamento
              manual.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Pronto para ver em ação?</h2>
          <p className="cta-description">
            Explore a demo funcional com dados mockados ou veja o código completo no GitHub.
          </p>
          <div className="cta-buttons">
            <Link to="/demo" className="btn btn-primary btn-large">
              Acessar Demo
            </Link>
            <a
              href={contactUrl}
              className="btn btn-tertiary btn-large"
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar comigo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p className="footer-note">
            Projeto de portfólio por{' '}
            <a href={contactUrl} target="_blank" rel="noopener noreferrer">
              Rafael Gregório
            </a>
            . Não afiliado à Shopify.
          </p>
          <div className="footer-links">
            <a
              href="https://github.com/ampliaro/shopify-automation-dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a href={contactUrl} target="_blank" rel="noopener noreferrer">
              Contato
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="mobile-sticky-cta">
        <a
          href={contactUrl}
          className="btn btn-primary btn-small"
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar comigo
        </a>
      </div>
    </div>
  );
}
