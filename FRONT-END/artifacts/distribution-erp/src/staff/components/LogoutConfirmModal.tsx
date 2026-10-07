import { LogOut, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import type { StaffUser } from '../api';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  user: StaffUser;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({
  isOpen,
  user,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  const primaryRole = user.roles.find((r) => r.is_primary) ?? user.roles[0];

  return (
    <div className="modal-backdrop" onClick={onCancel} style={{ zIndex: 1000 }}>
      <div
        className="record-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460, animation: 'searchFadeIn 0.15s ease-out' }}
      >
        <div className="modal-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              <LogOut size={18} />
            </div>
            <div>
              <span className="eyebrow">CONFIRMATION · SESSION UTILISATEUR</span>
              <h2 style={{ fontSize: 17 }}>Se déconnecter de l’ERP ?</h2>
            </div>
          </div>
          <button className="icon-button" onClick={onCancel} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <div style={{ margin: '14px 0 20px', lineHeight: 1.55 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>
            Vous êtes actuellement connecté en tant que{' '}
            <strong style={{ color: 'var(--text)' }}>{user.name}</strong>{' '}
            (<span>{primaryRole?.name || 'Collaborateur'}</span>).
          </p>
          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--navy-2)',
              border: '1px solid var(--line)',
              fontSize: 12,
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldAlert size={15} style={{ color: '#38bdf8', flex: 'none' }} />
            <span>Vos droits et votre périmètre de dépôt seront réinitialisés lors de la déconnexion.</span>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 0 }}>
          <button className="button-secondary" onClick={onCancel} style={{ gap: 6 }}>
            <ArrowLeft size={14} /> Continuer ma session
          </button>
          <button
            className="button-primary"
            onClick={onConfirm}
            style={{
              background: '#ef4444',
              borderColor: '#dc2626',
              gap: 6,
            }}
          >
            <LogOut size={14} /> Confirmer la déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
