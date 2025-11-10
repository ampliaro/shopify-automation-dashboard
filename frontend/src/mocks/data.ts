// Mock data para demo pública (sem dependências de APIs externas)

export interface MockOrder {
  id: string;
  created_at: string;
  status: 'received' | 'sent' | 'failed';
  attempts: number;
  note: string | null;
  last_error: string | null;
  sent_at: string | null;
  payload: {
    email: string;
    customer?: {
      email: string;
      first_name: string;
      last_name: string;
    };
    total_price: string;
    currency: string;
    line_items: Array<{
      title: string;
      quantity: number;
      price: string;
    }>;
    shipping_address?: {
      address1: string;
      city: string;
      province: string;
      zip: string;
      country: string;
    };
  };
}

export interface MockMetricsSummary {
  current: {
    totalOrders: number;
    successRate: number;
    failedOrders: number;
    avgProcessingTime: number;
  };
  previous: {
    totalOrders: number;
    successRate: number;
    failedOrders: number;
    avgProcessingTime: number;
  };
}

export interface MockTimeseriesPoint {
  date: string;
  received: number;
  sent: number;
  failed: number;
}

export interface MockHeatmapPoint {
  hour: string;
  count: number;
}

// Gera pedidos mock distribuídos nos últimos 7 dias
const generateMockOrders = (): MockOrder[] => {
  const orders: MockOrder[] = [];
  const now = new Date();

  const customers = [
    { first_name: 'João', last_name: 'Silva', email: 'joao.silva@example.com' },
    { first_name: 'Maria', last_name: 'Santos', email: 'maria.santos@example.com' },
    { first_name: 'Pedro', last_name: 'Costa', email: 'pedro.costa@example.com' },
    { first_name: 'Ana', last_name: 'Lima', email: 'ana.lima@example.com' },
    { first_name: 'Carlos', last_name: 'Oliveira', email: 'carlos.oliveira@example.com' },
  ];

  const products = [
    { title: 'Camiseta Básica', price: '49.90' },
    { title: 'Calça Jeans', price: '129.90' },
    { title: 'Tênis Esportivo', price: '199.90' },
    { title: 'Jaqueta de Couro', price: '349.90' },
    { title: 'Relógio Digital', price: '89.90' },
  ];

  const statuses: Array<'received' | 'sent' | 'failed'> = ['received', 'sent', 'failed'];

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));

    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;

    orders.push({
      id: `DEMO-${1000 + i}`,
      created_at: date.toISOString(),
      status,
      attempts: status === 'failed' ? Math.floor(Math.random() * 3) + 1 : 1,
      note: status === 'failed' ? 'Erro de conexão com API' : null,
      last_error: status === 'failed' ? 'Timeout na conexão com API de fulfillment' : null,
      sent_at: status === 'sent' ? new Date(date.getTime() + 2000).toISOString() : null,
      payload: {
        email: customer.email,
        customer,
        total_price: (parseFloat(product.price) * quantity).toFixed(2),
        currency: 'BRL',
        line_items: [
          {
            title: product.title,
            quantity,
            price: product.price,
          },
        ],
        shipping_address: {
          address1: 'Rua Exemplo, 123',
          city: 'São Paulo',
          province: 'SP',
          zip: '01234-567',
          country: 'BR',
        },
      },
    });
  }

  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const mockOrders = generateMockOrders();

export const mockMetricsSummary: MockMetricsSummary = {
  current: {
    totalOrders: 50,
    successRate: 82,
    failedOrders: 9,
    avgProcessingTime: 1.2,
  },
  previous: {
    totalOrders: 45,
    successRate: 78,
    failedOrders: 10,
    avgProcessingTime: 1.5,
  },
};

export const mockTimeseries: MockTimeseriesPoint[] = (() => {
  const data: MockTimeseriesPoint[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const total = Math.floor(Math.random() * 10) + 5;
    const failed = Math.floor(total * 0.15);
    const sent = total - failed;

    data.push({
      date: dateStr,
      received: total,
      sent,
      failed,
    });
  }

  return data;
})();

export const mockHeatmap: MockHeatmapPoint[] = (() => {
  const data: MockHeatmapPoint[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0') + ':00';
    const count =
      hour >= 9 && hour <= 18 ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 3);

    data.push({
      hour: hourStr,
      count,
    });
  }

  return data;
})();

// Função para buscar pedidos mock com filtros
export const getMockOrders = (
  status?: string,
  limit = 20,
  offset = 0,
  searchQuery?: string
): {
  orders: MockOrder[];
  pagination: { total: number; limit: number; offset: number; hasMore: boolean };
} => {
  let filtered = [...mockOrders];

  if (status && status !== 'all') {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(query) ||
        o.payload.email.toLowerCase().includes(query) ||
        o.payload.customer?.email.toLowerCase().includes(query)
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    orders: paginated,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
};

// Função para buscar um pedido mock por ID
export const getMockOrderById = (id: string): MockOrder | null => {
  return mockOrders.find((o) => o.id === id) || null;
};

// Mock logs para um pedido
export const getMockOrderLogs = (orderId: string) => {
  const order = getMockOrderById(orderId);
  if (!order) return [];

  const logs = [
    {
      id: '1',
      order_id: orderId,
      event: 'received',
      message: 'Pedido recebido via webhook',
      created_at: order.created_at,
    },
  ];

  if (order.status === 'sent') {
    logs.push({
      id: '2',
      order_id: orderId,
      event: 'sent',
      message: 'Pedido enviado para fulfillment com sucesso',
      created_at: new Date(new Date(order.created_at).getTime() + 2000).toISOString(),
    });
  }

  if (order.status === 'failed') {
    for (let i = 1; i <= order.attempts; i++) {
      logs.push({
        id: (i + 1).toString(),
        order_id: orderId,
        event: 'failed',
        message: `Tentativa ${i} falhou: Timeout na conexão com API`,
        created_at: new Date(new Date(order.created_at).getTime() + i * 5000).toISOString(),
      });
    }
  }

  return logs;
};
