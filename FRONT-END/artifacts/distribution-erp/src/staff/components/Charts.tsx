import { useId } from 'react';
import type { SeriesPoint } from '../api';
import { formatMoney } from '../api';

/**
 * Lightweight area/line chart drawn in SVG (no chart dependency).
 * Values are normalised into a fixed viewBox; strokes use non-scaling so the
 * line weight stays constant while the chart stretches responsively.
 */
export function AreaChart({
  data,
  height = 190,
  color = '#5c9dff',
  valueFormat = (v: number) => formatMoney(v),
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  valueFormat?: (v: number) => string;
}) {
  const gid = useId().replace(/:/g, '');
  const W = 680;
  const H = height;
  const pad = 8;

  if (!data || data.length === 0) {
    return (
      <div className="sx-chart sx-chart-empty" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="sx-empty-inline" style={{ color: 'var(--muted)', fontSize: '11px' }}>
          Aucune donnée disponible sur la période sélectionnée.
        </span>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;

  const x = (i: number) => (data.length <= 1 ? W / 2 : (i / (data.length - 1)) * W);
  const y = (v: number) => pad + (1 - (v - min) / span) * (H - pad * 2);

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const last = data[data.length - 1];

  return (
    <div className="sx-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="sx-chart-svg" role="img">
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#fill-${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
        {last && <circle cx={x(data.length - 1)} cy={y(last.value)} r="4.5" fill={color} vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="sx-chart-scale">
        <span>{valueFormat(max)}</span>
        <span>{valueFormat((max + min) / 2)}</span>
        <span>{valueFormat(min)}</span>
      </div>
      <div className="sx-chart-x">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{last?.label}</span>
      </div>
    </div>
  );
}

/** Horizontal ranked bars — used for the breakdowns (dépôt, ville, commercial, produits). */
export function BarList({
  data,
  tone = 'blue',
  valueFormat = (v: number) => formatMoney(v),
  showMeta = 'count',
}: {
  data: SeriesPoint[];
  tone?: 'blue' | 'green' | 'amber' | 'violet';
  valueFormat?: (v: number) => string;
  showMeta?: 'count' | 'qty' | null;
}) {
  if (!data || data.length === 0) return <div className="sx-empty-inline">Aucune donnée sur la période.</div>;
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="sx-barlist">
      {data.map((d) => (
        <div className="sx-bar-row" key={d.label}>
          <span className="sx-bar-label" title={d.label}>{d.label}</span>
          <span className="sx-bar-track">
            <span className={`sx-bar-fill tone-${tone}`} style={{ width: `${Math.max(3, (d.value / max) * 100)}%` }} />
          </span>
          <span className="sx-bar-value">{valueFormat(d.value)}</span>
          {showMeta && d[showMeta] !== undefined && <span className="sx-bar-meta">{d[showMeta]}</span>}
        </div>
      ))}
    </div>
  );
}

/** Compact vertical columns for the orders-per-day evolution. */
export function ColumnChart({ data, color = '#53c29a' }: { data: SeriesPoint[]; color?: string }) {
  if (!data || data.length === 0) return <div className="sx-empty-inline">Aucune donnée disponible.</div>;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="sx-columns">
      {data.map((d, i) => (
        <div className="sx-col" key={i} title={`${d.label} · ${d.value}`}>
          <span className="sx-col-bar" style={{ height: `${Math.max(2, (d.value / max) * 100)}%`, background: color }} />
        </div>
      ))}
    </div>
  );
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
  formatted?: string;
}

/** Donut / Ring chart with clean SVG segments and center total indicator */
export function DonutChart({
  slices,
  size = 180,
  strokeWidth = 24,
  centerLabel = 'TOTAL',
  centerValue,
}: {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((acc, s) => acc + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
          ) : (
            slices.map((slice, i) => {
              const strokeDasharray = `${(slice.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (slice.value / total) * circumference;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              );
            })
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            {centerLabel}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: 1 }}>
            {centerValue || formatMoney(total)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '140px' }}>
        {slices.map((slice, i) => {
          const pct = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: slice.color, flexShrink: 0 }} />
                <span style={{ color: '#475569', fontWeight: 500 }}>{slice.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <b style={{ color: '#0f172a', fontWeight: 700 }}>{slice.formatted || formatMoney(slice.value)}</b>
                <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Horizontal Segmented Progress Bar */
export function MultiSegmentProgress({
  segments,
  height = 10,
}: {
  segments: { label: string; value: number; color: string }[];
  height?: number;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div>
      <div style={{ display: 'flex', height, borderRadius: 5, overflow: 'hidden', background: '#f1f5f9' }}>
        {segments.map((seg, i) => {
          const widthPct = total > 0 ? (seg.value / total) * 100 : 0;
          return (
            <div
              key={i}
              style={{
                width: `${widthPct}%`,
                background: seg.color,
                transition: 'width 0.4s ease',
              }}
              title={`${seg.label}: ${formatMoney(seg.value)} (${widthPct.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, flexWrap: 'wrap', gap: 8 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11px' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color }} />
            <span style={{ color: '#64748b' }}>{seg.label}</span>
            <strong style={{ color: '#0f172a' }}>{formatMoney(seg.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

