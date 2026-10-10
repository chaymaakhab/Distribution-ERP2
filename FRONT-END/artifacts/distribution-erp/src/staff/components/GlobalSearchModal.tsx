import { useState, useEffect, useRef } from 'react';
import {
  Search, X, ArrowRight, CornerDownLeft, Sparkles, LayoutDashboard,
  ClipboardList, Users, Package, Boxes, Warehouse, ShoppingCart,
  PackageCheck, Truck, Undo2, BadgeDollarSign, HandCoins, UserCheck,
  ShieldCheck, Settings, ScrollText, Database, BarChart3, Building2,
  FileText, CheckCircle2,
} from 'lucide-react';
import { formatMoney } from '../api';

export interface SearchResultItem {
  id: string;
  category: 'Pages & Modules' | 'Commandes' | 'Clients' | 'Produits' | 'Documents' | 'Livreurs & Flotte';
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  badge?: string;
  badgeColor?: string;
  keywords?: string[];
}

export function getErpSearchItems(onNavigate: (segment: string) => void): SearchResultItem[] {
  return [
    // Modules
    { id: 'm-dash', category: 'Pages & Modules', title: 'Tableau de bord', subtitle: 'Accueil du poste de travail et KPIs métier', icon: LayoutDashboard, action: () => onNavigate('dashboard'), keywords: ['accueil', 'home', 'kpi', 'cockpit'] },
    { id: 'm-ord', category: 'Pages & Modules', title: 'Commandes de vente', subtitle: 'Prise de commande, validation et suivi statuts', icon: ClipboardList, action: () => onNavigate('orders'), keywords: ['commandes', 'cmd', 'vente', 'orders'] },
    { id: 'm-cli', category: 'Pages & Modules', title: 'Clients & CRM', subtitle: 'Portefeuille clients, plafonds de crédit et encours', icon: Users, action: () => onNavigate('customers'), keywords: ['clients', 'crm', 'client', 'encours', 'solde'] },
    { id: 'm-prd', category: 'Pages & Modules', title: 'Catalogue Produits', subtitle: 'Articles, conditionnements et tarifs par palier', icon: Package, action: () => onNavigate('products'), keywords: ['articles', 'produits', 'catalogue', 'prix'] },
    { id: 'm-inv', category: 'Pages & Modules', title: 'Gestion des Stocks', subtitle: 'Stock physique, réservé, disponible et inventaire', icon: Boxes, action: () => onNavigate('inventory'), keywords: ['stock', 'depot', 'inventaire', 'quantite'] },
    { id: 'm-wh', category: 'Pages & Modules', title: 'Dépôts & Plateformes', subtitle: 'Dépôts régionaux : Casablanca, Mohammedia, Berrechid', icon: Warehouse, action: () => onNavigate('warehouses'), keywords: ['depot', 'depots', 'plateforme', 'magasin'] },
    { id: 'm-sup', category: 'Pages & Modules', title: 'Fournisseurs', subtitle: 'Industriels agréés : Cosumar, Lesieur, Minoteries', icon: Building2, action: () => onNavigate('suppliers'), keywords: ['fournisseurs', 'achats', 'cosumar', 'lesieur'] },
    { id: 'm-pur', category: 'Pages & Modules', title: 'Achats & Approvisionnement', subtitle: 'Bons de commande fournisseurs et réceptions', icon: ShoppingCart, action: () => onNavigate('purchasing'), keywords: ['achats', 'approvisionnement', 'commande fournisseur'] },
    { id: 'm-prep', category: 'Pages & Modules', title: 'Préparation de commandes', subtitle: 'Picking, scanning caméra, colisage', icon: PackageCheck, action: () => onNavigate('preparation'), keywords: ['preparation', 'scan', 'camera', 'picking', 'colis'] },
    { id: 'm-del', category: 'Pages & Modules', title: 'Livraisons & Tournées', subtitle: 'Feuille de route mobile, signature POD et clôture caisse', icon: Truck, action: () => onNavigate('deliveries'), keywords: ['livraisons', 'tournees', 'livreur', 'route'] },
    { id: 'm-ret', category: 'Pages & Modules', title: 'Retours de marchandises', subtitle: 'Gestion des litiges, réintégration stock et avoirs', icon: Undo2, action: () => onNavigate('returns'), keywords: ['retours', 'litiges', 'avoirs', 'reclamation'] },
    { id: 'm-fin', category: 'Pages & Modules', title: 'Facturation légale Maroc', subtitle: 'Factures A4 avec ICE/IF/RC, TVA 20%, échéances', icon: BadgeDollarSign, action: () => onNavigate('finance'), keywords: ['factures', 'facturation', 'finance', 'ice', 'tva', 'comptabilite'] },
    { id: 'm-pay', category: 'Pages & Modules', title: 'Paiements & Trésorerie', subtitle: 'Règlements reçus, chèques, traites et relances', icon: HandCoins, action: () => onNavigate('payments'), keywords: ['paiements', 'cheques', 'traites', 'reglements', 'caisse'] },
    { id: 'm-rep', category: 'Pages & Modules', title: 'Rapports & Statistiques', subtitle: 'Chiffre d’affaires, top ventes et performances', icon: BarChart3, action: () => onNavigate('reports'), keywords: ['rapports', 'stats', 'statistiques', 'ca', 'bilan'] },
    { id: 'm-usr', category: 'Pages & Modules', title: 'Utilisateurs & Équipes', subtitle: 'Comptes collaborateurs, affectations dépôts', icon: UserCheck, action: () => onNavigate('users'), keywords: ['utilisateurs', 'users', 'equipe', 'comptes'] },
    { id: 'm-rol', category: 'Pages & Modules', title: 'Rôles & Permissions', subtitle: 'Droits d’accès par rôle et par utilisateur', icon: ShieldCheck, action: () => onNavigate('roles'), keywords: ['roles', 'permissions', 'rbac', 'droits'] },
    { id: 'm-set', category: 'Pages & Modules', title: 'Paramètres Système', subtitle: 'Identifiants fiscaux entreprise et règles de gestion', icon: Settings, action: () => onNavigate('settings'), keywords: ['parametres', 'settings', 'configuration'] },
    { id: 'm-aud', category: 'Pages & Modules', title: 'Journal d’Audit', subtitle: 'Traçabilité immuable des opérations sensibles', icon: ScrollText, action: () => onNavigate('audit'), keywords: ['audit', 'logs', 'historique'] },
    { id: 'm-mnt', category: 'Pages & Modules', title: 'Sauvegardes & Maintenance', subtitle: 'Sauvegarde des données et vérification entre dépôts', icon: Database, action: () => onNavigate('maintenance'), keywords: ['maintenance', 'base de donnees', 'backup'] },

    // Livreurs (Both Types)
    { id: 'drv-mehdi', category: 'Livreurs & Flotte', title: 'Mehdi Alami · Type 1 (Dépôt → Client)', subtitle: 'Renault Master 3.5T (23-A-54321) · Grand Casablanca & Ain Sebaâ', icon: Truck, badge: 'En tournée', badgeColor: '#38bdf8', action: () => onNavigate('deliveries'), keywords: ['livreur', 'livreure', 'chauffeur', 'mehdi', 'client', 'casablanca', 'camion'] },
    { id: 'drv-karim', category: 'Livreurs & Flotte', title: 'Karim Tazi · Type 2 (Navette Dépôt → Dépôt)', subtitle: 'Volvo FL 12T (12-B-99882) · Casablanca ↔ Berrechid ↔ Settat', icon: Building2, badge: 'En transit', badgeColor: '#c084fc', action: () => onNavigate('warehouses'), keywords: ['livreur', 'livreure', 'chauffeur', 'karim', 'navette', 'depot', 'settat', 'berrechid', 'ligne'] },
    { id: 'drv-hassan', category: 'Livreurs & Flotte', title: 'Hassan Belhaj · Type 1 (Dépôt → Client)', subtitle: 'Mercedes Sprinter (33-D-11223) · Rabat & Témara', icon: Truck, badge: 'Disponible', badgeColor: '#22c55e', action: () => onNavigate('deliveries'), keywords: ['livreur', 'livreure', 'chauffeur', 'hassan', 'rabat', 'camion'] },

    // Commandes
    { id: 'cmd-2403', category: 'Commandes', title: 'CMD-2403 · Comptoir Al Amal', subtitle: '32 100 DH · Livrée & Encaissée par chèque', icon: ClipboardList, badge: 'Livrée', badgeColor: '#22c55e', action: () => onNavigate('orders'), keywords: ['cmd-2403', 'amal', 'fes', 'commande'] },
    { id: 'cmd-2405', category: 'Commandes', title: 'CMD-2405 · BatiPro Maroc', subtitle: '18 420.50 DH · En route avec chauffeur Mehdi', icon: ClipboardList, badge: 'En cours', badgeColor: '#38bdf8', action: () => onNavigate('orders'), keywords: ['cmd-2405', 'batipro', 'rabat', 'commande'] },
    { id: 'cmd-2406', category: 'Commandes', title: 'CMD-2406 · Atlas Équipements', subtitle: '24 860 DH · Préparée au Dépôt DEP-01', icon: ClipboardList, badge: 'Préparée', badgeColor: '#f59e0b', action: () => onNavigate('orders'), keywords: ['cmd-2406', 'atlas', 'casablanca', 'commande'] },
    { id: 'cmd-1248', category: 'Commandes', title: 'CMD-2026-1248 · Épicerie Centrale', subtitle: '14 500 DH · Dépôt Mohammedia', icon: ClipboardList, badge: 'Validée', badgeColor: '#3b82f6', action: () => onNavigate('orders'), keywords: ['cmd-1248', 'epicerie', 'mohammedia', 'commande'] },

    // Clients
    { id: 'cli-atlas', category: 'Clients', title: 'Atlas Équipements SARL', subtitle: 'Casablanca · ICE: 003147829000064 · Plafond 80 000 DH', icon: Users, badge: 'Revendeur', action: () => onNavigate('customers'), keywords: ['atlas', 'casablanca', 'ice', 'client'] },
    { id: 'cli-batipro', category: 'Clients', title: 'BatiPro Maroc', subtitle: 'Rabat · ICE: 002984123000081 · Encours 10 420 DH', icon: Users, badge: 'Grossiste', action: () => onNavigate('customers'), keywords: ['batipro', 'rabat', 'client'] },
    { id: 'cli-amal', category: 'Clients', title: 'Comptoir Al Amal', subtitle: 'Fès · ICE: 004128901000092 · Traite en cours', icon: Users, badge: 'Revendeur', action: () => onNavigate('customers'), keywords: ['amal', 'fes', 'client'] },
    { id: 'cli-matar', category: 'Clients', title: 'Marché Al Matar', subtitle: 'Casablanca · CA cumulé : 218 400 DH', icon: Users, badge: 'Grossiste', action: () => onNavigate('customers'), keywords: ['matar', 'client'] },

    // Produits
    { id: 'prd-oil', category: 'Produits', title: 'Huile Végétale 5L', subtitle: 'SKU: HUI-5L · 220 DH · Stock: 48 bidons (Critique)', icon: Package, badge: 'Stock faible', badgeColor: '#ef4444', action: () => onNavigate('products'), keywords: ['huile', '5l', 'produit', 'article'] },
    { id: 'prd-sug', category: 'Produits', title: 'Sucre Raffiné 50kg', subtitle: 'SKU: SUC-50K · 350 DH · Stock: 450 sacs', icon: Package, badge: 'En stock', badgeColor: '#22c55e', action: () => onNavigate('products'), keywords: ['sucre', '50kg', 'produit', 'article'] },
    { id: 'prd-far', category: 'Produits', title: 'Farine T55 50kg', subtitle: 'SKU: FAR-50K · 280 DH · Stock: 230 sacs', icon: Package, badge: 'En stock', badgeColor: '#22c55e', action: () => onNavigate('products'), keywords: ['farine', 'produit', 'article'] },
    { id: 'prd-sel', category: 'Produits', title: 'Sel Industriel 25kg', subtitle: 'SKU: SEL-25K · 120 DH · Stock: 580 sacs', icon: Package, badge: 'En stock', badgeColor: '#22c55e', action: () => onNavigate('products'), keywords: ['sel', 'produit', 'article'] },

    // Documents
    { id: 'doc-fac184', category: 'Documents', title: 'Facture FAC-2025-184', subtitle: '24 860 DH · Atlas Équipements · Échéance 26 Mars', icon: FileText, badge: 'Facture', badgeColor: '#0284c7', action: () => onNavigate('finance'), keywords: ['facture', 'fac-2025-184', 'document'] },
    { id: 'doc-fac183', category: 'Documents', title: 'Facture FAC-2025-183', subtitle: '18 420.50 DH · BatiPro Maroc · Échéance 24 Mars', icon: FileText, badge: 'Facture', badgeColor: '#0284c7', action: () => onNavigate('finance'), keywords: ['facture', 'fac-2025-183', 'document'] },
    { id: 'doc-bl2403', category: 'Documents', title: 'Bon de Livraison BL-2026-2403', subtitle: 'Signé électroniquement (POD) par Mohamed Fassi', icon: Truck, badge: 'BL signé', badgeColor: '#22c55e', action: () => onNavigate('deliveries'), keywords: ['bl', 'livraison', 'bon'] },
    { id: 'doc-chq849', category: 'Documents', title: 'Chèque CHQ-849301', subtitle: '32 100 DH · Attijariwafa Bank · Remis en banque', icon: HandCoins, badge: 'Remis', badgeColor: '#38bdf8', action: () => onNavigate('finance'), keywords: ['cheque', 'effet', 'traite'] },
  ];
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (segment: string) => void;
  initialQuery?: string;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigate,
  initialQuery = '',
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery(initialQuery);
      setSelectedIndex(0);
    }
  }, [isOpen, initialQuery]);

  const allItems = getErpSearchItems(onNavigate);
  const q = query.trim().toLowerCase();
  const results = q
    ? allItems.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.keywords && i.keywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase())))
      )
    : allItems.slice(0, 12);

  // Group results by category
  const categories = Array.from(new Set(results.map((r) => r.category)));

  function handleSelect(item: SearchResultItem) {
    item.action();
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="search-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="search-modal-bar">
          <Search size={18} className="search-modal-bar-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Rechercher module, commande, client, article, document… (Ctrl + K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button
              className="search-modal-clear"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Effacer la recherche"
            >
              <X size={15} />
            </button>
          )}
          <span className="search-modal-esc">Échap</span>
        </div>

        {/* Results List */}
        <div className="search-modal-results">
          {results.length === 0 ? (
            <div className="search-modal-empty">
              <Search size={26} style={{ color: 'var(--muted)', opacity: 0.6 }} />
              <p>Aucun résultat trouvé pour « {query} »</p>
              <small>Essayez avec un numéro de commande, nom de client ou mot-clé comme "stock", "facture", "livreur".</small>
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = results.filter((r) => r.category === cat);
              return (
                <div key={cat} className="search-modal-group">
                  <div className="search-modal-group-title">{cat}</div>
                  {catItems.map((item) => {
                    const globalIdx = results.indexOf(item);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className={`search-modal-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <div className="search-modal-item-icon">
                          <Icon size={16} />
                        </div>
                        <div className="search-modal-item-body">
                          <div className="search-modal-item-title">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span
                                className="search-modal-item-badge"
                                style={item.badgeColor ? { color: item.badgeColor, borderColor: item.badgeColor + '55', background: item.badgeColor + '15' } : undefined}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="search-modal-item-subtitle">{item.subtitle}</div>
                        </div>
                        <div className="search-modal-item-arrow">
                          <CornerDownLeft size={13} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="search-modal-footer">
          <div className="search-modal-footer-keys">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Naviguer</span>
            <span><kbd>↵</kbd> Ouvrir</span>
            <span><kbd>Esc</kbd> Fermer</span>
          </div>
          <div className="search-modal-footer-meta">
            <Sparkles size={12} style={{ color: '#38bdf8' }} />
            <span>Recherche globale instantanée ERP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
