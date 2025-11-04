const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || '';

export interface Order {
  id: string;
  created_at: string;
  status: 'received' | 'sent' | 'failed';
  payload: any;
  last_error: string | null;
  attempts: number;
  sent_at: string | null;
  note: string | null;
}

export interface OrderLog {
  id: string;
  order_id: string;
  event: string;
  message: string | null;
  created_at: string;
}

export interface MetricsSummary {
  current: {
    totalOrders: number;
    successRate: number;
    failedOrders: number;
    avgTimeToSent: number;
  };
  previous: {
    totalOrders: number;
    successRate: number;
    failedOrders: number;
  };
  deltas: {
    totalOrders: number;
    successRate: number;
    failedOrders: number;
    avgTimeToSent: number;
  };
  range: string;
  period: {
    start: string;
    end: string;
  };
}

export interface TimeseriesData {
  series: Array<{
    period: string;
    total: number;
    sent: number;
    failed: number;
    received: number;
  }>;
  range: string;
  dateFormat: string;
}

export interface HeatmapData {
  heatmap: number[];
  date: string;
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
 * Headers comuns com token de admin
 */
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-token': ADMIN_TOKEN,
  };
}

/**
 * Busca pedidos com filtros opcionais
 */
export async function fetchOrders(
  status?: string,
  limit: number = 50,
  offset: number = 0,
  searchQuery?: string,
  range?: string,
  specificDate?: string
): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  
  if (status && status !== 'all') {
    params.append('status', status);
  }
  
  if (searchQuery) {
    params.append('q', searchQuery);
  }

  if (range) {
    params.append('range', range);
  }

  if (specificDate) {
    params.append('specificDate', specificDate);
  }
  
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const url = `${API_BASE}/orders?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca um pedido por ID
 */
export async function fetchOrderById(orderId: string): Promise<Order> {
  const url = `${API_BASE}/orders/${orderId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca logs de um pedido
 */
export async function fetchOrderLogs(orderId: string): Promise<OrderLog[]> {
  const url = `${API_BASE}/orders/${orderId}/logs`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order logs: ${response.statusText}`);
  }

  const data = await response.json();
  return data.logs;
}

/**
 * Retenta envio de um pedido falhado
 */
export async function retryOrder(orderId: string): Promise<RetryResponse> {
  const url = `${API_BASE}/orders/${orderId}/retry`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to retry order');
  }

  return response.json();
}

/**
 * Retenta múltiplos pedidos em lote
 */
export async function bulkRetryOrders(orderIds: string[]): Promise<any> {
  const url = `${API_BASE}/orders/bulk/retry`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk retry orders');
  }

  return response.json();
}

/**
 * Atualiza um pedido (status ou nota)
 */
export async function updateOrder(orderId: string, data: { status?: string; note?: string }): Promise<any> {
  const url = `${API_BASE}/orders/${orderId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order');
  }

  return response.json();
}

/**
 * Busca métricas resumidas
 */
export async function fetchMetricsSummary(range: string = '7d'): Promise<MetricsSummary> {
  const url = `${API_BASE}/metrics/summary?range=${range}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics summary: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca dados de série temporal
 */
export async function fetchTimeseries(range: string = '7d'): Promise<TimeseriesData> {
  const url = `${API_BASE}/metrics/timeseries?range=${range}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch timeseries: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca dados de heatmap
 */
export async function fetchHeatmap(): Promise<HeatmapData> {
  const url = `${API_BASE}/metrics/heatmap`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch heatmap: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Exporta pedidos como CSV
 */
export function exportCSV(range: string = '7d', status?: string): void {
  const params = new URLSearchParams({ range });
  if (status && status !== 'all') {
    params.append('status', status);
  }

  const url = `${API_BASE}/reports/export.csv?${params.toString()}`;
  
  // Cria link temporário para download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `orders-${range}.csv`);
  
  // Adiciona headers via fetch e baixa
  fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  })
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(error => {
      console.error('Error downloading CSV:', error);
      throw error;
    });
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

