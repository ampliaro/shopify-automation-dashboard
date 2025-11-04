const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Order {
  id: string;
  created_at: string;
  status: 'received' | 'sent' | 'failed';
  payload: any;
  last_error: string | null;
  attempts: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface RetryResponse {
  message: string;
  order_id: string;
  status: string;
}

/**
 * Busca pedidos com filtros opcionais
 */
export async function fetchOrders(
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  
  if (status && status !== 'all') {
    params.append('status', status);
  }
  
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const url = `${API_BASE}/orders?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retenta envio de um pedido falhado
 */
export async function retryOrder(orderId: string): Promise<RetryResponse> {
  const url = `${API_BASE}/orders/${orderId}/retry`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to retry order');
  }

  return response.json();
}

/**
 * Formata data para exibição
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Retorna cor baseada no status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'received':
      return '#2196F3'; // Azul
    case 'sent':
      return '#4CAF50'; // Verde
    case 'failed':
      return '#F44336'; // Vermelho
    default:
      return '#757575'; // Cinza
  }
}

/**
 * Retorna label em português para o status
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'received':
      return 'Recebido';
    case 'sent':
      return 'Enviado';
    case 'failed':
      return 'Falhou';
    default:
      return status;
  }
}

