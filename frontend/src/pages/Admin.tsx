import { useState, useEffect } from 'react';
import { 
  fetchOrders, 
  fetchMetricsSummary,
  fetchTimeseries,
  fetchHeatmap,
  bulkRetryOrders,
  exportCSV,
  formatDate, 
  getStatusColor, 
  getStatusLabel,
  type Order,
  type MetricsSummary,
  type TimeseriesData,
  type HeatmapData
} from '../lib/api';
import MetricCards from '../components/MetricCards';
import TimeseriesChart from '../components/TimeseriesChart';
import Heatmap from '../components/Heatmap';
import OrderDrawer from '../components/OrderDrawer';
import SavedFilters from '../components/SavedFilters';
import './Admin.css';

type PeriodRange = 'today' | '7d' | '30d';

export default function Admin() {
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
  const [specificDate, setSpecificDate] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Estado de ações
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkRetrying, setBulkRetrying] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
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
        fetchTimeseries(period)
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
      const response = await fetchOrders(
        statusFilter, 
        limit, 
        offset, 
        searchQuery, 
        specificDate ? undefined : period, // Se tem data específica, não usa range
        specificDate || undefined
      );
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
  }, [statusFilter, offset, searchQuery, period, specificDate]);

  // Auto-refresh a cada 30s
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
      loadMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [period, statusFilter, offset, searchQuery, specificDate]);

  const handlePeriodChange = (newPeriod: PeriodRange) => {
    setPeriod(newPeriod);
    setSpecificDate(null); // Limpa filtro de data específica
    setOffset(0); // Reset paginação ao mudar período
    setSelectedOrders(new Set()); // Limpa seleção
  };

  const handleDateClick = (date: string) => {
    setSpecificDate(date);
    setOffset(0);
    setSelectedOrders(new Set());
  };

  const handleClearDateFilter = () => {
    setSpecificDate(null);
    setOffset(0);
  };

  const handleApplySavedFilter = (filter: { status: string; searchQuery: string; period: string }) => {
    setPeriod(filter.period as PeriodRange);
    setStatusFilter(filter.status);
    setSearchQuery(filter.searchQuery);
    setSpecificDate(null);
    setOffset(0);
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setOffset(0);
    loadOrders();
  };

  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      const failedIds = orders.filter(o => o.status === 'failed').map(o => o.id);
      setSelectedOrders(new Set(failedIds));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleBulkRetry = async () => {
    if (selectedOrders.size === 0) return;

    if (!confirm(`Retentar ${selectedOrders.size} pedido(s) selecionado(s)?`)) {
      return;
    }

    setBulkRetrying(true);
    try {
      const result = await bulkRetryOrders(Array.from(selectedOrders));
      showNotification('success', `${result.summary.succeeded} de ${result.summary.total} pedidos retentados com sucesso`);
      setSelectedOrders(new Set());
      await Promise.all([loadOrders(), loadMetrics()]);
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Erro ao retentar pedidos');
    } finally {
      setBulkRetrying(false);
    }
  };

  const handleExportCSV = () => {
    try {
      exportCSV(period, statusFilter);
      showNotification('success', 'CSV exportado com sucesso');
    } catch (err) {
      showNotification('error', 'Erro ao exportar CSV');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePrevPage = () => {
    setOffset(Math.max(0, offset - limit));
    setSelectedOrders(new Set());
  };

  const handleNextPage = () => {
    setOffset(offset + limit);
    setSelectedOrders(new Set());
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
  const failureRate = metrics && metrics.current.totalOrders > 0 
    ? (metrics.current.failedOrders / metrics.current.totalOrders) * 100 
    : 0;

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div>
          <h1>Dashboard Comercial</h1>
          <p className="subtitle">Shopify Automation</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-icon" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn-secondary" onClick={handleExportCSV}>
            📥 Exportar CSV
          </button>
          <button className="btn-secondary" onClick={() => { loadOrders(); loadMetrics(); }}>
            🔄 Atualizar
          </button>
        </div>
      </header>

      {/* Notificação */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Alerta de taxa de falha alta */}
      {failureRate > 20 && (
        <div className="alert-banner">
          ⚠️ Taxa de falha elevada: {failureRate.toFixed(1)}% dos pedidos falharam no período
        </div>
      )}

      {/* Seletor de Período */}
      <div className="period-selector">
        <button
          className={`period-btn ${period === 'today' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('today')}
        >
          Hoje
        </button>
        <button
          className={`period-btn ${period === '7d' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('7d')}
        >
          7 dias
        </button>
        <button
          className={`period-btn ${period === '30d' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('30d')}
        >
          30 dias
        </button>
      </div>

      {/* Cards de Métricas */}
      <MetricCards summary={metrics} loading={metricsLoading} />

      {/* Gráfico de Série Temporal */}
      <TimeseriesChart 
        data={timeseries} 
        loading={metricsLoading} 
        onDateClick={handleDateClick}
      />

      {/* Heatmap (apenas para "Hoje") */}
      {showHeatmap && <Heatmap data={heatmap} loading={metricsLoading} />}

      {/* Filtros Salvos */}
      <SavedFilters
        onApplyFilter={handleApplySavedFilter}
        currentStatus={statusFilter}
        currentSearch={searchQuery}
        currentPeriod={period}
      />

      {/* Controles de Filtro e Busca */}
      <div className="controls-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por ID ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search">🔍</button>
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

      {/* Indicador de Filtro de Data Específica */}
      {specificDate && (
        <div className="date-filter-badge">
          <span>📅 Filtrando por: <strong>{new Date(specificDate).toLocaleDateString('pt-BR')}</strong></span>
          <button className="clear-filter-btn" onClick={handleClearDateFilter}>
            ✕ Limpar filtro
          </button>
        </div>
      )}

      {/* Barra de Ações em Lote */}
      {selectedOrders.size > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedOrders.size} pedido(s) selecionado(s)</span>
          <button
            className="btn-primary"
            onClick={handleBulkRetry}
            disabled={bulkRetrying}
          >
            {bulkRetrying ? 'Retentando...' : 'Retry Selecionados'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setSelectedOrders(new Set())}
          >
            Limpar Seleção
          </button>
        </div>
      )}

      {/* Mensagens de Estado */}
      {error && (
        <div className="error-message">{error}</div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          Nenhum pedido encontrado
        </div>
      )}

      {/* Tabela de Pedidos */}
      {!error && orders.length > 0 && (
        <>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedOrders.size > 0 && 
                        orders.filter(o => o.status === 'failed').every(o => selectedOrders.has(o.id))}
                    />
                  </th>
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
                    <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                        disabled={order.status !== 'failed'}
                      />
                    </td>
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
                    <td>
                      {order.payload.customer?.email || order.payload.email || '-'}
                    </td>
                    <td className="attempts">{order.attempts}</td>
                    <td>
                      {order.note ? (
                        <span className="note-indicator" title={order.note}>📝</span>
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
