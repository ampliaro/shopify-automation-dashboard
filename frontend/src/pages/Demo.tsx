import { useState, useEffect } from 'react';
import {
  fetchOrders,
  fetchMetricsSummary,
  fetchTimeseries,
  fetchHeatmap,
  formatDate,
  getStatusColor,
  getStatusLabel,
  type Order,
  type MetricsSummary,
  type TimeseriesData,
  type HeatmapData,
} from '../lib/api';
import MetricCards from '../components/MetricCards';
import TimeseriesChart from '../components/TimeseriesChart';
import Heatmap from '../components/Heatmap';
import OrderDrawer from '../components/OrderDrawer';
import '../pages/Admin.css';
import { Link } from 'react-router-dom';

type PeriodRange = 'today' | '7d' | '30d';

export default function Demo() {
  // Estado de dados
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);

  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodRange>('7d');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Estado de ações
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  const limit = 20;

  // Aplica dark mode no body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Carrega métricas
  const loadMetrics = async () => {
    try {
      setMetricsLoading(true);
      const [metricsData, timeseriesData] = await Promise.all([
        fetchMetricsSummary(period),
        fetchTimeseries(period),
      ]);
      setMetrics(metricsData);
      setTimeseries(timeseriesData);

      // Carrega heatmap apenas se período for "today"
      if (period === 'today') {
        const heatmapData = await fetchHeatmap();
        setHeatmap(heatmapData);
        setShowHeatmap(true);
      } else {
        setShowHeatmap(false);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Carrega pedidos
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrders(statusFilter, limit, offset, searchQuery, period);
      setOrders(response.orders);
      setTotal(response.pagination.total);
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar métricas quando período muda
  useEffect(() => {
    loadMetrics();
  }, [period]);

  // Efeito para carregar pedidos
  useEffect(() => {
    loadOrders();
  }, [statusFilter, offset, searchQuery, period]);

  const handlePeriodChange = (newPeriod: PeriodRange) => {
    setPeriod(newPeriod);
    setOffset(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    loadOrders();
  };

  const handlePrevPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNextPage = () => {
    setOffset(offset + limit);
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseDrawer = () => {
    setSelectedOrderId(null);
  };

  const handleOrderUpdate = async () => {
    await Promise.all([loadOrders(), loadMetrics()]);
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const getContactUrl = (): string => {
    return (
      import.meta.env.VITE_CONTACT_URL ||
      'mailto:studio@ampliaro.com?subject=Interesse%20no%20Dashboard%20Shopify'
    );
  };

  return (
    <div className="admin-container">
      {/* Demo Banner */}
      <div className="demo-banner">
        <div className="demo-banner-content">
          <span className="demo-badge">MODO DEMO</span>
          <span className="demo-text">
            Dados mockados para demonstração pública. Configure suas credenciais para usar dados reais.
          </span>
          <div className="demo-actions">
            <Link to="/" className="demo-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Voltar</span>
            </Link>
            <a
              href="https://github.com/ampliaro/shopify-automation-dashboard"
              className="demo-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              <span>Código</span>
            </a>
            <a
              href={getContactUrl()}
              className="demo-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Contato</span>
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="admin-header">
        <div>
          <h1>Dashboard Comercial</h1>
          <p className="subtitle">Shopify Automation - Demo</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={toggleDarkMode}
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              loadOrders();
              loadMetrics();
            }}
            aria-label="Atualizar dados"
          >
            🔄 Atualizar
          </button>
        </div>
      </header>

      {/* Seletor de Período */}
      <div className="period-selector">
        <button
          className={`period-btn ${period === 'today' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('today')}
          aria-pressed={period === 'today'}
        >
          Hoje
        </button>
        <button
          className={`period-btn ${period === '7d' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('7d')}
          aria-pressed={period === '7d'}
        >
          7 dias
        </button>
        <button
          className={`period-btn ${period === '30d' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('30d')}
          aria-pressed={period === '30d'}
        >
          30 dias
        </button>
      </div>

      {/* Cards de Métricas */}
      <MetricCards summary={metrics} loading={metricsLoading} />

      {/* Gráfico de Série Temporal */}
      <TimeseriesChart data={timeseries} loading={metricsLoading} onDateClick={() => {}} />

      {/* Heatmap (apenas para "Hoje") */}
      {showHeatmap && <Heatmap data={heatmap} loading={metricsLoading} />}

      {/* Controles de Filtro e Busca */}
      <div className="controls-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <label htmlFor="search-input" className="sr-only">
            Buscar pedido
          </label>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Buscar por ID ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search" aria-label="Buscar">
            🔍
          </button>
        </form>

        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setOffset(0);
            }}
          >
            <option value="all">Todos</option>
            <option value="received">Recebido</option>
            <option value="sent">Enviado</option>
            <option value="failed">Falhou</option>
          </select>
        </div>

        <div className="stats-badge">
          Total: <strong>{total}</strong>
        </div>
      </div>

      {/* Mensagens de Estado */}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">Nenhum pedido encontrado</div>
      )}

      {/* Tabela de Pedidos */}
      {!error && orders.length > 0 && (
        <>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Cliente</th>
                  <th>Tentativas</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="clickable-row"
                  >
                    <td className="order-id">{order.id}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>{order.payload.customer?.email || order.payload.email || '-'}</td>
                    <td className="attempts">{order.attempts}</td>
                    <td>
                      {order.note ? (
                        <span className="note-indicator" title={order.note}>
                          📝
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="pagination">
            <button
              className="page-btn"
              onClick={handlePrevPage}
              disabled={offset === 0}
              aria-label="Página anterior"
            >
              ← Anterior
            </button>
            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="page-btn"
              onClick={handleNextPage}
              disabled={!hasMore}
              aria-label="Próxima página"
            >
              Próxima →
            </button>
          </div>
        </>
      )}

      {/* Drawer de Detalhes do Pedido */}
      <OrderDrawer
        orderId={selectedOrderId}
        onClose={handleCloseDrawer}
        onUpdate={handleOrderUpdate}
      />
    </div>
  );
}
