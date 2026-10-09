import { useState, useEffect } from 'react';
import {
  Building2, MapPin, Phone, Mail, Globe, UserCheck, MessageCircle,
  Loader2, Check, Save, ShieldCheck, CreditCard, Sparkles,
  Briefcase, PhoneCall,
} from 'lucide-react';
import { api, ApiError, type CustomerUser, type CommercialOption } from '../api';
import { PageHeader } from '../CustomerApp';

export default function Profile({ user, onUpdated }: { user: CustomerUser; onUpdated: (u: CustomerUser) => void }) {
  const [form, setForm] = useState({
    company: user.company ?? '',
    ice: user.ice ?? '',
    city: user.city ?? '',
    address: user.address ?? '',
    phone: user.phone ?? '',
    locale: user.locale ?? 'fr',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Commercial selection state
  const [commercials, setCommercials] = useState<CommercialOption[]>([]);
  const [selectedCommercialId, setSelectedCommercialId] = useState<number | ''>(user.commercial?.id ?? '');
  const [showCommercialSelector, setShowCommercialSelector] = useState(false);
  const [savingComm, setSavingComm] = useState(false);
  const [commSaved, setCommSaved] = useState(false);
  const [commError, setCommError] = useState<string | null>(null);

  useEffect(() => {
    api.getCommercials().then((list) => {
      if (Array.isArray(list)) setCommercials(list);
    }).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await api.updateProfile(form);
      onUpdated(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignCommercial() {
    if (!selectedCommercialId) return;
    setSavingComm(true);
    setCommError(null);
    try {
      const res = await api.chooseCommercial({ commercial_id: Number(selectedCommercialId) });
      onUpdated(res.data);
      setCommSaved(true);
      setShowCommercialSelector(false);
      setTimeout(() => setCommSaved(false), 2000);
    } catch (err: any) {
      setCommError(err?.message || 'Erreur lors de l’assignation du commercial.');
    } finally {
      setSavingComm(false);
    }
  }

  // Pre-filled WhatsApp message for commercial
  const waPhone = user.commercial?.phone || user.phone || '';
  const waCleanPhone = waPhone.replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(
    `Bonjour, je suis le client ${user.company || user.name} (Code: ${user.code}). J'ai une question concernant mon compte ou une commande.`
  );
  const waLink = waCleanPhone ? `https://wa.me/${waCleanPhone}?text=${waText}` : '#';

  // Financial Encours calculations
  const creditLimit = user.credit_limit || 50000;
  const currentBalance = user.current_balance || 0;
  const creditAvailable = Math.max(0, creditLimit - currentBalance);
  const creditUsagePct = Math.min(100, Math.round((currentBalance / creditLimit) * 100));

  return (
    <div className="cx-page">
      <PageHeader
        kicker="ESPACE ENTREPRISE B2B"
        title="Profil & Compte Professionnel"
        description="Gérez les coordonnées de votre société, vos identifiants fiscaux marocains et votre commercial dédié."
      />

      {/* Corporate Verification Pill Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: 'var(--cx-surface)',
        border: '1px solid var(--cx-border)',
        borderRadius: 'var(--cx-radius)',
        padding: '14px 20px',
        boxShadow: 'var(--cx-shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="cx-badge cx-badge-green">
            <ShieldCheck size={14} /> Compte B2B Vérifié
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cx-text)' }}>
            Code Client : <code>{user.code}</code>
          </span>
          {user.ice && (
            <span style={{ fontSize: 12, color: 'var(--cx-muted)' }}>
              ICE : <b>{user.ice}</b>
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="cx-badge-tier">Grille : {user.price_tier.toUpperCase()}</span>
          <span className="cx-badge cx-badge-blue">TVA Récupérable 20%</span>
        </div>
      </div>

      <div className="cx-profile-grid">
        {/* Left Column: Corporate & Legal Form */}
        <form className="cx-panel" onSubmit={submit}>
          <div className="cx-panel-head">
            <h2><Building2 size={16} /> Identité de l'Entreprise</h2>
            <span style={{ fontSize: 11.5, color: 'var(--cx-muted)' }}>Mentions légales requises</span>
          </div>

          {error && <div className="cx-alert cx-alert-error">{error}</div>}
          {saved && <div className="cx-alert cx-alert-success"><Check size={16} /> Modifications enregistrées avec succès.</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <label className="cx-field">
              <span>Raison Sociale / Société *</span>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
                placeholder="Ex: Comptoir Général du Maroc SARL"
              />
            </label>

            <label className="cx-field">
              <span>Numéro ICE (15 Chiffres) *</span>
              <input
                value={form.ice}
                onChange={(e) => setForm({ ...form, ice: e.target.value })}
                placeholder="Ex: 002134567000089"
                maxLength={15}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <label className="cx-field">
              <span><MapPin size={13} /> Ville</span>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Casablanca, Rabat, Fès..."
              />
            </label>

            <label className="cx-field">
              <span><MapPin size={13} /> Adresse du Dépôt / Magasin</span>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="N°, Boulevard, Zone Industrielle..."
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <label className="cx-field">
              <span><Phone size={13} /> Téléphone de Contact</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+212 5 22 00 00 00"
              />
            </label>

            <label className="cx-field">
              <span><Globe size={13} /> Langue des Documents</span>
              <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })}>
                <option value="fr">Français (Factures & Bons en FR)</option>
                <option value="ar">العربية (باللغة العربية)</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button className="cx-btn cx-btn-primary" type="submit" disabled={saving}>
              {saving ? <><Loader2 className="cx-spin" size={16} /> Enregistrement…</> : <><Save size={16} /> Enregistrer le profil</>}
            </button>
          </div>
        </form>

        {/* Right Column: Financial Encours & Commercial Référent */}
        <div className="cx-profile-side">
          {/* Financial Encours Card */}
          <div className="cx-panel">
            <div className="cx-panel-head">
              <h2><CreditCard size={16} /> Conditions & Crédit B2B</h2>
              <span className="cx-badge cx-badge-green" style={{ fontSize: 11 }}>Autorisé</span>
            </div>

            <div className="cx-credit-meter">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                <span>Encours Utilisé : {currentBalance.toLocaleString('fr-FR')} DH</span>
                <span style={{ color: 'var(--cx-brand)' }}>Plafond : {creditLimit.toLocaleString('fr-FR')} DH</span>
              </div>
              <div className="cx-credit-bar-wrap">
                <div
                  className="cx-credit-bar-fill"
                  style={{
                    width: `${creditUsagePct}%`,
                    background: creditUsagePct > 80 ? '#dc2626' : undefined,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--cx-muted)' }}>
                <span>{creditUsagePct}% consommé</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>
                  Disponible : {creditAvailable.toLocaleString('fr-FR')} DH
                </span>
              </div>
            </div>

            <div className="cx-info-row">
              <span>Mode de règlement conventionné</span>
              <b>Chèque / Virement à 30 jours</b>
            </div>
            <div className="cx-info-row">
              <span>Délai de livraison garanti</span>
              <b>24 à 48 Heures ouvrées</b>
            </div>
            <div className="cx-info-row">
              <span>Seuil Franco de port</span>
              <b>1 000 DH HT</b>
            </div>
          </div>

          {/* Dedicated Sales Rep Card */}
          <div className="cx-panel">
            <div className="cx-panel-head">
              <h2><UserCheck size={16} /> Commercial Référent</h2>
              <button
                type="button"
                className="cx-btn cx-btn-ghost sm"
                style={{ padding: '3px 8px', fontSize: 11 }}
                onClick={() => setShowCommercialSelector(!showCommercialSelector)}
              >
                {showCommercialSelector ? 'Fermer' : 'Changer'}
              </button>
            </div>

            {commSaved && (
              <div className="cx-alert cx-alert-success" style={{ marginBottom: 10 }}>
                <Check size={14} /> Commercial assigné avec succès.
              </div>
            )}
            {commError && (
              <div className="cx-alert cx-alert-error" style={{ marginBottom: 10 }}>
                {commError}
              </div>
            )}

            {showCommercialSelector ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--cx-text-secondary)' }}>
                  Sélectionnez votre conseiller commercial régional :
                </label>
                <select
                  value={selectedCommercialId}
                  onChange={(e) => setSelectedCommercialId(e.target.value ? Number(e.target.value) : '')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--cx-border)',
                    fontSize: 13,
                    background: 'var(--cx-bg)',
                    color: 'var(--cx-text)',
                  }}
                >
                  <option value="">-- Choisir un commercial --</option>
                  {commercials.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · Réf: {c.commercial_code || `COM-${c.id}`}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="cx-btn cx-btn-ghost sm"
                    onClick={() => setShowCommercialSelector(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="cx-btn cx-btn-primary sm"
                    onClick={handleAssignCommercial}
                    disabled={savingComm || !selectedCommercialId}
                  >
                    {savingComm ? <Loader2 className="cx-spin" size={13} /> : <Check size={13} />}
                    Confirmer le choix
                  </button>
                </div>
              </div>
            ) : user.commercial ? (
              <>
                <div className="cx-commercial">
                  <span className="cx-avatar lg">
                    {user.commercial.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <b style={{ fontSize: 14.5 }}>{user.commercial.name}</b>
                      {(user.commercial_reference || user.commercial.commercial_code) && (
                        <span style={{
                          background: 'var(--cx-brand-soft)',
                          color: 'var(--cx-brand)',
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 4,
                        }}>
                          {user.commercial_reference || user.commercial.commercial_code}
                        </span>
                      )}
                    </div>
                    <small style={{ color: 'var(--cx-muted)', display: 'block', marginTop: 2 }}>
                      {user.commercial.email}
                    </small>
                    {user.commercial.phone && (
                      <small style={{ color: 'var(--cx-text-secondary)', display: 'block' }}>
                        {user.commercial.phone}
                      </small>
                    )}
                  </div>
                </div>

                <div className="cx-commercial-actions">
                  <a
                    className="cx-btn cx-btn-emerald"
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                  <a
                    className="cx-btn cx-btn-ghost"
                    href={`mailto:${user.commercial.email}?subject=Demande client ${encodeURIComponent(user.company || user.name)}`}
                  >
                    <Mail size={15} /> Email
                  </a>
                  {user.commercial.phone && (
                    <a className="cx-btn cx-btn-ghost" href={`tel:${user.commercial.phone}`}>
                      <PhoneCall size={15} /> Appeler
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--cx-muted)' }}>
                <Briefcase size={28} style={{ margin: '0 auto 8px', opacity: 0.7 }} />
                <p style={{ fontSize: 13, margin: '0 0 12px' }}>
                  Aucun commercial n'est actuellement assigné à votre compte.
                </p>
                <button
                  type="button"
                  className="cx-btn cx-btn-primary sm"
                  onClick={() => setShowCommercialSelector(true)}
                >
                  <Sparkles size={14} /> Choisir mon conseiller commercial
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

