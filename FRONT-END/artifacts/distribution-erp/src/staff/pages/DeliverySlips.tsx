import { useState } from 'react';
import {
  FileCheck, Search, Filter, Plus, CheckCircle2, Truck,
  Printer, Eye, Calendar, User, Building2, Check,
} from 'lucide-react';
import { formatMoney } from '../api';

interface DeliverySlipItem {
  id: number;
  ref: string;
  order_ref: string;
  customer: string;
  city: string;
  driver: string;
  truck_plate: string;
  packages_count: number;
  date: string;
  status: 'En préparation' | 'Chargé' | 'En tournée' | 'Livré & Signé' | 'Litige';
  pod_signed: boolean;
  total_ttc: number;
}

const INITIAL_SLIPS: DeliverySlipItem[] = [
  { id: 1, ref: 'BL-2025-0318', order_ref: 'CMD-2403', customer: 'Comptoir Al Amal', city: 'Fès', driver: 'Youssef Aït (Chauffeur Nord)', truck_plate: '28-A-45890', packages_count: 8, date: 'Aujourd’hui', status: 'En tournée', pod_signed: false, total_ttc: 32100 },
  { id: 2, ref: 'BL-2025-0317', order_ref: 'CMD-2405', customer: 'BatiPro Maroc', city: 'Rabat', driver: 'Karim Bennani (Chauffeur Centre)', truck_plate: '1-B-12903', packages_count: 4, date: 'Aujourd’hui', status: 'Chargé', pod_signed: false, total_ttc: 18420.5 },
  { id: 3, ref: 'BL-2025-0316', order_ref: 'CMD-2402', customer: 'Nord Industrie', city: 'Tanger', driver: 'Mehdi Lahlou (Chauffeur Nord)', truck_plate: '28-A-45890', packages_count: 2, date: 'Hier', status: 'Livré & Signé', pod_signed: true, total_ttc: 6280 },
  { id: 4, ref: 'BL-2025-0315', order_ref: 'CMD-2401', customer: 'Quincaillerie Saada', city: 'Agadir', driver: 'Amine Rida (Chauffeur Sud)', truck_plate: '33-D-78120', packages_count: 6, date: 'Hier', status: 'Livré & Signé', pod_signed: true, total_ttc: 14950 },
  { id: 5, ref: 'BL-2025-0314', order_ref: 'CMD-2399', customer: 'Chantiers El Idrissi', city: 'Kénitra', driver: 'Karim Bennani (Chauffeur Centre)', truck_plate: '1-B-12903', packages_count: 12, date: '25 Fév', status: 'Livré & Signé', pod_signed: true, total_ttc: 51700 },
];

export default function DeliverySlips({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [slips, setSlips] = useState<DeliverySlipItem[]>(INITIAL_SLIPS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<DeliverySlipItem | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSign(id: number) {
    setSlips((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Livré & Signé', pod_signed: true } : s))
    );
    notify('Bon de livraison validé et signé par le client.');
  }

  const filtered = slips.filter((s) => {
    const matchQ =
      s.ref.toLowerCase().includes(query.toLowerCase()) ||
      s.order_ref.toLowerCase().includes(query.toLowerCase()) ||
      s.customer.toLowerCase().includes(query.toLowerCase()) ||
      s.driver.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || s.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">DISTRIBUTION & LOGISTIQUE / BONS DE LIVRAISON (BL)</div>
          <h1>Bons de Livraison (BL)</h1>
          <p>Générez, imprimez et contrôlez les bons d'expédition remis aux chauffeurs avec preuve de dépôt (POD).</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Imprimer registre
          </button>
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-box">
          <span>Bons Émis</span>
          <strong className="blue">{slips.length} BL</strong>
        </div>
        <div className="summary-box">
          <span>En Cours de Tournée</span>
          <strong className="amber">{slips.filter((s) => s.status === 'En tournée' || s.status === 'Chargé').length} BL</strong>
        </div>
        <div className="summary-box">
          <span>Livrés & Signés (POD)</span>
          <strong className="green">{slips.filter((s) => s.pod_signed).length} signés</strong>
        </div>
        <div className="summary-box">
          <span>Valeur Marchandise en Transit</span>
          <strong className="neutral">{formatMoney(slips.filter((s) => s.status === 'En tournée').reduce((a, s) => a + s.total_ttc, 0))}</strong>
        </div>
      </div>

      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">REGISTRE DES BONS DE LIVRAISON</span>
            <h2>Tous les BL d'expédition</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} BL
          </div>
        </div>

        <div className="table-tools">
          <div className="tool-actions" style={{ width: '100%', display: 'flex', gap: 12 }}>
            <label className="search-field" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par n° de BL, commande, client ou chauffeur…"
              />
            </label>

            <select
              className="select-compact"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="all">Tous les statuts</option>
              <option value="En tournée">En tournée</option>
              <option value="Chargé">Chargé</option>
              <option value="Livré & Signé">Livré & Signé</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>N° BON LIVRAISON</th>
                <th>COMMANDE LIÉE</th>
                <th>CLIENT & DESTINATION</th>
                <th>CHAUFFEUR & VÉHICULE</th>
                <th>COLIS</th>
                <th>MONTANT TTC</th>
                <th>STATUT & PREUVE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="table-ref">{s.ref}</span>
                    <small className="under-ref">{s.date}</small>
                  </td>
                  <td>
                    <b>{s.order_ref}</b>
                  </td>
                  <td>
                    <b className="table-main">{s.customer}</b>
                    <small>{s.city}</small>
                  </td>
                  <td>
                    <span>{s.driver}</span>
                    <small>Camion : {s.truck_plate}</small>
                  </td>
                  <td>
                    <b>{s.packages_count} colis</b>
                  </td>
                  <td className="table-amount">{formatMoney(s.total_ttc)}</td>
                  <td>
                    <span className={`status-pill ${
                      s.status === 'Livré & Signé' ? 'status-green' :
                      s.status === 'En tournée' ? 'status-blue' : 'status-amber'
                    }`}>
                      <i /> {s.status}
                    </span>
                    {s.pod_signed && (
                      <small style={{ color: '#059669', display: 'block', marginTop: 2, fontWeight: 700 }}>
                        ✓ Signature reçue
                      </small>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!s.pod_signed && (
                        <button
                          className="button-primary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleSign(s.id)}
                        >
                          <Check size={12} /> Confirmer POD
                        </button>
                      )}
                      <button
                        className="button-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => setSelectedSlip(s)}
                      >
                        <Eye size={12} /> Aperçu BL
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Slip Modal View */}
      {selectedSlip && (
        <div className="modal-backdrop" onClick={() => setSelectedSlip(null)}>
          <div className="record-modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">BON DE LIVRAISON</span>
                <h2>{selectedSlip.ref}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedSlip(null)}>✕</button>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'var(--bg-subtle, #f8fafc)', padding: 12, borderRadius: 8 }}>
                <p><strong>Client :</strong> {selectedSlip.customer} ({selectedSlip.city})</p>
                <p><strong>Commande :</strong> {selectedSlip.order_ref}</p>
                <p><strong>Transport :</strong> {selectedSlip.driver} - {selectedSlip.truck_plate}</p>
                <p><strong>Colisage :</strong> {selectedSlip.packages_count} colis préparés</p>
                <p><strong>Total marchandise TTC :</strong> {formatMoney(selectedSlip.total_ttc)}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setSelectedSlip(null)}>Fermer</button>
              <button type="button" className="button-primary" onClick={() => window.print()}>
                <Printer size={15} /> Imprimer BL
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-note"><Check size={16} />{toast}</div>}
    </div>
  );
}
