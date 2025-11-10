import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TimeseriesData } from '../lib/api';

interface TimeseriesChartProps {
  data: TimeseriesData | null;
  loading: boolean;
  onDateClick?: (date: string) => void;
}

function formatXAxis(value: string, dateFormat: string): string {
  try {
    const date = new Date(value);

    if (dateFormat === 'hour') {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return value;
  }
}

export default function TimeseriesChart({ data, loading, onDateClick }: TimeseriesChartProps) {
  if (loading) {
    return (
      <div className="chart-container loading">
        <div className="skeleton skeleton-chart"></div>
      </div>
    );
  }

  if (!data || data.series.length === 0) {
    return (
      <div className="chart-container empty">
        <p>Nenhum dado disponível para o período selecionado</p>
      </div>
    );
  }

  const handleClick = (e: any) => {
    if (e && e.activeLabel && onDateClick) {
      onDateClick(e.activeLabel);
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Pedidos no Período</h3>
        {onDateClick && (
          <span className="chart-hint">💡 Clique em um ponto para filtrar a tabela</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data.series}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={handleClick}
          style={{ cursor: onDateClick ? 'pointer' : 'default' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="period"
            tickFormatter={(value) => formatXAxis(value, data.dateFormat)}
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#666" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
            }}
            labelFormatter={(value) => formatXAxis(value, data.dateFormat)}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#757575"
            strokeWidth={2}
            name="Total"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="sent"
            stroke="#4CAF50"
            strokeWidth={2}
            name="Enviados"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="#F44336"
            strokeWidth={2}
            name="Falhados"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="received"
            stroke="#2196F3"
            strokeWidth={2}
            name="Recebidos"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
