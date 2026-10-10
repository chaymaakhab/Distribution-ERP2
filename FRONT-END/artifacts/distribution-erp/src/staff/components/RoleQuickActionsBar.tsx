import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  bg?: string;
  onClick: () => void;
  primary?: boolean;
}

interface RoleQuickActionsBarProps {
  roleTitle?: string;
  actions: QuickActionItem[];
}

export default function RoleQuickActionsBar({
  roleTitle,
  actions,
}: RoleQuickActionsBarProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--navy-2)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        padding: '10px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#38bdf8',
          }}
        >
          Actions Rapides {roleTitle ? `· ${roleTitle}` : ''}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          Création et saisies opérationnelles autorisées
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {actions.map((act) => {
          const isPrimary = !!act.primary;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              type="button"
              className={isPrimary ? 'button-primary' : 'button-secondary'}
              style={{
                height: 32,
                fontSize: 12,
                fontWeight: 600,
                padding: '0 12px',
                background: act.bg || (isPrimary ? '#0284c7' : undefined),
                borderColor: act.color || (isPrimary ? '#0369a1' : undefined),
                color: act.color && !isPrimary ? act.color : undefined,
              }}
              title={act.description || act.label}
            >
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
