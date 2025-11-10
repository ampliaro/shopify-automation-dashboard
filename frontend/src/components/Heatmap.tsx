import { useState } from 'react';
import { HeatmapData } from '../lib/api';

interface HeatmapProps {
  data: HeatmapData | null;
  loading: boolean;
}

function getIntensityColor(count: number, max: number): { background: string; textColor: string } {
  if (count === 0) {
    return { background: '#f5f5f5', textColor: '#999' };
  }

  const intensity = count / max;

  if (intensity < 0.2) return { background: '#E8F5E9', textColor: '#2E7D32' }; // Verde muito claro
  if (intensity < 0.4) return { background: '#C8E6C9', textColor: '#1B5E20' }; // Verde claro
  if (intensity < 0.6) return { background: '#81C784', textColor: '#1B5E20' }; // Verde médio claro
  if (intensity < 0.8) return { background: '#66BB6A', textColor: '#FFFFFF' }; // Verde médio - texto branco
  return { background: '#4CAF50', textColor: '#FFFFFF' }; // Verde forte - texto branco
}

export default function Heatmap({ data, loading }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="heatmap-container loading">
        <div className="skeleton skeleton-text"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const maxCount = Math.max(...data.heatmap);

  return (
    <div className="heatmap-container">
      <h3 className="heatmap-title">Distribuição por Hora (Hoje)</h3>
      <div className="heatmap-grid">
        {data.heatmap.map((count, hour) => {
          const colors = getIntensityColor(count, maxCount);
          return (
            <div
              key={hour}
              className="heatmap-cell"
              style={{
                backgroundColor: colors.background,
                color: colors.textColor,
              }}
              onMouseEnter={() => setHoveredCell(hour)}
              onMouseLeave={() => setHoveredCell(null)}
              title={`${hour}h: ${count} pedidos`}
            >
              <span className="heatmap-hour">{hour}h</span>
              {hoveredCell === hour && (
                <div className="heatmap-tooltip">
                  {count} pedido{count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="heatmap-legend">
        <span>Menos</span>
        <div className="legend-gradient"></div>
        <span>Mais</span>
      </div>
    </div>
  );
}
