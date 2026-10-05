import type { WarehouseNode } from '../api';

// Fixed bounding box for mainland Morocco so the schematic outline stays
// geographically coherent. Markers are projected with the same transform.
const BBOX = { minLat: 27.4, maxLat: 36.2, minLng: -11.8, maxLng: -1.0 };
const W = 640;
const H = 560;

// Simplified Morocco outline as [lng, lat] pairs (clockwise from the north).
const OUTLINE: [number, number][] = [
  [-5.9, 35.8], [-5.3, 35.2], [-4.4, 35.0], [-3.0, 35.1], [-2.9, 34.0],
  [-2.0, 33.0], [-1.7, 32.0], [-2.6, 31.0], [-3.6, 30.9], [-4.8, 30.5],
  [-6.0, 29.5], [-8.7, 28.7], [-8.8, 27.7], [-10.5, 27.3], [-11.4, 26.9],
  [-11.8, 27.5], [-13.0, 28.5], [-12.5, 29.5], [-11.5, 30.1], [-10.9, 30.6],
  [-10.0, 31.2], [-9.0, 32.5], [-8.0, 33.3], [-7.0, 33.9], [-6.5, 34.5], [-6.0, 35.2],
];

function projectX(lng: number): number {
  return ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * W;
}
function projectY(lat: number): number {
  return ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * H;
}

const OUTLINE_PATH =
  OUTLINE.map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'}${projectX(lng).toFixed(1)} ${projectY(lat).toFixed(1)}`).join(' ') + ' Z';

function statusTone(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('satur') || s.includes('warn')) return '#eab767';
  if (s.includes('inact') || s.includes('ferm')) return '#ef827e';
  return '#53c29a';
}

export function MapCanvas({
  warehouses,
  selectedId,
  onSelect,
  compact = false,
}: {
  warehouses: WarehouseNode[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  compact?: boolean;
}) {
  const plottable = warehouses.filter((w) => w.lat !== null && w.lng !== null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`sx-map ${compact ? 'sx-map-compact' : ''}`} role="img" aria-label="Carte des dépôts">
      <path d={OUTLINE_PATH} className="sx-map-land" />
      {plottable.map((w) => {
        const cx = projectX(w.lng as number);
        const cy = projectY(w.lat as number);
        const tone = statusTone(w.status);
        const r = compact ? 7 : 9 + Math.min(10, w.revenue / 120000);
        const active = selectedId === w.id;
        return (
          <g
            key={w.id}
            className="sx-map-marker"
            transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)})`}
            onClick={() => onSelect?.(w.id)}
            role="button"
            aria-label={w.name}
          >
            {active && <circle r={r + 7} fill={tone} opacity="0.18" />}
            <circle r={r} fill={tone} stroke="#0d141e" strokeWidth="2.5" />
            <text y={-r - 6} textAnchor="middle" className="sx-map-label">{compact ? w.code : w.city}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function MapLegend() {
  return (
    <div className="sx-map-legend">
      <span><i style={{ background: '#53c29a' }} /> Actif</span>
      <span><i style={{ background: '#eab767' }} /> Saturé</span>
      <span><i style={{ background: '#ef827e' }} /> Inactif</span>
    </div>
  );
}
