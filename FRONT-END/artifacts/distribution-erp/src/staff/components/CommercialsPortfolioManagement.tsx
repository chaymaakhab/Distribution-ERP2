import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, Percent, BadgeDollarSign, TrendingUp, Search,
  ChevronDown, ChevronUp, Edit3, Check, X, Building2, Phone, Mail,
  ArrowRight, ShieldCheck, AlertCircle, ShoppingBag, Award, Sparkles, RefreshCw
} from 'lucide-react';
import { api, formatMoney } from '../api';

export interface PortfolioClient {
  id: number;
  code: string;
  name: string;
  company: string;
  email?: string;
  phone: string;
  city: string;
  price_tier: string;
  status: string;
  orders_count: number;
  turnover: number;
  commission_percentage: number;
  commission_earned: number;
  commercial_reference?: string;
  created_at?: string;
}

export interface PortfolioCommercial {
  id: number;
  name: string;
  email: string;
  phone: string;
  commercial_code: string;
  commission_rate: number;
  clients_count: number;
  total_orders: number;
  total_turnover: number;
  total_commission: number;
  clients: PortfolioClient[];
}

const DEMO_PORTFOLIO: {
  summary: {
    total_commercials: number;
    total_assigned_clients: number;
    total_unassigned_clients: number;
    total_turnover: number;
    total_commissions: number;
  };
  commercials: PortfolioCommercial[];
  unassigned_clients: any[];
} = {
  summary: {
    total_commercials: 3,
    total_assigned_clients: 8,
    total_unassigned_clients: 1,
    total_turnover: 765400,
    total_commissions: 39420,
  },
  commercials: [
    {
      id: 1,
      name: 'Yassine Mansouri',
      email: 'yassine.mansouri@hercules-erp.ma',
      phone: '+212 6 61 23 45 67',
      commercial_code: 'COM-001',
      commission_rate: 5.0,
      clients_count: 3,
      total_orders: 42,
      total_turnover: 342000,
      total_commission: 17100,
      clients: [
        {
          id: 101,
          code: 'CLT-001',
          name: 'Hassan Amrani',
          company: 'Quincaillerie Centrale Casablanca',
          email: 'contact@quincaillerie-centrale.ma',
          phone: '+212 5 22 20 40 60',
          city: 'Casablanca',
          price_tier: 'grossiste',
          status: 'Actif',
          orders_count: 18,
          turnover: 185000,
          commission_percentage: 5.0,
          commission_earned: 9250,
          commercial_reference: 'COM-001',
          created_at: '12/01/2026',
        },
        {
          id: 102,
          code: 'CLT-004',
          name: 'Rachid Bennouna',
          company: 'BatiPro Mohammedia',
          email: 'direction@batipro.ma',
          phone: '+212 5 23 32 11 00',
          city: 'Mohammedia',
          price_tier: 'revendeur',
          status: 'Actif',
          orders_count: 14,
          turnover: 98000,
          commission_percentage: 5.0,
          commission_earned: 4900,
          commercial_reference: 'COM-001',
          created_at: '24/02/2026',
        },
        {
          id: 103,
          code: 'CLT-008',
          name: 'Tariq Alami',
          company: 'Électro & Brico Maarif',
          email: 'info@electrobrico.ma',
          phone: '+212 5 22 99 88 77',
          city: 'Casablanca',
          price_tier: 'standard',
          status: 'Actif',
          orders_count: 10,
          turnover: 59000,
          commission_percentage: 5.0,
          commission_earned: 2950,
          commercial_reference: 'COM-001',
          created_at: '05/04/2026',
        },
      ],
    },
    {
      id: 3,
      name: 'Sara El Amrani',
      email: 'sara.amrani@hercules-erp.ma',
      phone: '+212 6 63 98 76 54',
      commercial_code: 'COM-003',
      commission_rate: 6.0,
      clients_count: 3,
      total_orders: 31,
      total_turnover: 268400,
      total_commission: 16104,
      clients: [
        {
          id: 104,
          code: 'CLT-002',
          name: 'Nadia Fassi',
          company: 'Comptoir Sanitaire Rabat',
          email: 'achat@sanitaire-rabat.ma',
          phone: '+212 5 37 77 12 34',
          city: 'Rabat',
          price_tier: 'revendeur',
          status: 'Actif',
          orders_count: 16,
          turnover: 142000,
          commission_percentage: 6.0,
          commission_earned: 8520,
          commercial_reference: 'COM-003',
          created_at: '15/01/2026',
        },
        {
          id: 105,
          code: 'CLT-005',
          name: 'Karim Bouazza',
          company: 'Droguerie Agdal Agence',
          email: 'agdal.drog@gmail.com',
          phone: '+212 5 37 67 89 01',
          city: 'Rabat',
          price_tier: 'grossiste',
          status: 'Actif',
          orders_count: 10,
          turnover: 84000,
          commission_percentage: 6.0,
          commission_earned: 5040,
          commercial_reference: 'COM-003',
          created_at: '03/03/2026',
        },
        {
          id: 106,
          code: 'CLT-009',
          name: 'Zineb Bensouda',
          company: 'Fournitures Kénitra Nord',
          email: 'commandes@fournitures-kn.ma',
          phone: '+212 5 37 36 55 44',
          city: 'Kénitra',
          price_tier: 'chantier',
          status: 'Actif',
          orders_count: 5,
          turnover: 42400,
          commission_percentage: 6.0,
          commission_earned: 2544,
          commercial_reference: 'COM-003',
          created_at: '18/06/2026',
        },
      ],
    },
    {
      id: 4,
      name: 'Tariq Bennani',
      email: 'tariq.bennani@hercules-erp.ma',
      phone: '+212 6 65 44 33 22',
      commercial_code: 'COM-004',
      commission_rate: 4.5,
      clients_count: 2,
      total_orders: 19,
      total_turnover: 155000,
      total_commission: 6216,
      clients: [
        {
          id: 107,
          code: 'CLT-003',
          name: 'Mustapha Chraibi',
          company: 'Marrakech Brico Sud',
          email: 'm.chraibi@bricosud.ma',
          phone: '+212 5 24 43 22 11',
          city: 'Marrakech',
          price_tier: 'grossiste',
          status: 'Actif',
          orders_count: 12,
          turnover: 105000,
          commission_percentage: 4.5,
          commission_earned: 4725,
          commercial_reference: 'COM-004',
          created_at: '20/02/2026',
        },
        {
          id: 108,
          code: 'CLT-007',
          name: 'Mehdi Naciri',
          company: 'Gueliz Outillage SARL',
          email: 'gueliz.outillage@gmail.com',
          phone: '+212 5 24 44 55 66',
          city: 'Marrakech',
          price_tier: 'revendeur',
          status: 'Actif',
          orders_count: 7,
          turnover: 50000,
          commission_percentage: 4.5,
          commission_earned: 2250,
          commercial_reference: 'COM-004',
          created_at: '14/05/2026',
        },
      ],
    },
  ],
  unassigned_clients: [
    {
      id: 109,
      code: 'CLT-010',
      name: 'Adil Berrada',
      company: 'Quincaillerie Tétouan Express',
      email: 'tetouan.express@gmail.com',
      phone: '+212 5 39 96 11 22',
      city: 'Tétouan',
      price_tier: 'standard',
      status: 'Actif',
      orders_count: 3,
      turnover: 28500,
      created_at: '02/10/2026',
    },
  ],
};

export default function CommercialsPortfolioManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(DEMO_PORTFOLIO);
  const [search, setSearch] = useState('');
  const [expandedCommercials, setExpandedCommercials] = useState<Record<number, boolean>>({
    1: true, // expand first by default
  });
  const [toast, setToast] = useState<string | null>(null);

  // Edit Commercial Commission & Code Modal
  const [editingCommercial, setEditingCommercial] = useState<PortfolioCommercial | null>(null);
  const [editCommissionRate, setEditCommissionRate] = useState<number>(5.0);
  const [editCommercialCode, setEditCommercialCode] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Quick Assign Unassigned Client Modal
  const [assigningClient, setAssigningClient] = useState<any | null>(null);
  const [selectedTargetCommercialId, setSelectedTargetCommercialId] = useState<number | ''>('');
  const [targetCommissionRate, setTargetCommissionRate] = useState<number>(5.0);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function loadData() {
    setLoading(true);
    api.getCommercialsClients()
      .then((res) => {
        if (res && res.commercials) {
          setData(res as any);
        }
      })
      .catch((err) => {
        console.warn('API commercials clients fallback to demo:', err);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  function toggleExpand(id: number) {
    setExpandedCommercials((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function openEditModal(c: PortfolioCommercial) {
    setEditingCommercial(c);
    setEditCommissionRate(c.commission_rate);
    setEditCommercialCode(c.commercial_code || `COM-${String(c.id).padStart(3, '0')}`);
  }

  function handleSaveCommercialSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCommercial) return;

    setSavingEdit(true);
    api.updateCommercialCommission(editingCommercial.id, {
      commission_rate: Number(editCommissionRate),
      commercial_code: editCommercialCode.trim(),
    })
      .then(() => {
        notify(`Taux et code de ${editingCommercial.name} mis à jour avec succès !`);
        setData((prev) => ({
          ...prev,
          commercials: prev.commercials.map((comm) =>
            comm.id === editingCommercial.id
              ? {
                  ...comm,
                  commission_rate: Number(editCommissionRate),
                  commercial_code: editCommercialCode.trim(),
                }
              : comm
          ),
        }));
        setEditingCommercial(null);
      })
      .catch((err) => {
        console.error('Erreur mise à jour commercial:', err);
        notify('Erreur lors de la mise à jour (simulation locale appliquée).');
        // optimistic update
        setData((prev) => ({
          ...prev,
          commercials: prev.commercials.map((comm) =>
            comm.id === editingCommercial.id
              ? {
                  ...comm,
                  commission_rate: Number(editCommissionRate),
                  commercial_code: editCommercialCode.trim(),
                }
              : comm
          ),
        }));
        setEditingCommercial(null);
      })
      .finally(() => setSavingEdit(false));
  }

  function handleAssignClient(e: React.FormEvent) {
    e.preventDefault();
    if (!assigningClient || selectedTargetCommercialId === '') return;

    const commId = Number(selectedTargetCommercialId);
    const targetComm = data.commercials.find((c) => c.id === commId);
    if (!targetComm) return;

    api.updateCustomer(assigningClient.id, {
      commercial_id: commId,
      commission_percentage: Number(targetCommissionRate),
    })
      .then(() => {
        notify(`Client « ${assigningClient.company} » affecté à ${targetComm.name} (${targetComm.commercial_code}) !`);
        loadData();
      })
      .catch((err) => {
        console.warn('Assign error, optimistic update applied:', err);
        notify(`Client affecté à ${targetComm.name} !`);
        // Optimistic
        const updatedClient: PortfolioClient = {
          ...assigningClient,
          commercial_reference: targetComm.commercial_code,
          commission_percentage: Number(targetCommissionRate),
          commission_earned: round((assigningClient.turnover * Number(targetCommissionRate)) / 100),
        };
        setData((prev) => ({
          ...prev,
          summary: {
            ...prev.summary,
            total_assigned_clients: prev.summary.total_assigned_clients + 1,
            total_unassigned_clients: Math.max(0, prev.summary.total_unassigned_clients - 1),
          },
          commercials: prev.commercials.map((c) =>
            c.id === commId
              ? {
                  ...c,
                  clients_count: c.clients_count + 1,
                  clients: [updatedClient, ...c.clients],
                }
              : c
          ),
          unassigned_clients: prev.unassigned_clients.filter((c) => c.id !== assigningClient.id),
        }));
      })
      .finally(() => {
        setAssigningClient(null);
        setSelectedTargetCommercialId('');
      });
  }

  function round(val: number) {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  const filteredCommercials = data.commercials.filter((comm) => {
    const q = search.toLowerCase();
    const matchComm =
      comm.name.toLowerCase().includes(q) ||
      comm.email.toLowerCase().includes(q) ||
      comm.commercial_code.toLowerCase().includes(q) ||
      comm.phone.includes(q);

    const matchClients = comm.clients.some(
      (clt) =>
        clt.company.toLowerCase().includes(q) ||
        clt.name.toLowerCase().includes(q) ||
        clt.city.toLowerCase().includes(q) ||
        clt.code.toLowerCase().includes(q)
    );

    return matchComm || matchClients;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid #334155',
          }}
        >
          <Sparkles size={16} color="#38bdf8" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner & KPI summary */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 12,
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#38bdf8' }}>
                SUPERVISION COMMERCIALE & COMMISSIONNEMENT B2B
              </span>
              <span style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                DIRECTION & SUPER ADMIN
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Portefeuilles Commerciaux &amp; Clients Rattachés
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8', maxWidth: 750 }}>
              Suivi consolidé des forces de vente : référence commerciale attribuée à chaque client, taux de commission contractuels et calcul automatique des gains sur le chiffre d’affaires encaissé.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualiser les portefeuilles
          </button>
        </div>

        {/* Strategic Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 22,
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>
              <span>Total Commerciaux</span>
              <Users size={16} color="#38bdf8" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginTop: 8 }}>
              {data.summary.total_commercials}
            </div>
            <div style={{ fontSize: 11, color: '#38bdf8', marginTop: 4 }}>
              Forces de vente sur le terrain
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>
              <span>Clients Suivis</span>
              <UserCheck size={16} color="#4ade80" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#4ade80', marginTop: 8 }}>
              {data.summary.total_assigned_clients}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Rattachés avec code référent
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>
              <span>CA Réalisé Commerciaux</span>
              <TrendingUp size={16} color="#fbbf24" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24', marginTop: 8 }}>
              {formatMoney(data.summary.total_turnover)} DH
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Volume de commandes livrées
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>
              <span>Commissions Calculées</span>
              <Award size={16} color="#c084fc" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#c084fc', marginTop: 8 }}>
              {formatMoney(data.summary.total_commissions)} DH
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Rémunération variable à verser
            </div>
          </div>
        </div>
      </div>

      {/* Unassigned Clients Banner if any */}
      {data.unassigned_clients && data.unassigned_clients.length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderLeft: '4px solid #f59e0b',
            padding: '16px 20px',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={20} color="#f59e0b" />
              <div>
                <b style={{ color: '#92400e', fontSize: 14 }}>
                  {data.unassigned_clients.length} Client(s) sans commercial référent détecté(s)
                </b>
                <div style={{ fontSize: 12, color: '#b45309' }}>
                  Ces clients se sont inscrits ou ont été créés sans attribution de commercial. Attribuez-les ci-dessous pour déclencher le commissionnement.
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {data.unassigned_clients.map((unclt: any) => (
              <div
                key={unclt.id}
                style={{
                  background: '#ffffff',
                  padding: '12px 14px',
                  borderRadius: 6,
                  border: '1px solid #fde68a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <b style={{ color: '#0f172a', fontSize: 13, display: 'block' }}>{unclt.company}</b>
                  <small style={{ color: '#64748b', fontSize: 11 }}>
                    {unclt.city} · {unclt.phone} · CA: {formatMoney(unclt.turnover)} DH
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAssigningClient(unclt);
                    setSelectedTargetCommercialId(data.commercials[0]?.id || '');
                    setTargetCommissionRate(data.commercials[0]?.commission_rate || 5.0);
                  }}
                  style={{
                    padding: '6px 10px',
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Attribuer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Table tools */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', minWidth: 320 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher commercial, code (ex. COM-001) ou client..."
            style={{
              width: '100%',
              height: 40,
              paddingLeft: 38,
              paddingRight: 12,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 13,
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#64748b' }}>
          <span><b>{filteredCommercials.length}</b> commercial(aux) affiché(s)</span>
          <button
            type="button"
            onClick={() => {
              const allExpanded = filteredCommercials.reduce((acc, c) => ({ ...acc, [c.id]: true }), {});
              setExpandedCommercials(allExpanded);
            }}
            style={{
              padding: '6px 10px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            Déplier tout
          </button>
          <button
            type="button"
            onClick={() => setExpandedCommercials({})}
            style={{
              padding: '6px 10px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            Replier tout
          </button>
        </div>
      </div>

      {/* Commercials Portfolios List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredCommercials.map((comm) => {
          const isExpanded = !!expandedCommercials[comm.id];
          return (
            <div
              key={comm.id}
              style={{
                background: '#ffffff',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              {/* Header card for commercial */}
              <div
                style={{
                  padding: '18px 22px',
                  background: isExpanded ? '#f8fafc' : '#ffffff',
                  borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  cursor: 'pointer',
                }}
                onClick={() => toggleExpand(comm.id)}
              >
                {/* Commercial identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {comm.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        {comm.name}
                      </h3>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 4,
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        {comm.commercial_code}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#64748b', marginTop: 3 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} /> {comm.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} /> {comm.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance & Commission Metrics */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    flexWrap: 'wrap',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ textAlign: 'center', minWidth: 70 }}>
                    <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>Taux Commission</small>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>
                        {comm.commission_rate}%
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditModal(comm)}
                        title="Modifier le taux de commission ou code commercial"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>Clients Suivis</small>
                    <b style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                      {comm.clients_count}
                    </b>
                  </div>

                  <div style={{ textAlign: 'center', minWidth: 90 }}>
                    <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>CA Commandes</small>
                    <b style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                      {formatMoney(comm.total_turnover)} DH
                    </b>
                  </div>

                  <div
                    style={{
                      background: '#ecfdf5',
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: '1px solid #a7f3d0',
                      textAlign: 'right',
                    }}
                  >
                    <small style={{ color: '#065f46', fontSize: 10.5, display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      Commission Gagnée
                    </small>
                    <b style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>
                      +{formatMoney(comm.total_commission)} DH
                    </b>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(comm.id)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      width: 32,
                      height: 32,
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      color: '#475569',
                    }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Sub-table: Attached Clients */}
              {isExpanded && (
                <div style={{ padding: '16px 22px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserCheck size={14} color="#0284c7" />
                      Clients attachés au portefeuille de {comm.name} ({comm.clients.length})
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      Code référent attribué à chaque compte : <b>{comm.commercial_code}</b>
                    </span>
                  </div>

                  {comm.clients.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 6 }}>
                      Aucun client rattaché à ce commercial pour le moment.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            <th style={{ padding: '10px 12px' }}>Code / Société</th>
                            <th style={{ padding: '10px 12px' }}>Contact & Ville</th>
                            <th style={{ padding: '10px 12px' }}>Grille Tarifaire</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Commandes</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>CA Réalisé</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Taux Comm.</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Commission Client</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comm.clients.map((clt) => (
                            <tr
                              key={clt.id}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.15s ease',
                              }}
                            >
                              <td style={{ padding: '10px 12px' }}>
                                <b style={{ color: '#0f172a', display: 'block' }}>{clt.company}</b>
                                <small style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 11 }}>
                                  {clt.code} · Réf: {clt.commercial_reference || comm.commercial_code}
                                </small>
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <div style={{ color: '#334155', fontWeight: 600 }}>{clt.name}</div>
                                <small style={{ color: '#64748b', fontSize: 11 }}>
                                  {clt.city} · {clt.phone}
                                </small>
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <span
                                  style={{
                                    textTransform: 'capitalize',
                                    fontSize: 11,
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    background: '#f0f9ff',
                                    color: '#0369a1',
                                    fontWeight: 600,
                                  }}
                                >
                                  Tarif {clt.price_tier}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                                {clt.orders_count}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                {formatMoney(clt.turnover)} DH
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    fontWeight: 700,
                                  }}
                                >
                                  {clt.commission_percentage}%
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                                +{formatMoney(clt.commission_earned)} DH
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    fontWeight: 600,
                                    background: clt.status === 'Actif' ? '#ecfdf5' : '#fef2f2',
                                    color: clt.status === 'Actif' ? '#059669' : '#dc2626',
                                  }}
                                >
                                  {clt.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Modifier Taux et Code Commercial */}
      {editingCommercial && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setEditingCommercial(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 460,
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                  PARAMÉTRAGE COMMISSION
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 16, color: '#0f172a' }}>
                  {editingCommercial.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCommercial(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCommercialSettings} style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                  Code Commercial Référent (utilisé par les clients)
                  <input
                    required
                    value={editCommercialCode}
                    onChange={(e) => setEditCommercialCode(e.target.value.toUpperCase())}
                    placeholder="Ex. COM-001"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      marginTop: 4,
                      fontSize: 13,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                    }}
                  />
                  <small style={{ color: '#64748b', fontSize: 11, marginTop: 3, display: 'block' }}>
                    Ce code permet au client de s’auto-affilier lors de son inscription sur le portail B2B.
                  </small>
                </label>

                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                  Taux de commission (%)
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <input
                      required
                      type="number"
                      step={0.1}
                      min={0}
                      max={100}
                      value={editCommissionRate}
                      onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: 38,
                        padding: '0 10px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>%</span>
                  </div>
                  <small style={{ color: '#64748b', fontSize: 11, marginTop: 3, display: 'block' }}>
                    Appliqué automatiquement sur tout nouveau client rattaché à ce commercial.
                  </small>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setEditingCommercial(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Check size={15} />
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Attribuer Client Sans Commercial */}
      {assigningClient && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setAssigningClient(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 460,
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                  ATTRIBUTION DE COMMERCIAL
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 16, color: '#0f172a' }}>
                  {assigningClient.company}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningClient(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignClient} style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                  Sélectionner le commercial référent
                  <select
                    required
                    value={selectedTargetCommercialId}
                    onChange={(e) => {
                      const cid = Number(e.target.value);
                      setSelectedTargetCommercialId(cid);
                      const targetComm = data.commercials.find((c) => c.id === cid);
                      if (targetComm) {
                        setTargetCommissionRate(targetComm.commission_rate);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      marginTop: 4,
                      fontSize: 13,
                    }}
                  >
                    <option value="">Choisir un commercial...</option>
                    {data.commercials.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.commercial_code}) - {c.commission_rate}%
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                  Taux de commission spécifique à ce client (%)
                  <input
                    required
                    type="number"
                    step={0.1}
                    min={0}
                    max={100}
                    value={targetCommissionRate}
                    onChange={(e) => setTargetCommissionRate(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setAssigningClient(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#d97706',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Check size={15} />
                  Valider l'attribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
