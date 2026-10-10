import { useId, useState, useEffect, useRef } from 'react';
import type { SeriesPoint } from '../api';
import { formatMoney } from '../api';

// Injected CSS animations for dynamic / moving visualizations ("kaytherko machi fix")
const CHART_ANIMATIONS = `
@keyframes chartLineDraw {
  from { stroke-dashoffset: 1200; opacity: 0.2; }
  to { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes chartAreaFade {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes chartPulseGlow {
  0% { r: 4px; opacity: 1; }
  50% { r: 9px; opacity: 0.4; }
  100% { r: 13px; opacity: 0; }
}
@keyframes chartSlicePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1.02); }
}
@keyframes liveRadarPing {
  0% { transform: scale(0.9); opacity: 0.8; }
  70% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.4); opacity: 0; }
}
.chart-tooltip-bubble {
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.35));
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.chart-bar-hover:hover {
  transform: translateX(3px);
  filter: brightness(1.15);
}
.chart-col-hover:hover {
  filter: brightness(1.25);
  transform: scaleY(1.04);
}
`;

function EnsureChartStyles() {
  return <style>{CHART_ANIMATIONS}</style>;
}

/**
 * Animated Number Counter (Count Up effect)
 */
export function AnimatedCounter({
  value,
  duration = 900,
  prefix = '',
  suffix = '',
  formatFn,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatFn?: (v: number) => string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = 0;
    const endVal = value;

    let animId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  const formatted = formatFn ? formatFn(displayValue) : displayValue.toLocaleString('fr-FR');
  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/**
 * Live Pulsing Radar Beacon
 */
export function LivePulse({
  color = '#10b981',
  label = 'En direct',
  size = 8,
}: {
  color?: string;
  label?: string;
  size?: number;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        fontWeight: 700,
        color,
        background: `${color}18`,
        padding: '3px 8px',
        borderRadius: '999px',
        border: `1px solid ${color}33`,
      }}
    >
      <span style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: color,
            opacity: 0.75,
            animation: 'liveRadarPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: color,
          }}
        />
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}

/**
 * Interactive & Animated Area/Line Chart
 * Displays real-time hover cursor, tooltip cards, luminous gradient, and pulsating live node.
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 60);
    return () => clearTimeout(timer);
  }, [data]);

  const W = 680;
  const H = height;
  const pad = 12;

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

  const points = data.map((d, i) => ({ x: x(i), y: y(d.value), item: d, idx: i }));
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${W} ${H} L0 ${H} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const normalizedX = (mouseX / rect.width) * W;

    // Find nearest point
    let closestIdx = 0;
    let minDistance = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - normalizedX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });
    setHoveredIdx(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div className="sx-chart" style={{ position: 'relative' }}>
      <EnsureChartStyles />

      {/* Floating Interactive Tooltip */}
      {activePoint && (
        <div
          className="chart-tooltip-bubble"
          style={{
            position: 'absolute',
            left: `${(activePoint.x / W) * 100}%`,
            top: `${Math.max(4, (activePoint.y / H) * 100 - 24)}%`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${color}66`,
            boxShadow: `0 8px 24px -4px rgba(0,0,0,0.4), 0 0 12px ${color}33`,
            borderRadius: '8px',
            padding: '5px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {activePoint.item.label}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
            {valueFormat(activePoint.item.value)}
          </span>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="sx-chart-svg"
        role="img"
        style={{ cursor: 'crosshair', overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.38" />
            <stop offset="65%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${gid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color} floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Subtle Horizontal Gridlines */}
        <line x1="0" y1={H * 0.25} x2={W} y2={H * 0.25} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <line x1="0" y1={H * 0.5} x2={W} y2={H * 0.5} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <line x1="0" y1={H * 0.75} x2={W} y2={H * 0.75} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

        {/* Area Fill with Animation */}
        <path
          d={area}
          fill={`url(#fill-${gid})`}
          style={{
            animation: isReady ? 'chartAreaFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          }}
        />

        {/* Animated Stroke Line */}
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${gid})`}
          style={{
            strokeDasharray: 1200,
            animation: isReady ? 'chartLineDraw 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          }}
        />

        {/* Interactive Guide Vertical Line */}
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={0}
            x2={activePoint.x}
            y2={H}
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.8"
            style={{ transition: 'x1 0.1s ease, x2 0.1s ease' }}
          />
        )}

        {/* All clickable/hoverable dots */}
        {points.map((p) => {
          const isActive = hoveredIdx === p.idx || (hoveredIdx === null && p.idx === points.length - 1);
          return (
            <g key={p.idx} style={{ cursor: 'pointer' }}>
              {isActive && (
                <>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill={color}
                    opacity="0.25"
                    style={{ animation: 'chartPulseGlow 1.8s infinite' }}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5.5"
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth="3"
                  />
                </>
              )}
              {!isActive && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="2.5"
                  fill={color}
                  opacity="0.6"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Axis Scales */}
      <div className="sx-chart-scale">
        <span>{valueFormat(max)}</span>
        <span>{valueFormat((max + min) / 2)}</span>
        <span>{valueFormat(min)}</span>
      </div>
      <div className="sx-chart-x">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span style={{ fontWeight: 700, color: color }}>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/**
 * Animated Horizontal Ranked Bars
 * Progressively expands with hover highlights, ranking badges, and interactive tooltips.
 */
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
  const [mounted, setMounted] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [data]);

  if (!data || data.length === 0) return <div className="sx-empty-inline">Aucune donnée sur la période.</div>;

  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const toneColors: Record<string, { bar: string; glow: string; text: string }> = {
    blue: { bar: 'linear-gradient(90deg, #0284c7, #38bdf8)', glow: 'rgba(56, 189, 248, 0.4)', text: '#38bdf8' },
    green: { bar: 'linear-gradient(90deg, #059669, #34d399)', glow: 'rgba(52, 211, 153, 0.4)', text: '#34d399' },
    amber: { bar: 'linear-gradient(90deg, #d97706, #fbbf24)', glow: 'rgba(251, 191, 36, 0.4)', text: '#fbbf24' },
    violet: { bar: 'linear-gradient(90deg, #7c3aed, #a78bfa)', glow: 'rgba(167, 139, 250, 0.4)', text: '#a78bfa' },
  };

  const activeColor = toneColors[tone] || toneColors.blue;

  return (
    <div className="sx-barlist">
      <EnsureChartStyles />
      {data.map((d, index) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0;
        const totalPct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
        const isHovered = hoveredLabel === d.label;

        return (
          <div
            className="sx-bar-row chart-bar-hover"
            key={d.label}
            onMouseEnter={() => setHoveredLabel(d.label)}
            onMouseLeave={() => setHoveredLabel(null)}
            style={{
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              padding: '4px 6px',
              borderRadius: '6px',
              background: isHovered ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: index === 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.06)',
                  color: index === 0 ? '#fbbf24' : '#94a3b8',
                  flexShrink: 0,
                }}
              >
                #{index + 1}
              </span>
              <span className="sx-bar-label" title={d.label} style={{ fontWeight: isHovered ? 700 : 500 }}>
                {d.label}
              </span>
            </div>

            <span className="sx-bar-track" style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }}>
              <span
                className={`sx-bar-fill tone-${tone}`}
                style={{
                  width: mounted ? `${Math.max(4, pct)}%` : '0%',
                  background: activeColor.bar,
                  boxShadow: isHovered ? `0 0 12px ${activeColor.glow}` : 'none',
                  transition: `width 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms, box-shadow 0.2s ease`,
                  borderRadius: 6,
                  height: '100%',
                }}
              />
            </span>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="sx-bar-value" style={{ color: isHovered ? activeColor.text : undefined }}>
                {valueFormat(d.value)}
              </span>
              <small style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>({totalPct}%)</small>
            </div>

            {showMeta && d[showMeta] !== undefined && (
              <span className="sx-bar-meta" style={{ fontWeight: 600, color: '#94a3b8' }}>
                {d[showMeta]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Animated Vertical Columns
 * Columns grow smoothly upwards with staggered spring animation and floating hover details.
 */
export function ColumnChart({ data, color = '#53c29a' }: { data: SeriesPoint[]; color?: string }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [data]);

  if (!data || data.length === 0) return <div className="sx-empty-inline">Aucune donnée disponible.</div>;

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div style={{ position: 'relative' }}>
      <EnsureChartStyles />

      {/* Floating column tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="chart-tooltip-bubble"
          style={{
            position: 'absolute',
            top: -34,
            left: `${((hoveredIdx + 0.5) / data.length) * 100}%`,
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: `1px solid ${color}55`,
            boxShadow: `0 8px 20px rgba(0,0,0,0.4), 0 0 10px ${color}33`,
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#f8fafc',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: '#94a3b8', marginRight: 4, fontWeight: 500 }}>{data[hoveredIdx].label}:</span>
          <span style={{ color }}>{data[hoveredIdx].value}</span>
        </div>
      )}

      <div className="sx-columns" style={{ height: 90, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        {data.map((d, i) => {
          const heightPct = Math.max(4, (d.value / max) * 100);
          const isHovered = hoveredIdx === i;

          return (
            <div
              className="sx-col chart-col-hover"
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                height: '100%',
                cursor: 'pointer',
              }}
            >
              <span
                className="sx-col-bar"
                style={{
                  width: '100%',
                  height: mounted ? `${heightPct}%` : '0%',
                  background: isHovered
                    ? `linear-gradient(180deg, #38bdf8, ${color})`
                    : `linear-gradient(180deg, ${color}, ${color}99)`,
                  boxShadow: isHovered ? `0 -2px 10px ${color}` : 'none',
                  borderRadius: '4px 4px 1px 1px',
                  transition: `height 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 24}ms, background 0.15s ease, box-shadow 0.15s ease`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
  formatted?: string;
}

/**
 * Animated Donut Chart
 * Animated stroke sweep on mount, interactive slice expansions on hover,
 * dynamic center label updates, and interactive glowing legend.
 */
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
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [slices]);

  const total = slices.reduce((acc, s) => acc + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;
  const activeLabel = activeSlice ? activeSlice.label : centerLabel;
  const activeValue = activeSlice
    ? (activeSlice.formatted || formatMoney(activeSlice.value))
    : (centerValue || formatMoney(total));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
      <EnsureChartStyles />

      {/* Donut SVG Ring */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#334155"
              strokeWidth={strokeWidth}
              opacity="0.3"
            />
          ) : (
            slices.map((slice, i) => {
              const slicePct = slice.value / total;
              const sliceLength = slicePct * circumference;
              const strokeDasharray = `${mounted ? sliceLength : 0} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += sliceLength;

              const isHovered = hoveredIndex === i;
              const currentStrokeWidth = isHovered ? strokeWidth + 4 : strokeWidth;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={currentStrokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    filter: isHovered ? `drop-shadow(0 0 8px ${slice.color})` : 'none',
                    opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1,
                  }}
                />
              );
            })
          )}
        </svg>

        {/* Dynamic Center Label */}
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
            padding: '12px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: activeSlice ? activeSlice.color : 'var(--muted, #64748b)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              transition: 'color 0.2s ease',
              maxWidth: size - strokeWidth * 2 - 10,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {activeLabel}
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: 'var(--foreground, #f8fafc)',
              marginTop: 2,
              letterSpacing: '-0.02em',
            }}
          >
            {activeValue}
          </span>
          {activeSlice && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', marginTop: 1 }}>
              {((activeSlice.value / (total || 1)) * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Interactive Legend Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
        {slices.map((slice, i) => {
          const pct = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0';
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                padding: '5px 8px',
                borderRadius: '6px',
                background: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateX(4px)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: slice.color,
                    flexShrink: 0,
                    boxShadow: isHovered ? `0 0 8px ${slice.color}` : 'none',
                    transition: 'box-shadow 0.2s ease',
                  }}
                />
                <span style={{ color: isHovered ? '#f8fafc' : 'var(--muted, #94a3b8)', fontWeight: isHovered ? 700 : 500 }}>
                  {slice.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <b style={{ color: isHovered ? slice.color : 'var(--foreground, #f1f5f9)', fontWeight: 700 }}>
                  {slice.formatted || formatMoney(slice.value)}
                </b>
                <span style={{ color: '#64748b', fontSize: '10.5px' }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Animated Horizontal Segmented Progress Bar
 */
export function MultiSegmentProgress({
  segments,
  height = 12,
}: {
  segments: { label: string; value: number; color: string }[];
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [segments]);

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div>
      <EnsureChartStyles />
      <div
        style={{
          display: 'flex',
          height,
          borderRadius: 6,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {segments.map((seg, i) => {
          const widthPct = total > 0 ? (seg.value / total) * 100 : 0;
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                width: mounted ? `${widthPct}%` : '0%',
                background: seg.color,
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease',
                filter: isHovered ? 'brightness(1.2)' : 'none',
                cursor: 'pointer',
              }}
              title={`${seg.label}: ${formatMoney(seg.value)} (${widthPct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
        {segments.map((seg, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '11px',
                padding: '3px 6px',
                borderRadius: '4px',
                background: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 3,
                  background: seg.color,
                  boxShadow: isHovered ? `0 0 6px ${seg.color}` : 'none',
                }}
              />
              <span style={{ color: isHovered ? '#f1f5f9' : 'var(--muted, #94a3b8)', fontWeight: isHovered ? 700 : 500 }}>
                {seg.label}
              </span>
              <strong style={{ color: isHovered ? seg.color : 'var(--foreground, #f8fafc)' }}>
                {formatMoney(seg.value)}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
