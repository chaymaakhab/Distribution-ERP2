import { useState } from 'react';
import {
  Bell, X, CheckCircle2, AlertTriangle, Clock, Truck,
  BadgeDollarSign, Boxes, ArrowRight, Check, Trash2,
} from 'lucide-react';
import './notifications.css';

export interface ErpNotification {
  id: string;
  type: 'alert' | 'operation' | 'financial' | 'delivery';
  title: string;
  message: string;
  time: string;
  read: boolean;
  segment: string;
}

const INITIAL_NOTIFICATIONS: ErpNotification[] = [
  {
    id: 'n-1',
    type: 'alert',
    title: 'Alerte stock critique · Huile Végétale 5L',
    message: 'Le stock au Dépôt DEP-01 Casablanca Central est inférieur au seuil d’alerte (48 bidons restants).',
    time: 'Il y a 12 min',
    read: false,
    segment: 'inventory',
  },
  {
    id: 'n-2',
    type: 'financial',
    title: 'Effet bancaire impayé · CIH Bank',
    message: 'Chèque CHQ-001298 (14 500 DH) rejeté pour provision insuffisante · Quincaillerie Saada.',
    time: 'Il y a 45 min',
    read: false,
    segment: 'finance',
  },
  {
    id: 'n-3',
    type: 'delivery',
    title: 'Tournée TRN-2026-08 · Livreur en route',
    message: 'Mehdi Lahlou a validé l’arrêt 1 (Comptoir Al Amal) et se dirige vers BatiPro Maroc.',
    time: 'Il y a 1h 20',
    read: false,
    segment: 'deliveries',
  },
  {
    id: 'n-4',
    type: 'operation',
    title: 'Nouvelle commande B2B · CMD-2407',
    message: 'Commande de 28 400 DH soumise par Atlas Équipements. En attente de validation commerciale.',
    time: 'Aujourd’hui 09:30',
    read: false,
    segment: 'orders',
  },
  {
    id: 'n-5',
    type: 'operation',
    title: 'Réception fournisseur en transit',
    message: 'Bon de commande BC-2026-042 (Lesieur Cristal · 178 000 DH) attendu aujourd’hui au quai 2.',
    time: 'Hier 17:45',
    read: true,
    segment: 'purchasing',
  },
];

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (segment: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  onNavigate,
  onUnreadCountChange,
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<ErpNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'alert' | 'operation'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id: string) {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    if (onUnreadCountChange) onUnreadCountChange(updated.filter((n) => !n.read).length);
  }

  function markAllAsRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    if (onUnreadCountChange) onUnreadCountChange(0);
  }

  function clearAll() {
    setNotifications([]);
    if (onUnreadCountChange) onUnreadCountChange(0);
  }

  function handleItemClick(n: ErpNotification) {
    markAsRead(n.id);
    onNavigate(n.segment);
    onClose();
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'alert') return n.type === 'alert' || n.type === 'financial';
    if (filter === 'operation') return n.type === 'operation' || n.type === 'delivery';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="notif-backdrop" onClick={onClose}>
      <div className="notif-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-title">
            <div className="notif-header-bell">
              <Bell size={16} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </div>
            <div>
              <h3>Notifications & Alertes</h3>
              <small>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</small>
            </div>
          </div>
          <div className="notif-header-actions">
            {unreadCount > 0 && (
              <button className="notif-action-btn" onClick={markAllAsRead} title="Tout marquer comme lu">
                <Check size={14} /> Marquer lu
              </button>
            )}
            <button className="icon-button" onClick={onClose} aria-label="Fermer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="notif-filter-tabs">
          <button
            className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </button>
          <button
            className={`notif-tab ${filter === 'alert' ? 'active' : ''}`}
            onClick={() => setFilter('alert')}
          >
            Alertes ({notifications.filter((n) => n.type === 'alert' || n.type === 'financial').length})
          </button>
          <button
            className={`notif-tab ${filter === 'operation' ? 'active' : ''}`}
            onClick={() => setFilter('operation')}
          >
            Opérations ({notifications.filter((n) => n.type === 'operation' || n.type === 'delivery').length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="notif-list">
          {filtered.length === 0 ? (
            <div className="notif-empty">
              <CheckCircle2 size={32} style={{ color: '#22c55e', opacity: 0.8 }} />
              <p>Aucune notification</p>
              <small>Toutes vos alertes et opérations ont été traitées.</small>
            </div>
          ) : (
            filtered.map((n) => {
              const Icon =
                n.type === 'alert'
                  ? AlertTriangle
                  : n.type === 'financial'
                  ? BadgeDollarSign
                  : n.type === 'delivery'
                  ? Truck
                  : Boxes;
              const color =
                n.type === 'alert'
                  ? '#ef4444'
                  : n.type === 'financial'
                  ? '#f59e0b'
                  : n.type === 'delivery'
                  ? '#38bdf8'
                  : '#3b82f6';
              return (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div
                    className="notif-item-icon"
                    style={{ background: `${color}18`, color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="notif-item-body">
                    <div className="notif-item-head">
                      <strong className="notif-item-title">{n.title}</strong>
                      {!n.read && <span className="notif-item-dot" />}
                    </div>
                    <p className="notif-item-text">{n.message}</p>
                    <div className="notif-item-footer">
                      <span className="notif-item-time">
                        <Clock size={11} /> {n.time}
                      </span>
                      <span className="notif-item-link">
                        Accéder <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="notif-footer">
            <button className="notif-clear-btn" onClick={clearAll}>
              <Trash2 size={13} /> Effacer toutes les notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
