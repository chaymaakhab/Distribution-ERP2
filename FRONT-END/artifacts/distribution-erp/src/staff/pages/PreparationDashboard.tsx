import { useState } from 'react';
import {
  PackageCheck, Scan, CheckCircle2, AlertTriangle, Barcode,
  ArrowRight, Check, X, ShieldAlert, Truck,
} from 'lucide-react';

interface PrepItem {
  id: number;
  barcode: string;
  name: string;
  location: string;
  order_ref: string;
  client: string;
  requested_qty: number;
  prepared_qty: number;
  status: 'pending' | 'ok' | 'short';
}

const INITIAL_PREP_ITEMS: PrepItem[] = [
  {
    id: 1,
    barcode: '6111234567890',
    name: 'Perceuse à percussion 850W',
    location: 'Allée A · Rayon 03 · Niv 2',
    order_ref: 'CMD-2405',
    client: 'BatiPro Maroc',
    requested_qty: 4,
    prepared_qty: 4,
    status: 'ok',
  },
  {
    id: 2,
    barcode: '6119876543210',
    name: 'Câble électrique 3G2.5 (Couronne 100m)',
    location: 'Allée B · Rayon 01 · Niv 1',
    order_ref: 'CMD-2405',
    client: 'BatiPro Maroc',
    requested_qty: 2,
    prepared_qty: 2,
    status: 'ok',
  },
  {
    id: 3,
    barcode: '6115556667778',
    name: 'Disque diamant 230 mm (Lot 5)',
    location: 'Allée C · Rayon 02 · Niv 3',
    order_ref: 'CMD-2406',
    client: 'Atlas Équipements',
    requested_qty: 6,
    prepared_qty: 4,
    status: 'short', // 2 missing!
  },
  {
    id: 4,
    barcode: '6113334445556',
    name: 'Pompe immergée 1.5 HP',
    location: 'Allée D · Rayon 04 · Niv 1',
    order_ref: 'CMD-2406',
    client: 'Atlas Équipements',
    requested_qty: 1,
    prepared_qty: 0,
    status: 'pending',
  },
];

export default function PreparationDashboard() {
  const [items, setItems] = useState<PrepItem[]>(INITIAL_PREP_ITEMS);
  const [scannedCode, setScannedCode] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'grouped' | 'by_order'>('grouped');
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleScan(codeToTest?: string) {
    const code = (codeToTest || scannedCode).trim();
    if (!code) return;

    const match = items.find((it) => it.barcode === code || it.barcode.endsWith(code));
    if (match) {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === match.id) {
            const nextQty = Math.min(it.requested_qty, it.prepared_qty + 1);
            return {
              ...it,
              prepared_qty: nextQty,
              status: nextQty === it.requested_qty ? 'ok' : 'pending',
            };
          }
          return it;
        }),
      );
      setScanMessage({ text: `Article scanné : ${match.name} (+1 unité)`, ok: true });
      setScannedCode('');
    } else {
      setScanMessage({ text: `Code-barres inconnu (${code}) pour cette tournée !`, ok: false });
    }

    setTimeout(() => setScanMessage(null), 3500);
  }

  function setDirectQty(id: number, qty: number) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const status = qty === it.requested_qty ? 'ok' : qty < it.requested_qty ? 'short' : 'ok';
          return { ...it, prepared_qty: qty, status };
        }
        return it;
      }),
    );
  }

  const allComplete = items.every((it) => it.prepared_qty > 0);
  const totalRequested = items.reduce((a, b) => a + b.requested_qty, 0);
  const totalPrepared = items.reduce((a, b) => a + b.prepared_qty, 0);

  return (
    <div className="dashboard-page prep-workspace">
      {/* Header */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">ESPACE PRÉPARATION <span className="eyebrow-sep">/</span> ENTREPÔT & SCANNING</span>
          <h1>Bon de Préparation Groupé<span className="title-period">.</span></h1>
          <p>Tournée Centre (Casablanca Sud) · 2 commandes à préparer avant chargement véhicule.</p>
        </div>
        <button
          className="button-primary"
          style={{ background: '#22c55e', borderColor: '#16a34a' }}
          onClick={() => notify('Bon de préparation validé ! Prêt pour affectation et chargement du livreur.')}
        >
          <CheckCircle2 size={16} /> Valider la préparation tournée
        </button>
      </div>

      {/* KPI Cards */}
      <div className="metric-grid">
        <div className="metric-card metric-blue">
          <div className="metric-top">
            <span>Progression Préparation</span>
            <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <PackageCheck size={16} />
            </div>
          </div>
          <div className="metric-number">
            {totalPrepared} / {totalRequested} <small>unités</small>
          </div>
          <div className="metric-foot">
            <span className="metric-change change-up">{Math.round((totalPrepared / totalRequested) * 100)}%</span>
            <span>Articles préparés</span>
          </div>
        </div>

        <div className="metric-card metric-amber">
          <div className="metric-top">
            <span>Articles Manquants</span>
            <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-number">{totalRequested - totalPrepared} <small>unités</small></div>
          <div className="metric-foot">
            <span>Reliquat à signaler</span>
          </div>
        </div>

        <div className="metric-card metric-cyan">
          <div className="metric-top">
            <span>Commandes concernées</span>
            <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <Truck size={16} />
            </div>
          </div>
          <div className="metric-number">2 <small>clients</small></div>
          <div className="metric-foot">
            <span>BatiPro Maroc & Atlas Équipements</span>
          </div>
        </div>

        <div className="metric-card metric-green">
          <div className="metric-top">
            <span>Statut Tournée</span>
            <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              <Scan size={16} />
            </div>
          </div>
          <div className="metric-number" style={{ fontSize: '18px' }}>En préparation</div>
          <div className="metric-foot">
            <span>Départ prévu 11h30</span>
          </div>
        </div>
      </div>

      {/* Interactive Barcode Scanner Box */}
      <section
        className="panel"
        style={{
          margin: '14px 0',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.04))',
          borderColor: 'rgba(59,130,246,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#3b82f6', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <Barcode size={22} />
            </div>
            <div>
              <b style={{ fontSize: '13px', display: 'block' }}>Scan Code-Barres Douchette / Caméra</b>
              <small style={{ color: 'var(--muted)' }}>Scannez ou cliquez sur les boutons de simulation rapide pour tester.</small>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
            <input
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Scanner ou saisir code EAN..."
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '6px',
                padding: '0 12px',
                border: '1px solid var(--line)',
                background: 'var(--navy-2)',
                color: 'var(--text)',
              }}
            />
            <button className="button-primary" onClick={() => handleScan()}>
              <Scan size={14} /> Valider scan
            </button>
          </div>
        </div>

        {/* Quick simulator buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Simuler scan article :</span>
          {items.map((it) => (
            <button
              key={it.id}
              className="button-secondary"
              style={{ fontSize: '10.5px', height: '26px', padding: '0 8px' }}
              onClick={() => handleScan(it.barcode)}
            >
              +1 {it.name.split(' ')[0]} ({it.barcode.slice(-4)})
            </button>
          ))}
        </div>

        {scanMessage && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: scanMessage.ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: scanMessage.ok ? '#22c55e' : '#ef4444',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {scanMessage.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {scanMessage.text}
          </div>
        )}
      </section>

      {/* Preparation List Table */}
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">ARTICLES DU BON DE PRÉPARATION</span>
            <h2>Liste ordonnée par emplacement entrepôt</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {items.length} références à préparer
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>EMPLACEMENT</th>
                <th>DÉSIGNATION & CODE-BARRES</th>
                <th>COMMANDE & DESTINATAIRE</th>
                <th>DEMANDÉ</th>
                <th>PRÉPARÉ REÇU</th>
                <th>MANQUANT / ÉCART</th>
                <th>STATUT PRÉPARATION</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const missing = it.requested_qty - it.prepared_qty;
                return (
                  <tr key={it.id}>
                    <td>
                      <b style={{ color: '#38bdf8' }}>{it.location}</b>
                    </td>
                    <td>
                      <b className="table-main">{it.name}</b>
                      <small style={{ display: 'block', color: 'var(--muted)', fontFamily: 'var(--app-font-mono)' }}>
                        EAN: {it.barcode}
                      </small>
                    </td>
                    <td>
                      <span className="table-ref">{it.order_ref}</span>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>{it.client}</small>
                    </td>
                    <td>
                      <b style={{ fontSize: '13px' }}>{it.requested_qty}</b>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="0"
                          max={it.requested_qty}
                          value={it.prepared_qty}
                          onChange={(e) => setDirectQty(it.id, Number(e.target.value))}
                          style={{
                            width: '54px',
                            height: '30px',
                            textAlign: 'center',
                            borderRadius: '4px',
                            border: '1px solid var(--line)',
                            background: 'var(--navy-2)',
                            color: 'var(--text)',
                            fontWeight: 700,
                          }}
                        />
                        <button
                          className="button-secondary"
                          style={{ height: '30px', padding: '0 8px', fontSize: '11px' }}
                          onClick={() => setDirectQty(it.id, it.requested_qty)}
                          title="Marquer comme complet"
                        >
                          Max
                        </button>
                      </div>
                    </td>
                    <td>
                      {missing > 0 ? (
                        <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '12px' }}>
                          −{missing} manquant(s)
                        </span>
                      ) : (
                        <span style={{ color: '#22c55e', fontSize: '12px' }}>0 (Complet)</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          it.status === 'ok'
                            ? 'status-green'
                            : it.status === 'short'
                            ? 'status-red'
                            : 'status-amber'
                        }`}
                      >
                        <i /> {it.status === 'ok' ? 'Complet' : it.status === 'short' ? 'Incomplet' : 'À préparer'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
