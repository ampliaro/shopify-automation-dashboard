/**
 * Filtros predefinidos úteis que o usuário pode adicionar facilmente
 */
export const defaultFilters = [
  {
    name: 'Problemas Hoje',
    status: 'failed',
    searchQuery: '',
    period: 'today',
  },
  {
    name: 'Últimas Falhas (7d)',
    status: 'failed',
    searchQuery: '',
    period: '7d',
  },
  {
    name: 'Pedidos Pendentes',
    status: 'received',
    searchQuery: '',
    period: '7d',
  },
  {
    name: 'Tudo de Hoje',
    status: 'all',
    searchQuery: '',
    period: 'today',
  },
  {
    name: 'Enviados (30d)',
    status: 'sent',
    searchQuery: '',
    period: '30d',
  },
];
