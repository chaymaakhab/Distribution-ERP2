import { useState } from 'react';
import {
  Settings, Building2, Receipt, Shield, Bell, Save, CheckCircle2,
  Database, RefreshCw, Smartphone,
} from 'lucide-react';

export default function SystemSettings() {
  const [toast, setToast] = useState<string | null>(null);

  // Company Profile
  const [companyName, setCompanyName] = useState('Hercules Distribution SARL');
  const [ice, setIce] = useState('003147829000064');
  const [ifNumber, setIfNumber] = useState('40192837');
  const [rcNumber, setRcNumber] = useState('149208 Casablanca');
  const [cnss, setCnss] = useState('8920194');
  const [capital, setCapital] = useState('2 000 000 DH');
  const [address, setAddress] = useState('Zone Industrielle Aïn Sebaâ, Casablanca');
  const [phone, setPhone] = useState('+212 522 34 78 90');
  const [email, setEmail] = useState('contact@hercules-erp.ma');

  // Business Rules
  const [defaultCurrency, setDefaultCurrency] = useState('DH (MAD)');
  const [minOrderAmount, setMinOrderAmount] = useState('1000');
  const [inactivityAlertDays, setInactivityAlertDays] = useState('15');
  const [overdueAlertDays, setOverdueAlertDays] = useState('7');

  // VAT rates enabled
  const [vatRates, setVatRates] = useState([
    { rate: 20, label: 'Taux normal (20%)', applies: 'Matériel, Électroportatif, Outillage standard', active: true },
    { rate: 14, label: 'Taux réduit (14%)', applies: 'Pompage, Plomberie & matériel agricole', active: true },
    { rate: 10, label: 'Taux spécifique (10%)', applies: 'Prestations de transport & restauration', active: false },
    { rate: 7, label: 'Taux de base (7%)', applies: 'Produits de première nécessité', active: false },
    { rate: 0, label: 'Exonéré (0%)', applies: 'Exportations & régimes particuliers', active: true },
  ]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    notify('Paramètres de l’entreprise et mentions légales enregistrés avec succès.');
  }

  function handleSaveRules(e: React.FormEvent) {
    e.preventDefault();
    notify('Règles de gestion et alertes mises à jour.');
  }

  return (
    <div className="module-page settings-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONFIGURATION ERP <span className="heading-slash">/</span> PARAMÈTRES GÉNÉRAUX</div>
          <h1>Paramètres du Système</h1>
          <p>Identifiants fiscaux légaux marocains, barèmes TVA, seuils de commande et alertes de relance.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '16px' }}>
        {/* Left Column: Legal Company Information */}
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-heading" style={{ marginBottom: '16px' }}>
            <div>
              <span className="eyebrow">IDENTIFIANTS LÉGAUX MAROCAINS</span>
              <h2>Fiche Société & Mentions Légales</h2>
            </div>
            <span className="status-pill status-green">Actif</span>
          </div>

          <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="field-label">
              Raison Sociale
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field-label">
                Identifiant Commun de l’Entreprise (ICE)
                <input value={ice} onChange={(e) => setIce(e.target.value)} required />
              </label>
              <label className="field-label">
                Identifiant Fiscal (IF)
                <input value={ifNumber} onChange={(e) => setIfNumber(e.target.value)} required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field-label">
                Registre de Commerce (RC)
                <input value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} required />
              </label>
              <label className="field-label">
                N° CNSS
                <input value={cnss} onChange={(e) => setCnss(e.target.value)} required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field-label">
                Capital Social (DH)
                <input value={capital} onChange={(e) => setCapital(e.target.value)} />
              </label>
              <label className="field-label">
                Devise Principale
                <input value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} />
              </label>
            </div>

            <label className="field-label">
              Adresse du Siège Social
              <input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field-label">
                Téléphone Standard
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label className="field-label">
                Email Officiel
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
            </div>

            <div style={{ marginTop: '8px' }}>
              <button className="button-primary" type="submit">
                <Save size={15} /> Enregistrer la fiche société
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Business Rules, Taxes & Sync */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Moroccan VAT Rates */}
          <section className="panel" style={{ padding: '20px' }}>
            <div className="panel-heading" style={{ marginBottom: '14px' }}>
              <div>
                <span className="eyebrow">FISCALITÉ MAROC</span>
                <h2>Taux de TVA Applicables</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {vatRates.map((v, i) => (
                <div
                  key={v.rate}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '7px',
                    border: '1px solid var(--line)',
                    background: 'var(--navy-2)',
                  }}
                >
                  <div>
                    <b style={{ fontSize: '12.5px' }}>{v.label}</b>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '11px' }}>
                      {v.applies}
                    </small>
                  </div>
                  <button
                    type="button"
                    className={`button-secondary ${v.active ? 'active-tab' : ''}`}
                    style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
                    onClick={() => {
                      setVatRates((prev) =>
                        prev.map((item, idx) => (idx === i ? { ...item, active: !item.active } : item))
                      );
                      notify(`Taux TVA ${v.rate}% ${!v.active ? 'activé' : 'désactivé'}.`);
                    }}
                  >
                    {v.active ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Business & Automation Rules (CDC) */}
          <section className="panel" style={{ padding: '20px' }}>
            <div className="panel-heading" style={{ marginBottom: '14px' }}>
              <div>
                <span className="eyebrow">AUTOMATISATIONS DU CDC</span>
                <h2>Règles & Alertes Automatiques</h2>
              </div>
            </div>

            <form onSubmit={handleSaveRules} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="field-label">
                Montant minimum par commande client (DH)
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                />
              </label>

              <label className="field-label">
                Délai de notification client inactif (jours)
                <input
                  type="number"
                  value={inactivityAlertDays}
                  onChange={(e) => setInactivityAlertDays(e.target.value)}
                />
              </label>

              <label className="field-label">
                Délai de relance facture impayée (J+X jours après échéance)
                <input
                  type="number"
                  value={overdueAlertDays}
                  onChange={(e) => setOverdueAlertDays(e.target.value)}
                />
              </label>

              <button className="button-primary" type="submit" style={{ marginTop: '6px' }}>
                <Save size={15} /> Mettre à jour les règles
              </button>
            </form>
          </section>
        </div>
      </div>

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
