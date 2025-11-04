import { useState, useEffect } from 'react';
import { 
  fetchOrders, 
  retryOrder, 
  formatDate, 
  getStatusColor, 
  getStatusLabel,
  type Order 
} from '../lib/api';
import './Admin.css';

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const limit = 20;

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrders(statusFilter, limit, offset);
      setOrders(response.orders);
      setTotal(response.pagination.total);
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, offset]);

  // Auto-refresh a cada 10s
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [statusFilter, offset]);

  const handleRetry = async (orderId: string) => {
    try {
      setRetrying(orderId);
      await retryOrder(orderId);
      showNotification('success', `Pedido ${orderId} reenviado com sucesso!`);
      loadOrders();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Erro ao reenviar pedido');
    } finally {
      setRetrying(null);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePrevPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNextPage = () => {
    setOffset(offset + limit);
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Shopify Automation - Painel de Pedidos</h1>
        <button className="refresh-btn" onClick={loadOrders} disabled={loading}>
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="controls">
        <div className="filter-group">
          <label htmlFor="status-filter">Filtrar por status:</label>
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

        <div className="stats">
          Total de pedidos: <strong>{total}</strong>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          Nenhum pedido encontrado
        </div>
      )}

      {!error && orders.length > 0 && (
        <>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Tentativas</th>
                  <th>Último Erro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
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
                    <td className="attempts">{order.attempts}</td>
                    <td className="error-cell">
                      {order.last_error ? (
                        <span className="error-text" title={order.last_error}>
                          {order.last_error.substring(0, 50)}
                          {order.last_error.length > 50 ? '...' : ''}
                        </span>
                      ) : (
                        <span className="no-error">-</span>
                      )}
                    </td>
                    <td>
                      {order.status === 'failed' && (
                        <button 
                          className="retry-btn"
                          onClick={() => handleRetry(order.id)}
                          disabled={retrying === order.id}
                        >
                          {retrying === order.id ? 'Reenviando...' : 'Retry'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
    </div>
  );
}

