import { useState, useEffect } from 'react';
import {
  Order,
  OrderLog,
  fetchOrderById,
  fetchOrderLogs,
  updateOrder,
  retryOrder,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from '../lib/api';

interface OrderDrawerProps {
  orderId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

function getEventIcon(event: string): string {
  switch (event) {
    case 'created':
      return '📥';
    case 'sent':
      return '✅';
    case 'failed':
      return '❌';
    case 'retry':
      return '🔄';
    case 'note_added':
      return '📝';
    case 'status_updated':
      return '🔄';
    default:
      return '•';
  }
}

export default function OrderDrawer({ orderId, onClose, onUpdate }: OrderDrawerProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [logs, setLogs] = useState<OrderLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  const loadOrderData = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const [orderData, logsData] = await Promise.all([
        fetchOrderById(orderId),
        fetchOrderLogs(orderId),
      ]);
      setOrder(orderData);
      setLogs(logsData);
      setNote(orderData.note || '');
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!orderId) return;

    setUpdating(true);
    try {
      await updateOrder(orderId, { note });
      await loadOrderData();
      onUpdate();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Erro ao salvar nota');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsSent = async () => {
    if (!orderId || !confirm('Marcar pedido como enviado?')) return;

    setUpdating(true);
    try {
      await updateOrder(orderId, { status: 'sent' });
      await loadOrderData();
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    } finally {
      setUpdating(false);
    }
  };

  const handleRetry = async () => {
    if (!orderId) return;

    setRetrying(true);
    try {
      await retryOrder(orderId);
      await loadOrderData();
      onUpdate();
    } catch (error) {
      console.error('Error retrying order:', error);
      alert('Erro ao retentar pedido');
    } finally {
      setRetrying(false);
    }
  };

  if (!orderId) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <h2>Pedido #{orderId}</h2>
            {order && (
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusLabel(order.status)}
              </span>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawer-content">
          {loading ? (
            <div className="loading-state">Carregando...</div>
          ) : order ? (
            <>
              {/* Informações do Cliente */}
              <section className="drawer-section">
                <h3>Cliente</h3>
                <div className="info-grid">
                  <div>
                    <strong>Nome:</strong>
                    <p>
                      {order.payload.customer?.first_name} {order.payload.customer?.last_name}
                    </p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p>{order.payload.customer?.email || order.payload.email}</p>
                  </div>
                </div>
              </section>

              {/* Endereço de Entrega */}
              {order.payload.shipping_address && (
                <section className="drawer-section">
                  <h3>Endereço de Entrega</h3>
                  <p>
                    {order.payload.shipping_address.address1}
                    <br />
                    {order.payload.shipping_address.city}, {order.payload.shipping_address.province}
                    <br />
                    CEP: {order.payload.shipping_address.zip}
                    <br />
                    {order.payload.shipping_address.country}
                  </p>
                </section>
              )}

              {/* Itens do Pedido */}
              {order.payload.line_items && (
                <section className="drawer-section">
                  <h3>Itens</h3>
                  <div className="items-list">
                    {order.payload.line_items.map((item: any, index: number) => (
                      <div key={index} className="item-row">
                        <div>
                          <strong>{item.title}</strong>
                          {item.sku && <span className="sku">SKU: {item.sku}</span>}
                        </div>
                        <div className="item-details">
                          <span>Qtd: {item.quantity}</span>
                          <span>R$ {item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="total-row">
                    <strong>Total:</strong>
                    <strong>R$ {order.payload.total_price}</strong>
                  </div>
                </section>
              )}

              {/* Detalhes do Pedido */}
              <section className="drawer-section">
                <h3>Detalhes</h3>
                <div className="info-grid">
                  <div>
                    <strong>Criado em:</strong>
                    <p>{formatDate(order.created_at)}</p>
                  </div>
                  {order.sent_at && (
                    <div>
                      <strong>Enviado em:</strong>
                      <p>{formatDate(order.sent_at)}</p>
                    </div>
                  )}
                  <div>
                    <strong>Tentativas:</strong>
                    <p>{order.attempts}</p>
                  </div>
                  {order.last_error && (
                    <div className="full-width">
                      <strong>Último erro:</strong>
                      <p className="error-text">{order.last_error}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Nota */}
              <section className="drawer-section">
                <h3>Nota</h3>
                <textarea
                  className="note-textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Adicionar nota ao pedido..."
                  rows={3}
                />
                <button
                  className="btn-secondary"
                  onClick={handleSaveNote}
                  disabled={updating || note === (order.note || '')}
                >
                  {updating ? 'Salvando...' : 'Salvar Nota'}
                </button>
              </section>

              {/* Timeline de Logs */}
              <section className="drawer-section">
                <h3>Timeline</h3>
                <div className="timeline">
                  {logs.map((log) => (
                    <div key={log.id} className="timeline-item">
                      <span className="timeline-icon">{getEventIcon(log.event)}</span>
                      <div className="timeline-content">
                        <div className="timeline-message">{log.message || log.event}</div>
                        <div className="timeline-date">{formatDate(log.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="error-state">Pedido não encontrado</div>
          )}
        </div>

        {/* Ações */}
        {order && (
          <div className="drawer-footer">
            {order.status === 'failed' && (
              <button className="btn-primary" onClick={handleRetry} disabled={retrying}>
                {retrying ? 'Retentando...' : 'Retry'}
              </button>
            )}
            {order.status !== 'sent' && (
              <button className="btn-success" onClick={handleMarkAsSent} disabled={updating}>
                Marcar como Enviado
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
