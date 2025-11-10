import { Link } from 'react-router-dom';
import './Landing.css';
import { useEffect } from 'react';

const getContactUrl = (): string => {
  return (
    import.meta.env.VITE_CONTACT_URL ||
    'mailto:contato@studioampliaro.com?subject=Interesse%20no%20Shopify%20Dashboard'
  );
};

export default function Landing() {
  const contactUrl = getContactUrl();

  useEffect(() => {
    // Load Feather Icons
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/feather-icons';
    script.onload = () => {
      if (window.feather) {
        window.feather.replace();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <i data-feather="activity" className="logo-icon"></i>
            <span className="logo-text">Shopify Automation</span>
          </div>
          <nav className="header-nav">
            <Link to="/demo" className="nav-link">
              Demo
            </Link>
            <a
              href="https://github.com/ampliaro/shopify-automation-dashboard"
              className="nav-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a href={contactUrl} className="nav-link-cta" target="_blank" rel="noopener noreferrer">
              Começar Agora
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <i data-feather="zap" className="badge-icon"></i>
          <span>Open Source</span>
        </div>
        
        <h1 className="hero-title">
          Transforme pedidos Shopify em<br />
          <span className="gradient-text">insights acionáveis</span>
        </h1>
        
        <p className="hero-subtitle">
          Dashboard comercial com métricas em tempo real, automações inteligentes<br />
          e gestão completa de pedidos. Configure em minutos. Escale sem limites.
        </p>

        <div className="hero-ctas">
          <Link to="/demo" className="btn btn-primary">
            <i data-feather="play-circle"></i>
            <span>Ver Demo</span>
          </Link>
          <a
            href="https://github.com/ampliaro/shopify-automation-dashboard"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i data-feather="github"></i>
            <span>Ver no GitHub</span>
          </a>
        </div>

        <div className="hero-badges">
          <div className="info-badge">
            <i data-feather="shield"></i>
            <span>MIT License</span>
          </div>
          <div className="info-badge">
            <i data-feather="cpu"></i>
            <span>Node.js 18+</span>
          </div>
          <div className="info-badge">
            <i data-feather="check-circle"></i>
            <span>Production Ready</span>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="demo-preview-section">
        <div className="demo-preview">
          <div className="preview-window">
            <div className="window-header">
              <div className="window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="window-title">Dashboard</div>
            </div>
            <div className="window-content">
              <div className="preview-metrics">
                <div className="metric-item">
                  <div className="metric-icon">
                    <i data-feather="shopping-cart"></i>
                  </div>
                  <div className="metric-data">
                    <div className="metric-value">1,234</div>
                    <div className="metric-label">Pedidos</div>
                  </div>
                  <div className="metric-change positive">+12%</div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon success">
                    <i data-feather="trending-up"></i>
                  </div>
                  <div className="metric-data">
                    <div className="metric-value">98.5%</div>
                    <div className="metric-label">Taxa de Sucesso</div>
                  </div>
                  <div className="metric-change positive">+2.3%</div>
                </div>
              </div>
              <div className="preview-chart">
                <svg viewBox="0 0 400 120" className="chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 L40,70 L80,75 L120,60 L160,55 L200,40 L240,45 L280,30 L320,35 L360,25 L400,20"
                    fill="url(#chartGradient)"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,80 L40,70 L80,75 L120,60 L160,55 L200,40 L240,45 L280,30 L320,35 L360,25 L400,20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Recursos Principais</h2>
          <p className="section-subtitle">
            Tudo que você precisa para gerenciar pedidos Shopify com eficiência
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i data-feather="refresh-cw"></i>
            </div>
            <h3 className="feature-title">Automação Inteligente</h3>
            <p className="feature-description">
              Webhooks validados com HMAC, idempotência garantida e retry automático para pedidos falhados.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i data-feather="bar-chart-2"></i>
            </div>
            <h3 className="feature-title">Métricas em Tempo Real</h3>
            <p className="feature-description">
              Acompanhe taxa de sucesso, tempo médio de processamento e comparativos de período.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i data-feather="filter"></i>
            </div>
            <h3 className="feature-title">Filtros Avançados</h3>
            <p className="feature-description">
              Busque por status, período, data específica. Salve filtros personalizados para agilizar seu fluxo.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i data-feather="layers"></i>
            </div>
            <h3 className="feature-title">Gestão em Lote</h3>
            <p className="feature-description">
              Retente múltiplos pedidos simultaneamente, exporte relatórios CSV com métricas agregadas.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i data-feather="clock"></i>
            </div>
            <h3 className="feature-title">Timeline Completa</h3>
            <p className="feature-description">
              Visualize histórico de eventos, logs detalhados e notas customizadas para cada pedido.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i data-feather="moon"></i>
            </div>
            <h3 className="feature-title">Dark Mode</h3>
            <p className="feature-description">
              Interface adaptável com tema claro e escuro, perfeita para longas sessões de monitoramento.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="stack-section">
        <div className="section-header">
          <h2 className="section-title">Stack Técnica</h2>
        </div>
        
        <div className="stack-grid">
          <div className="stack-category">
            <h4>Frontend</h4>
            <div className="stack-items">
              <span className="stack-badge">React 18</span>
              <span className="stack-badge">TypeScript</span>
              <span className="stack-badge">Vite</span>
              <span className="stack-badge">Recharts</span>
            </div>
          </div>
          <div className="stack-category">
            <h4>Backend</h4>
            <div className="stack-items">
              <span className="stack-badge">Node.js</span>
              <span className="stack-badge">Express</span>
              <span className="stack-badge">SQLite</span>
              <span className="stack-badge">Zod</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-section">
        <div className="section-header">
          <h2 className="section-title">Como Funciona</h2>
          <p className="section-subtitle">
            Três etapas simples para automatizar seus pedidos Shopify
          </p>
        </div>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Coleta</h3>
              <p className="step-description">
                Webhooks Shopify são recebidos e validados com HMAC, garantindo autenticidade.
                Sistema de idempotência evita processamento duplicado.
              </p>
            </div>
          </div>

          <div className="step-divider">
            <i data-feather="arrow-down"></i>
          </div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Processamento</h3>
              <p className="step-description">
                Pedidos são enviados para API de fulfillment. Em caso de falha, retry automático
                com backoff exponencial garante entrega.
              </p>
            </div>
          </div>

          <div className="step-divider">
            <i data-feather="arrow-down"></i>
          </div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Visualização</h3>
              <p className="step-description">
                Dashboard exibe métricas em tempo real, gráficos de tendência e permite
                intervenção manual quando necessário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Pronto para automatizar seus pedidos?</h2>
          <p className="cta-description">
            Explore a demo funcional com dados mockados ou veja o código completo no GitHub.
          </p>
          <div className="cta-buttons">
            <Link to="/demo" className="btn btn-primary btn-large">
              <i data-feather="play-circle"></i>
              <span>Acessar Demo</span>
            </Link>
            <a
              href="https://github.com/ampliaro/shopify-automation-dashboard"
              className="btn btn-secondary btn-large"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i data-feather="github"></i>
              <span>Ver Código</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <i data-feather="activity" className="footer-icon"></i>
              <span className="footer-logo">Studio Ampliaro</span>
            </div>
            <p className="footer-tagline">Soluções inteligentes para e-commerce</p>
          </div>
          
          <div className="footer-links">
            <a
              href="https://github.com/ampliaro/shopify-automation-dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i data-feather="github"></i>
              <span>GitHub</span>
            </a>
            <span className="footer-divider">·</span>
            <a href={contactUrl} target="_blank" rel="noopener noreferrer">
              <i data-feather="mail"></i>
              <span>Contato</span>
            </a>
          </div>
          
          <p className="footer-note">
            MIT License © 2025 · Não afiliado à Shopify
          </p>
        </div>
      </footer>
    </div>
  );
}

declare global {
  interface Window {
    feather?: {
      replace: () => void;
    };
  }
}
