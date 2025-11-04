import { useState } from 'react';
import { MetricsSummary } from '../lib/api';

interface MetricCardsProps {
  summary: MetricsSummary | null;
  loading: boolean;
}

interface CardInfo {
  label: string;
  value: string | number;
  delta: { text: string; className: string } | null;
  icon: string;
  alert?: boolean;
  tooltip: string;
}

function formatTimeToSent(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = (minutes / 60).toFixed(1);
  return `${hours} h`;
}

function formatDelta(delta: number | null | undefined): { text: string; className: string } {
  // Proteção contra valores inválidos
  if (delta === null || delta === undefined || isNaN(delta) || !isFinite(delta)) {
    return {
      text: '0.0%',
      className: 'neutral'
    };
  }
  
  const sign = delta >= 0 ? '+' : '';
  const formatted = `${sign}${delta.toFixed(1)}%`;
  
  return {
    text: formatted,
    className: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'
  };
}

export default function MetricCards({ summary, loading }: MetricCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="metrics-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="metric-card loading">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-number"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const cards: CardInfo[] = [
    {
      label: 'Pedidos',
      value: summary.current.totalOrders,
      delta: formatDelta(summary.deltas.totalOrders),
      icon: '📦',
      tooltip: 'Total de pedidos recebidos no período selecionado. O comparativo mostra a variação percentual em relação ao período anterior.'
    },
    {
      label: 'Taxa de Sucesso',
      value: `${summary.current.successRate.toFixed(1)}%`,
      delta: formatDelta(summary.deltas.successRate),
      icon: '✅',
      tooltip: 'Percentual de pedidos enviados com sucesso para o fulfillment. Quanto maior, melhor o desempenho do sistema.'
    },
    {
      label: 'Falhas',
      value: summary.current.failedOrders,
      delta: formatDelta(summary.deltas.failedOrders),
      icon: '⚠️',
      alert: summary.current.failedOrders > 0 && 
             (summary.current.failedOrders / summary.current.totalOrders) > 0.2,
      tooltip: 'Número de pedidos que falharam ao enviar para o fulfillment. Se a taxa for maior que 20%, um alerta é disparado.'
    },
    {
      label: 'Tempo Médio',
      value: formatTimeToSent(summary.current.avgTimeToSent),
      delta: null,
      icon: '⏱️',
      tooltip: 'Tempo médio entre o recebimento do pedido e o envio bem-sucedido para o fulfillment. Mostra a eficiência do processamento.'
    }
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`metric-card ${card.alert ? 'alert' : ''}`}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="metric-header">
            <div className="metric-header-left">
              <span className="metric-icon">{card.icon}</span>
              <span className="metric-label">{card.label}</span>
            </div>
            <div className="metric-info-icon">
              <span className="info-icon">ⓘ</span>
              {hoveredCard === index && (
                <div className="metric-tooltip">
                  {card.tooltip}
                </div>
              )}
            </div>
          </div>
          <div className="metric-value">{card.value}</div>
          {card.delta && (
            <div className={`metric-delta ${card.delta.className}`}>
              {card.delta.text} vs anterior
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

