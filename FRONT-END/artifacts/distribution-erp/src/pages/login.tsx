import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck, Lock, Mail, Globe, ArrowRight, Building, Truck, ShoppingCart, BarChart3, Users, Warehouse } from 'lucide-react';

interface RolePortal {
  slug: string;
  title: string;
  titleAr: string;
  subtitle: string;
  icon: any;
  color: string;
  accentBg: string;
  defaultEmail: string;
}

const portals: Record<string, RolePortal> = {
  admin: {
    slug: 'admin',
    title: 'Portail Administration',
    titleAr: 'بوابة الإدارة العليا',
    subtitle: 'Super Admin & Direction Générale',
    icon: ShieldCheck,
    color: '#2563eb',
    accentBg: '#eff6ff',
    defaultEmail: 'admin@gestionerp.ma',
  },
  commercial: {
    slug: 'commercial',
    title: 'Portail Commercial',
    titleAr: 'بوابة التجارة والمبيعات',
    subtitle: 'Commerciaux, Ventes & Prospection',
    icon: Users,
    color: '#0891b2',
    accentBg: '#ecfeff',
    defaultEmail: 'commercial@gestionerp.ma',
  },
  livreur: {
    slug: 'livreur',
    title: 'Portail Livreur & Chauffeur',
    titleAr: 'بوابة السائق والموزع',
    subtitle: 'Suivi des Tournées & Encaissements',
    icon: Truck,
    color: '#16a34a',
    accentBg: '#f0fdf4',
    defaultEmail: 'livreur@gestionerp.ma',
  },
  preparateur: {
    slug: 'preparateur',
    title: 'Portail Préparateur de Commande',
    titleAr: 'بوابة تحضير الطلبيات',
    subtitle: 'Scan, Picking & Colisage Entrepôt',
    icon: ShoppingCart,
    color: '#d97706',
    accentBg: '#fffbeb',
    defaultEmail: 'preparateur@gestionerp.ma',
  },
  'responsable-depot': {
    slug: 'responsable-depot',
    title: 'Portail Responsable Dépôt',
    titleAr: 'بوابة مسؤول المستودع',
    subtitle: 'Gestion des Stocks & Mouvements',
    icon: Warehouse,
    color: '#7c3aed',
    accentBg: '#f5f3ff',
    defaultEmail: 'depot@gestionerp.ma',
  },
  comptable: {
    slug: 'comptable',
    title: 'Portail Comptabilité & Finance',
    titleAr: 'بوابة المحاسبة والمالية',
    subtitle: 'Facturation, Règlements & Rapprochements',
    icon: BarChart3,
    color: '#dc2626',
    accentBg: '#fef2f2',
    defaultEmail: 'comptable@gestionerp.ma',
  },
  client: {
    slug: 'client',
    title: 'Espace Client B2B',
    titleAr: 'فضاء الزبناء B2B',
    subtitle: 'Catalogue, Passage de Commandes & Suivi',
    icon: Building,
    color: '#4f46e5',
    accentBg: '#eef2ff',
    defaultEmail: 'client@gestionerp.ma',
  },
  general: {
    slug: '',
    title: 'Espace Connexion Central ERP',
    titleAr: 'البوابة المركزية لتسجيل الدخول',
    subtitle: 'ERP Distribution Maroc',
    icon: Lock,
    color: '#0f172a',
    accentBg: '#f8fafc',
    defaultEmail: 'user@gestionerp.ma',
  }
};

export function LoginPage({ roleKey }: { roleKey?: string }) {
  const [, setLocation] = useLocation();
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const portal = portals[roleKey || 'general'] || portals.general;
  const PortalIcon = portal.icon;

  const [email, setEmail] = useState(portal.defaultEmail);
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation('/');
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${lang === 'ar' ? 'dir-rtl font-arabic' : ''}`}>
      {/* Top Language Switcher & Quick Navigation */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <button
          onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <Globe size={14} />
          <span>{lang === 'fr' ? 'العربية (RTL)' : 'Français'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-sm mb-4" style={{ backgroundColor: portal.accentBg, color: portal.color }}>
            <PortalIcon size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'fr' ? portal.title : portal.titleAr}
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {portal.subtitle}
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'fr' ? 'Adresse Email Pro' : 'البريد الإلكتروني المهني'}
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'fr' ? 'Mot de passe' : 'كلمة السر'}
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 font-medium">
                  {lang === 'fr' ? 'Se souvenir de moi' : 'تذكرني'}
                </label>
              </div>

              <div className="text-xs">
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                  {lang === 'fr' ? 'Oublié ?' : 'نسيت الكلمة؟'}
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: portal.color }}
            >
              <span>{lang === 'fr' ? 'Se Connecter' : 'تسجيل الدخول'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Other Portal Links */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3 text-center">
              {lang === 'fr' ? 'Accès Directs Autres Portails' : 'بوابات أدوار أخرى'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => setLocation('/login/admin')} className="text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-600 font-medium text-[11px]">
                • Admin
              </button>
              <button onClick={() => setLocation('/login/commercial')} className="text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-600 font-medium text-[11px]">
                • Commercial
              </button>
              <button onClick={() => setLocation('/login/livreur')} className="text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-600 font-medium text-[11px]">
                • Livreur
              </button>
              <button onClick={() => setLocation('/login/preparateur')} className="text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-600 font-medium text-[11px]">
                • Préparateur
              </button>
              <button onClick={() => setLocation('/login/responsable-depot')} className="text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-600 font-medium text-[11px]">
                • Responsable Dépôt
              </button>
              <button onClick={() => setLocation('/login/comptable')} className="text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-600 font-medium text-[11px]">
                • Comptable
              </button>
              <button onClick={() => setLocation('/login/client')} className="text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-600 font-medium text-[11px]">
                • Client B2B
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          GestionERP Distribution SARL — Solution SaaS Maroc
        </div>
      </div>
    </div>
  );
}
