import React from 'react';
import {
  Plus, Users, ShoppingBag, Truck, Boxes, BadgeDollarSign,
  FileText, Undo2, ArrowLeftRight, CheckCircle2, ShieldCheck,
  Package, MapPin, Receipt, CreditCard, Sparkles, Building2,
  Calendar, Layers, ShieldAlert, LucideIcon
} from 'lucide-react';

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
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
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#38bdf8',
              }}
            >
              ACTIONS RAPIDES MÉTIER {roleTitle ? `· ${roleTitle.toUpperCase()}` : ''}
            </span>
          </div>
          <b style={{ fontSize: 13, color: 'var(--text)', display: 'block', marginTop: 1 }}>
            Ajouter ou créer selon vos permissions
          </b>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {actions.map((act) => {
          const Icon = act.icon;
          const isPrimary = !!act.primary;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              type="button"
              className={isPrimary ? 'button-primary' : 'button-secondary'}
              style={{
                height: 34,
                fontSize: 12,
                fontWeight: 600,
                gap: 6,
                padding: '0 12px',
                background: act.bg || (isPrimary ? '#0284c7' : undefined),
                borderColor: act.color || (isPrimary ? '#0369a1' : undefined),
                color: act.color && !isPrimary ? act.color : undefined,
              }}
              title={act.description || act.label}
            >
              <Icon size={14} />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
