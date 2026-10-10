import { useState, useMemo, useEffect } from 'react';
import {
  Bell, X, CheckCircle2, AlertTriangle, Clock, Truck,
  BadgeDollarSign, Boxes, ArrowRight, Check, Trash2, ShieldAlert,
  Crown, UserCheck, Layers, Sparkles,
} from 'lucide-react';
import './notifications.css';

export interface ErpNotification {
  id: string;
  type: 'validation' | 'alert' | 'operation' | 'financial' | 'delivery';
  title: string;
  message: string;
  time: string;
  read: boolean;
  segment: string;
  priority?: 'critical' | 'high' | 'normal';
  requiredPermission?: string;
  requiredRoles?: string[];
}

export const ALL_SYSTEM_NOTIFICATIONS: ErpNotification[] = [
  // ── SUPER ADMIN & ADMIN VALIDATION TASKS / ARBITRAGES ──
  {
    id: 'n-task-1',
    type: 'validation',
    priority: 'critical',
    title: 'Arbitrage Super Admin requis · Litige Retour RET-2026-018',
    message: 'Épicerie Centrale Saïd (3 300 DH). Motif: Huile 5L percée transport. Décision requise : Réintégration stock ou mise au rebut.',
    time: 'Il y a 5 min',
    read: false,
    segment: 'dashboard',
    requiredPermission: 'returns.manage',
    requiredRoles: ['superadmin', 'admin'],
  },
  {
    id: 'n-task-2',
    type: 'validation',
    priority: 'high',
    title: 'Dérogation crédit requise · Commande CMD-2408',
    message: 'Maison du Bricolage (12 450 DH). Plafond crédit 35 000 DH dépassé (encours actuel 38 200 DH). Décision Direction requise.',
    time: 'Il y a 25 min',
    read: false,
    segment: 'orders',
    requiredPermission: 'orders.validate',
    requiredRoles: ['superadmin', 'admin'],
  },
  {
    id: 'n-task-3',
    type: 'validation',
    priority: 'high',
    title: 'Visa d’Avoir exceptionnel · AV-2026-004',
    message: 'Demande d’avoir de 8 450 DH émise par la comptabilité pour Quincaillerie Saada. En attente de visa Super Admin.',
    time: 'Il y a 40 min',
    read: false,
    segment: 'finance',
    requiredPermission: 'invoices.manage',
    requiredRoles: ['superadmin', 'admin'],
  },

  // ── STOCK & ENTREPÔT ALERTS ──
  {
    id: 'n-stock-1',
    type: 'alert',
    priority: 'critical',
    title: 'Alerte stock critique · Huile Végétale 5L',
    message: 'Le stock au Dépôt DEP-01 Casablanca Central est inférieur au seuil de sécurité (48 bidons restants).',
    time: 'Il y a 12 min',
    read: false,
    segment: 'inventory',
    requiredPermission: 'stock.view',
  },
  {
    id: 'n-stock-2',
    type: 'operation',
    priority: 'normal',
    title: 'Réception fournisseur attendue au quai 2',
    message: 'Bon de commande BC-2026-042 (Lesieur Cristal · 178 000 DH) programmé pour déchargement aujourd’hui.',
    time: 'Il y a 1h 10',
    read: false,
    segment: 'purchasing',
    requiredPermission: 'purchases.view',
  },
  {
    id: 'n-stock-3',
    type: 'operation',
    priority: 'normal',
    title: 'Transfert inter-dépôts en transit · TRF-084',
    message: 'Navette Casa → Rabat en route (Groupe électrogène + Disques diamant). Quai de déchargement DEP-02 réservé.',
    time: 'Il y a 2h',
    read: true,
    segment: 'inventory',
    requiredPermission: 'stock.view',
  },

  // ── FINANCE & COMPTABILITÉ ALERTS ──
  {
    id: 'n-fin-1',
    type: 'financial',
    priority: 'critical',
    title: 'Effet bancaire impayé · CIH Bank',
    message: 'Chèque CHQ-001298 (14 500 DH) rejeté pour provision insuffisante · Quincaillerie Saada. Avis d’impayé généré.',
    time: 'Il y a 45 min',
    read: false,
    segment: 'finance',
    requiredPermission: 'invoices.view',
    requiredRoles: ['accounting', 'admin', 'superadmin'],
  },
  {
    id: 'n-fin-2',
    type: 'financial',
    priority: 'high',
    title: 'Facture échue à relancer (J+45)',
    message: 'Facture FAC-2025-182 (32 100 DH) pour Comptoir Al Amal échue depuis plus de 45 jours. Relance requise.',
    time: 'Aujourd’hui 08:30',
    read: false,
    segment: 'finance',
    requiredPermission: 'invoices.view',
    requiredRoles: ['accounting', 'admin', 'superadmin'],
  },
  {
    id: 'n-fin-3',
    type: 'financial',
    priority: 'normal',
    title: 'Bordereau de remise chèques en banque',
    message: '3 chèques en portefeuille atteignant l’échéance (44 600 DH). Prêts pour télétransmission et remise.',
    time: 'Hier 16:30',
    read: true,
    segment: 'payments',
    requiredPermission: 'payments.view',
    requiredRoles: ['accounting', 'admin', 'superadmin'],
  },

  // ── COMMERCIAL & CRM ALERTS ──
  {
    id: 'n-com-1',
    type: 'operation',
    priority: 'normal',
    title: 'Nouvelle commande client · CMD-2407',
    message: 'Commande de 28 400 DH soumise par Atlas Équipements. En attente de validation commerciale.',
    time: 'Aujourd’hui 09:30',
    read: false,
    segment: 'orders',
    requiredPermission: 'orders.view',
  },
  {
    id: 'n-com-2',
    type: 'operation',
    priority: 'normal',
    title: 'Visite terrain planifiée aujourd’hui',
    message: 'Rendez-vous à 14h30 chez Atlas Équipements (Casablanca) pour présentation de la gamme outillage 2026.',
    time: 'Aujourd’hui 08:00',
    read: false,
    segment: 'dashboard',
    requiredPermission: 'customers.view',
    requiredRoles: ['commercial', 'admin', 'superadmin'],
  },

  // ── DISTRIBUTION & LIVRAISON ALERTS ──
  {
    id: 'n-del-1',
    type: 'delivery',
    priority: 'normal',
    title: 'Tournée TRN-2026-08 · Livreur en route',
    message: 'Mehdi Lahlou a validé l’arrêt 1 (Comptoir Al Amal) et se dirige vers BatiPro Maroc.',
    time: 'Il y a 1h 20',
    read: false,
    segment: 'deliveries',
    requiredPermission: 'deliveries.view',
  },
  {
    id: 'n-del-2',
    type: 'delivery',
    priority: 'normal',
    title: 'Prise de commande terrain réussie',
    message: 'Livreur pré-vendeur Hamid El Meskini a enregistré une vente directe de 1 249 DH à Derb Sultan.',
    time: 'Il y a 3h',
    read: true,
    segment: 'deliveries',
    requiredPermission: 'deliveries.view',
    requiredRoles: ['delivery', 'pre_seller', 'warehouse', 'admin', 'superadmin'],
  },
];

export function filterNotificationsByPermissions(
  items: ErpNotification[],
  hasPermission: (perm: string) => boolean,
  userRole?: string,
  userPermissions: string[] = []
): ErpNotification[] {
  const isSuperAdmin = userPermissions.includes('*') || userRole === 'superadmin';
  return items.filter((n) => {
    if (isSuperAdmin) return true;
    if (n.requiredRoles && userRole && n.requiredRoles.includes(userRole)) return true;
    if (!n.requiredPermission) return true;
    return hasPermission(n.requiredPermission);
  });
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (segment: string) => void;
  onUnreadCountChange?: (count: number) => void;
  hasPermission?: (perm: string) => boolean;
  userRole?: string;
  userPermissions?: string[];
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  onNavigate,
  onUnreadCountChange,
  hasPermission = () => true,
  userRole,
  userPermissions = [],
}: NotificationsDrawerProps) {
  // Store all notifications
  const [allNotifications, setAllNotifications] = useState<ErpNotification[]>(ALL_SYSTEM_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'validation' | 'alert' | 'operation'>('all');

  // Filter allowed notifications based on user permissions
  const allowedNotifications = useMemo(() => {
    return filterNotificationsByPermissions(allNotifications, hasPermission, userRole, userPermissions);
  }, [allNotifications, hasPermission, userRole, userPermissions]);

  const unreadCount = allowedNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  function markAsRead(id: string) {
    const updated = allNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setAllNotifications(updated);
  }

  function markAllAsRead() {
    const allowedIds = new Set(allowedNotifications.map((n) => n.id));
    const updated = allNotifications.map((n) => (allowedIds.has(n.id) ? { ...n, read: true } : n));
    setAllNotifications(updated);
  }

  function clearAll() {
    const allowedIds = new Set(allowedNotifications.map((n) => n.id));
    setAllNotifications((prev) => prev.filter((n) => !allowedIds.has(n.id)));
  }

  function handleItemClick(n: ErpNotification) {
    markAsRead(n.id);
    onNavigate(n.segment);
    onClose();
  }

  const filtered = allowedNotifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'validation') return n.type === 'validation';
    if (filter === 'alert') return n.type === 'alert' || n.type === 'financial';
    if (filter === 'operation') return n.type === 'operation' || n.type === 'delivery';
    return true;
  });

  const validationCount = allowedNotifications.filter((n) => n.type === 'validation').length;

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
              <h3>Notifications &amp; Alertes</h3>
              <small>
                Filtrées selon vos permissions · {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </small>
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
            Toutes ({allowedNotifications.length})
          </button>
          {validationCount > 0 && (
            <button
              className={`notif-tab ${filter === 'validation' ? 'active' : ''}`}
              onClick={() => setFilter('validation')}
              style={{ color: '#0284c7', fontWeight: 700 }}
            >
              Validations ({validationCount})
            </button>
          )}
          <button
            className={`notif-tab ${filter === 'alert' ? 'active' : ''}`}
            onClick={() => setFilter('alert')}
          >
            Alertes ({allowedNotifications.filter((n) => n.type === 'alert' || n.type === 'financial').length})
          </button>
          <button
            className={`notif-tab ${filter === 'operation' ? 'active' : ''}`}
            onClick={() => setFilter('operation')}
          >
            Opérations ({allowedNotifications.filter((n) => n.type === 'operation' || n.type === 'delivery').length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="notif-list">
          {filtered.length === 0 ? (
            <div className="notif-empty">
              <CheckCircle2 size={32} style={{ color: '#22c55e', opacity: 0.8 }} />
              <p>Aucune notification</p>
              <small>Toutes vos alertes et opérations ont été traitées ou sont conformes.</small>
            </div>
          ) : (
            filtered.map((n) => {
              let Icon = Boxes;
              let color = '#3b82f6';
              if (n.type === 'validation') {
                Icon = Crown;
                color = '#0284c7';
              } else if (n.type === 'alert') {
                Icon = AlertTriangle;
                color = '#ef4444';
              } else if (n.type === 'financial') {
                Icon = BadgeDollarSign;
                color = '#f59e0b';
              } else if (n.type === 'delivery') {
                Icon = Truck;
                color = '#38bdf8';
              }

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
                      <strong className="notif-item-title">
                        {n.priority === 'critical' && <span style={{ color: '#ef4444', marginRight: 4 }}>●</span>}
                        {n.title}
                      </strong>
                      {!n.read && <span className="notif-item-dot" />}
                    </div>
                    <p className="notif-item-text">{n.message}</p>
                    <div className="notif-item-footer">
                      <span className="notif-item-time">
                        <Clock size={11} /> {n.time}
                      </span>
                      {n.type === 'validation' ? (
                        <span className="notif-item-link" style={{ color: '#0284c7', fontWeight: 700 }}>
                          Traiter la tâche <ArrowRight size={11} />
                        </span>
                      ) : (
                        <span className="notif-item-link">
                          Accéder <ArrowRight size={11} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {allowedNotifications.length > 0 && (
          <div className="notif-footer">
            <button className="notif-clear-btn" onClick={clearAll}>
              <Trash2 size={13} /> Effacer les notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
